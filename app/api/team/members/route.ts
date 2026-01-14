import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view all team members
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view team members" },
        { status: 403 }
      );
    }

    // Get account with seat info and members
    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        adminSeats: true,
        groomerSeats: true,
        subscriptionPlan: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        teamInvitations: {
          where: { status: "PENDING" },
          select: { role: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Calculate seat usage
    const adminCount = account.users.filter((u) => u.role === "ADMIN").length;
    const groomerCount = account.users.filter((u) => u.role === "GROOMER").length;
    const pendingAdminInvites = account.teamInvitations.filter(
      (i) => i.role === "ADMIN"
    ).length;
    const pendingGroomerInvites = account.teamInvitations.filter(
      (i) => i.role === "GROOMER"
    ).length;

    return NextResponse.json({
      members: account.users.map((user) => ({
        ...user,
        isCurrentUser: user.id === session.user.id,
      })),
      seats: {
        admin: {
          total: account.adminSeats,
          used: adminCount,
          pending: pendingAdminInvites,
          available: account.adminSeats - adminCount - pendingAdminInvites,
        },
        groomer: {
          total: account.groomerSeats,
          used: groomerCount,
          pending: pendingGroomerInvites,
          available: account.groomerSeats - groomerCount - pendingGroomerInvites,
        },
      },
      plan: account.subscriptionPlan,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
