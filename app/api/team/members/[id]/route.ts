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

    // Only admins can remove team members
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can remove team members" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Can't remove yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Find the user to remove
    const userToRemove = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToRemove) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify they belong to the same account
    if (userToRemove.accountId !== session.user.accountId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this is the last admin
    if (userToRemove.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          accountId: session.user.accountId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin from the account" },
          { status: 400 }
        );
      }
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
