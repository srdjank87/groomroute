import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/appointments/check-conflict
 * Check if a proposed appointment time conflicts with existing appointments
 *
 * Query params:
 * - date: YYYY-MM-DD format
 * - time: HH:MM format (24-hour)
 * - duration: number of minutes for the appointment
 * - excludeId: (optional) appointment ID to exclude from conflict check (for edits)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const durationStr = searchParams.get("duration");
    const excludeId = searchParams.get("excludeId");

    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr || "90");

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Parse the proposed appointment time
    const [hours, minutes] = time.split(":").map(Number);
    const proposedStart = new Date(`${date}T${time}:00`);
    const proposedEnd = new Date(proposedStart.getTime() + duration * 60 * 1000);

    // Get all appointments for this date
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        pet: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Check for conflicts
    const conflicts: Array<{
      id: string;
      customerName: string;
      petName: string;
      startTime: string;
      endTime: string;
    }> = [];

    for (const apt of existingAppointments) {
      const existingStart = new Date(apt.startAt);
      const existingEnd = new Date(existingStart.getTime() + apt.serviceMinutes * 60 * 1000);

      // Check if times overlap
      // Conflict exists if: proposedStart < existingEnd AND proposedEnd > existingStart
      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        conflicts.push({
          id: apt.id,
          customerName: apt.customer?.name || "Unknown",
          petName: apt.pet?.name || "Unknown",
          startTime: formatTime(existingStart),
          endTime: formatTime(existingEnd),
        });
      }
    }

    const hasConflict = conflicts.length > 0;

    // Find next available time slot if there's a conflict
    let nextAvailable: { time: string; timeFormatted: string } | null = null;

    if (hasConflict) {
      // Get working hours (default 9 AM - 5 PM if not set)
      const workStart = groomer.workingHoursStart
        ? parseInt(groomer.workingHoursStart.split(":")[0])
        : 9;
      const workEnd = groomer.workingHoursEnd
        ? parseInt(groomer.workingHoursEnd.split(":")[0])
        : 17;

      // Build list of busy periods (sorted by start time)
      const busyPeriods = existingAppointments.map((apt) => {
        const start = new Date(apt.startAt);
        const end = new Date(start.getTime() + apt.serviceMinutes * 60 * 1000);
        return { start, end };
      }).sort((a, b) => a.start.getTime() - b.start.getTime());

      // Try to find a gap that fits the requested duration
      // Start from the proposed time and look forward
      let searchStart = new Date(proposedStart);

      // If proposed time is before work start, start from work start
      const workStartToday = new Date(`${date}T${String(workStart).padStart(2, "0")}:00:00`);
      if (searchStart < workStartToday) {
        searchStart = workStartToday;
      }

      const workEndToday = new Date(`${date}T${String(workEnd).padStart(2, "0")}:00:00`);

      for (let i = 0; i <= busyPeriods.length; i++) {
        let gapStart: Date;
        let gapEnd: Date;

        if (i === 0) {
          // Gap before first appointment
          gapStart = searchStart;
          gapEnd = busyPeriods.length > 0 ? busyPeriods[0].start : workEndToday;
        } else if (i === busyPeriods.length) {
          // Gap after last appointment
          gapStart = busyPeriods[i - 1].end;
          gapEnd = workEndToday;
        } else {
          // Gap between appointments
          gapStart = busyPeriods[i - 1].end;
          gapEnd = busyPeriods[i].start;
        }

        // Ensure gap starts at or after our search start
        if (gapStart < searchStart) {
          gapStart = searchStart;
        }

        // Check if this gap is big enough for our appointment
        const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (60 * 1000);

        if (gapDuration >= duration && gapStart < workEndToday) {
          // Found a valid slot!
          // Add 15 min buffer after previous appointment end if applicable
          if (i > 0) {
            const bufferStart = new Date(busyPeriods[i - 1].end.getTime() + 15 * 60 * 1000);
            if (bufferStart > gapStart && bufferStart.getTime() + duration * 60 * 1000 <= gapEnd.getTime()) {
              gapStart = bufferStart;
            }
          }

          // Round to nearest 15 minutes
          const minutes = gapStart.getMinutes();
          const roundedMinutes = Math.ceil(minutes / 15) * 15;
          gapStart.setMinutes(roundedMinutes, 0, 0);

          // Make sure we still fit after rounding
          if (gapStart.getTime() + duration * 60 * 1000 <= gapEnd.getTime() &&
              gapStart.getTime() + duration * 60 * 1000 <= workEndToday.getTime()) {
            const timeStr = `${String(gapStart.getHours()).padStart(2, "0")}:${String(gapStart.getMinutes()).padStart(2, "0")}`;
            nextAvailable = {
              time: timeStr,
              timeFormatted: formatTime(gapStart),
            };
            break;
          }
        }
      }
    }

    return NextResponse.json({
      hasConflict,
      conflicts,
      proposedStart: formatTime(proposedStart),
      proposedEnd: formatTime(proposedEnd),
      date,
      time,
      duration,
      nextAvailable,
    });
  } catch (error) {
    console.error("Check conflict error:", error);
    return NextResponse.json(
      { error: "Failed to check conflicts" },
      { status: 500 }
    );
  }
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
