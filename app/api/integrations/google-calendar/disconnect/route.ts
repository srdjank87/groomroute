import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { disconnectGoogleCalendar } from "@/lib/google-calendar";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can disconnect calendar
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can manage integrations" },
        { status: 403 }
      );
    }

    await disconnectGoogleCalendar(session.user.accountId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Calendar disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Calendar" },
      { status: 500 }
    );
  }
}
