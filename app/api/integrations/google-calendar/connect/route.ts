import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can connect calendar
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can manage integrations" },
        { status: 403 }
      );
    }

    const authUrl = getAuthUrl(session.user.accountId);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Google Calendar connect error:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
