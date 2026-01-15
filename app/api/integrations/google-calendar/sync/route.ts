import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncAppointmentsToCalendar } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can trigger sync
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can sync calendar" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startDate, endDate } = body as {
      startDate?: string;
      endDate?: string;
    };

    // Default to syncing next 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const result = await syncAppointmentsToCalendar(
      session.user.accountId,
      start,
      end
    );

    return NextResponse.json({
      success: true,
      synced: result.synced,
      failed: result.failed,
    });
  } catch (error) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync appointments" },
      { status: 500 }
    );
  }
}
