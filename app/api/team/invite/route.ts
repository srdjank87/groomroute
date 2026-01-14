import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendTeamInviteEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can invite team members
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can invite team members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = body as {
      email: string;
      role: "ADMIN" | "GROOMER";
    };

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!role || !["ADMIN", "GROOMER"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be ADMIN or GROOMER" },
        { status: 400 }
      );
    }

    // Get account with seat info
    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      include: {
        users: {
          select: { id: true, role: true, email: true },
        },
        teamInvitations: {
          where: { status: "PENDING" },
          select: { id: true, role: true, email: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if Pro plan
    if (account.subscriptionPlan !== "PRO") {
      return NextResponse.json(
        { error: "Team invitations require Pro plan" },
        { status: 403 }
      );
    }

    // Check if email already exists as a user in this account
    const existingUser = account.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already a team member" },
        { status: 400 }
      );
    }

    // Check if invitation already pending for this email
    const existingInvitation = account.teamInvitations.find(
      (i) => i.email.toLowerCase() === email.toLowerCase()
    );
    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation is already pending for this email" },
        { status: 400 }
      );
    }

    // Count current seats used
    const adminUsers = account.users.filter((u) => u.role === "ADMIN").length;
    const groomerUsers = account.users.filter((u) => u.role === "GROOMER").length;
    const pendingAdminInvites = account.teamInvitations.filter(
      (i) => i.role === "ADMIN"
    ).length;
    const pendingGroomerInvites = account.teamInvitations.filter(
      (i) => i.role === "GROOMER"
    ).length;

    // Check seat availability
    if (role === "ADMIN") {
      const totalAdminUsed = adminUsers + pendingAdminInvites;
      if (totalAdminUsed >= account.adminSeats) {
        return NextResponse.json(
          {
            error: `No admin seats available. You have ${account.adminSeats} admin seat(s) and ${totalAdminUsed} are in use or pending.`,
            upgradeRequired: true,
          },
          { status: 400 }
        );
      }
    } else {
      const totalGroomerUsed = groomerUsers + pendingGroomerInvites;
      if (totalGroomerUsed >= account.groomerSeats) {
        return NextResponse.json(
          {
            error: `No groomer seats available. You have ${account.groomerSeats} groomer seat(s) and ${totalGroomerUsed} are in use or pending.`,
            upgradeRequired: true,
          },
          { status: 400 }
        );
      }
    }

    // Generate unique token
    const token = randomBytes(32).toString("hex");

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await prisma.teamInvitation.create({
      data: {
        accountId: account.id,
        email: email.toLowerCase(),
        role,
        invitedBy: session.user.id,
        token,
        expiresAt,
      },
    });

    // Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    // Get inviter's name
    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    await sendTeamInviteEmail(
      email.toLowerCase(),
      inviter?.name || "Your team",
      account.name,
      role,
      token
    );

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      inviteLink,
    });
  } catch (error) {
    console.error("Team invite error:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
