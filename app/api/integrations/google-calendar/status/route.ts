import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        googleCalendarAccessRequested: true,
        googleCalendarApproved: true,
        googleCalendarEnabled: true,
        googleCalendarId: true,
      },
    });

    return NextResponse.json({
      accessRequested: account?.googleCalendarAccessRequested ?? null,
      approved: account?.googleCalendarApproved ?? false,
      connected: account?.googleCalendarEnabled ?? false,
      calendarId: account?.googleCalendarId ?? null,
    });
  } catch (error) {
    console.error("Google Calendar status error:", error);
    return NextResponse.json(
      { error: "Failed to get calendar status" },
      { status: 500 }
    );
  }
}
