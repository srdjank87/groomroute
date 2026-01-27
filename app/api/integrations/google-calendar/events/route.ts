import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchCalendarEvents } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can access calendar events" },
        { status: 403 }
      );
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Default to next 30 days if not specified
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date();
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const events = await fetchCalendarEvents(
      session.user.accountId,
      startDate,
      endDate
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Fetch calendar events error:", error);

    const message = error instanceof Error ? error.message : "Failed to fetch events";

    // Check for specific error types
    if (message.includes("not connected")) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
