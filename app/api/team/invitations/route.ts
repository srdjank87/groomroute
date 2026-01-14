import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view invitations
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view invitations" },
        { status: 403 }
      );
    }

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        accountId: session.user.accountId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        acceptedAt: true,
      },
    });

    // Mark expired invitations
    const now = new Date();
    const processedInvitations = invitations.map((inv) => ({
      ...inv,
      isExpired: inv.status === "PENDING" && new Date(inv.expiresAt) < now,
    }));

    return NextResponse.json({ invitations: processedInvitations });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
