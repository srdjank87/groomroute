import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/book/available-slots
 * Public endpoint - Get available time slots for a date
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groomerSlug = searchParams.get("groomerSlug");
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const durationParam = searchParams.get("duration"); // Optional: estimated appointment duration in minutes

    if (!groomerSlug) {
      return NextResponse.json(
        { error: "groomerSlug is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "date is required" },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Get groomer by slug
    const groomer = await prisma.groomer.findUnique({
      where: { bookingSlug: groomerSlug },
      select: {
        id: true,
        accountId: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        bookingEnabled: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer not found" },
        { status: 404 }
      );
    }

    if (!groomer.bookingEnabled) {
      return NextResponse.json(
        { error: "Online booking is not available" },
        { status: 403 }
      );
    }

    // Get working hours (default 9 AM - 5 PM if not set)
    const workStart = groomer.workingHoursStart
      ? parseInt(groomer.workingHoursStart.split(":")[0])
      : 9;
    const workEnd = groomer.workingHoursEnd
      ? parseInt(groomer.workingHoursEnd.split(":")[0])
      : 17;

    // Get existing appointments on this date
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        accountId: groomer.accountId,
        groomerId: groomer.id,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Build busy periods with buffer time
    const busyPeriods = existingAppointments
      .map((apt) => {
        const start = new Date(apt.startAt);
        // Add 15 min buffer after each appointment for travel/prep
        const end = new Date(
          start.getTime() + (apt.serviceMinutes + 15) * 60 * 1000
        );
        return { start, end };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // Use provided duration or default to 60 minutes
    // Duration is estimated from pet size/breed on the booking page
    const slotDuration = durationParam ? Math.max(30, Math.min(180, parseInt(durationParam, 10))) : 60;
    const slots: Array<{
      time: string;
      timeFormatted: string;
      available: boolean;
    }> = [];

    // Generate slots every 30 minutes during working hours
    for (let hour = workStart; hour < workEnd; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        // Check if slot would end after working hours
        const workEndTime = new Date(`${date}T${String(workEnd).padStart(2, "0")}:00:00`);
        if (slotEnd > workEndTime) {
          continue;
        }

        // Check if slot conflicts with any busy period
        const isAvailable = !busyPeriods.some((busy) => {
          // Slot conflicts if it overlaps with busy period
          return slotStart < busy.end && slotEnd > busy.start;
        });

        // Format time for display
        const displayHour = hour % 12 || 12;
        const period = hour >= 12 ? "PM" : "AM";
        const timeFormatted = `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;

        slots.push({
          time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          timeFormatted,
          available: isAvailable,
        });
      }
    }

    // Filter to only available slots
    const availableSlots = slots.filter((s) => s.available);

    return NextResponse.json({
      success: true,
      date,
      workingHours: {
        start: `${String(workStart).padStart(2, "0")}:00`,
        end: `${String(workEnd).padStart(2, "0")}:00`,
      },
      slotDuration,
      slots: availableSlots,
      totalSlots: slots.length,
      availableCount: availableSlots.length,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    return NextResponse.json(
      { error: "Failed to get available slots" },
      { status: 500 }
    );
  }
}
