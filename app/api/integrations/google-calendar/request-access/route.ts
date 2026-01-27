import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can request calendar access
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can request integrations" },
        { status: 403 }
      );
    }

    // Check if already requested or approved
    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        googleCalendarAccessRequested: true,
        googleCalendarApproved: true,
        googleCalendarEnabled: true,
      },
    });

    if (account?.googleCalendarEnabled) {
      return NextResponse.json(
        { error: "Google Calendar is already connected" },
        { status: 400 }
      );
    }

    if (account?.googleCalendarApproved) {
      return NextResponse.json(
        { error: "Access already approved. You can now connect." },
        { status: 400 }
      );
    }

    if (account?.googleCalendarAccessRequested) {
      return NextResponse.json(
        { error: "Access already requested. We'll notify you when approved." },
        { status: 400 }
      );
    }

    // Record the access request
    await prisma.account.update({
      where: { id: session.user.accountId },
      data: {
        googleCalendarAccessRequested: new Date(),
      },
    });

    // TODO: Send notification to admin (email/Slack) about new request
    // For now, we'll rely on the admin dashboard to show pending requests

    return NextResponse.json({
      success: true,
      message: "Access requested. We'll add you to the beta and notify you when ready.",
    });
  } catch (error) {
    console.error("Google Calendar request access error:", error);
    return NextResponse.json(
      { error: "Failed to request access" },
      { status: 500 }
    );
  }
}
