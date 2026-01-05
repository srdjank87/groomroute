import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/groomer/working-hours-check
 * Check if a given time falls within the groomer's working hours
 * Query params:
 *   - time: HH:MM format (24-hour)
 *   - duration: Optional duration in minutes (to check if appointment end time is within hours)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const timeParam = searchParams.get("time");
    const durationParam = searchParams.get("duration");

    if (!timeParam) {
      return NextResponse.json(
        { error: "Time parameter is required" },
        { status: 400 }
      );
    }

    // Get groomer with their working hours
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
      select: {
        id: true,
        workingHoursStart: true,
        workingHoursEnd: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 404 }
      );
    }

    // Parse times
    const workStart = groomer.workingHoursStart || "08:00";
    const workEnd = groomer.workingHoursEnd || "17:00";

    // Convert times to minutes since midnight for easier comparison
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const appointmentStartMinutes = toMinutes(timeParam);
    const workStartMinutes = toMinutes(workStart);
    const workEndMinutes = toMinutes(workEnd);

    // Calculate end time if duration provided
    const duration = durationParam ? parseInt(durationParam) : 0;
    const appointmentEndMinutes = appointmentStartMinutes + duration;

    // Check if appointment falls within working hours
    const startsBeforeWorkday = appointmentStartMinutes < workStartMinutes;
    const startsAfterWorkday = appointmentStartMinutes >= workEndMinutes;
    const endsAfterWorkday = duration > 0 && appointmentEndMinutes > workEndMinutes;

    const isWithinWorkingHours = !startsBeforeWorkday && !startsAfterWorkday && !endsAfterWorkday;

    // Format times for display (12-hour format)
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    // Calculate how far outside working hours
    let minutesOutside = 0;
    let outsideReason = "";

    if (startsBeforeWorkday) {
      minutesOutside = workStartMinutes - appointmentStartMinutes;
      outsideReason = "before";
    } else if (startsAfterWorkday) {
      minutesOutside = appointmentStartMinutes - workEndMinutes;
      outsideReason = "after";
    } else if (endsAfterWorkday) {
      minutesOutside = appointmentEndMinutes - workEndMinutes;
      outsideReason = "extends_past";
    }

    return NextResponse.json({
      time: timeParam,
      duration,
      workingHours: {
        start: workStart,
        end: workEnd,
        startFormatted: formatTime(workStart),
        endFormatted: formatTime(workEnd),
      },
      isWithinWorkingHours,
      startsBeforeWorkday,
      startsAfterWorkday,
      endsAfterWorkday,
      minutesOutside,
      outsideReason,
    });
  } catch (error) {
    console.error("Working hours check error:", error);
    return NextResponse.json(
      { error: "Failed to check working hours" },
      { status: 500 }
    );
  }
}
