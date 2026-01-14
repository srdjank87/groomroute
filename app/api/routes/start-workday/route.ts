import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toZonedTime } from "date-fns-tz";
import { getUserGroomerId } from "@/lib/get-user-groomer";

/**
 * POST /api/routes/start-workday
 * Mark the workday as started for today
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Get groomer details including account timezone and defaults
    const groomer = await prisma.groomer.findUnique({
      where: { id: groomerId },
      select: {
        defaultHasAssistant: true,
        account: {
          select: {
            timezone: true,
          },
        },
      },
    });

    // Get the account's timezone (default to America/New_York)
    const timezone = groomer?.account?.timezone || "America/New_York";

    // Get today's date based on ACCOUNT'S LOCAL timezone
    // Routes use the same date convention as appointments
    const now = new Date();
    const localNow = toZonedTime(now, timezone);
    const today = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 0, 0, 0, 0));

    // Upsert route for today with workdayStarted = true
    const route = await prisma.route.upsert({
      where: {
        groomerId_routeDate: {
          groomerId,
          routeDate: today,
        },
      },
      update: {
        workdayStarted: true,
      },
      create: {
        accountId,
        groomerId,
        routeDate: today,
        workdayStarted: true,
        hasAssistant: groomer?.defaultHasAssistant ?? false,
        status: "DRAFT",
        provider: "LOCAL",
      },
    });

    return NextResponse.json({
      success: true,
      workdayStarted: true,
    });
  } catch (error) {
    console.error("Start workday error:", error);
    return NextResponse.json(
      { error: "Failed to start workday" },
      { status: 500 }
    );
  }
}
