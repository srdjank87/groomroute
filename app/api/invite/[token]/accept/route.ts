import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Accept invitation and create user account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { name, password } = body as {
      name: string;
      password: string;
    };

    // Validate inputs
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        account: {
          include: {
            users: { select: { role: true } },
            teamInvitations: {
              where: { status: "PENDING" },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    // Check if already accepted or revoked
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: `This invitation has been ${invitation.status.toLowerCase()}` },
        { status: 410 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // Verify seat is still available
    const account = invitation.account;
    const adminCount = account.users.filter((u) => u.role === "ADMIN").length;
    const groomerCount = account.users.filter((u) => u.role === "GROOMER").length;

    // Don't count this invitation in pending since we're about to accept it
    const otherPendingAdmins = account.teamInvitations.filter(
      (i) => i.role === "ADMIN"
    ).length - (invitation.role === "ADMIN" ? 1 : 0);
    const otherPendingGroomers = account.teamInvitations.filter(
      (i) => i.role === "GROOMER"
    ).length - (invitation.role === "GROOMER" ? 1 : 0);

    if (invitation.role === "ADMIN") {
      const totalAdminUsed = adminCount + otherPendingAdmins;
      if (totalAdminUsed >= account.adminSeats) {
        return NextResponse.json(
          { error: "No admin seats available. Please contact the account owner." },
          { status: 400 }
        );
      }
    } else {
      const totalGroomerUsed = groomerCount + otherPendingGroomers;
      if (totalGroomerUsed >= account.groomerSeats) {
        return NextResponse.json(
          { error: "No groomer seats available. Please contact the account owner." },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // For groomer role, try to find a matching groomer profile by email
    let matchingGroomerId: string | null = null;
    if (invitation.role === "GROOMER") {
      const matchingGroomer = await prisma.groomer.findFirst({
        where: {
          accountId: invitation.accountId,
          email: invitation.email,
          isActive: true,
        },
      });
      if (matchingGroomer) {
        matchingGroomerId = matchingGroomer.id;
      }
    }

    // Create user and update invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name: name.trim(),
          password: hashedPassword,
          accountId: invitation.accountId,
          role: invitation.role,
          groomerId: matchingGroomerId, // Auto-link to groomer profile if found
        },
      });

      // Update invitation status
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          acceptedBy: user.id,
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now sign in.",
      email: result.email,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
