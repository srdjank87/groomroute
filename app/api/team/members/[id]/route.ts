import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update team member (e.g., link to groomer profile)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update team members
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update team members" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { groomerId } = body as { groomerId: string | null };

    // Find the user to update
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify they belong to the same account
    if (userToUpdate.accountId !== session.user.accountId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If linking to a groomer, verify the groomer exists and belongs to the account
    if (groomerId) {
      const groomer = await prisma.groomer.findFirst({
        where: {
          id: groomerId,
          accountId: session.user.accountId,
        },
      });

      if (!groomer) {
        return NextResponse.json({ error: "Groomer profile not found" }, { status: 404 });
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { groomerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        groomerId: true,
        groomer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update team member error:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

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
