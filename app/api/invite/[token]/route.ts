import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Validate invitation token and return details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        account: {
          select: { name: true },
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

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        businessName: invitation.account.name,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
