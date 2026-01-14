import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can revoke invitations
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can revoke invitations" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Verify it belongs to the same account
    if (invitation.accountId !== session.user.accountId) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Can only revoke pending invitations
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only revoke pending invitations" },
        { status: 400 }
      );
    }

    // Update invitation status to revoked
    await prisma.teamInvitation.update({
      where: { id },
      data: { status: "REVOKED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke invitation error:", error);
    return NextResponse.json(
      { error: "Failed to revoke invitation" },
      { status: 500 }
    );
  }
}
