import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getGroomerAreaDays,
  findNextAreaDayDate,
  getUpcomingAreaDates,
  DAY_NAMES,
} from "@/lib/area-matcher";

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// GET - Get suggested booking date based on customer's area and groomer's schedule
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const groomerId = searchParams.get("groomerId");

    if (!customerId || !groomerId) {
      return NextResponse.json(
        { error: "customerId and groomerId are required" },
        { status: 400 }
      );
    }

    // Get customer with their service area
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId: session.user.accountId,
      },
      include: {
        serviceArea: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Verify groomer belongs to account
    const groomer = await prisma.groomer.findFirst({
      where: {
        id: groomerId,
        accountId: session.user.accountId,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer not found" },
        { status: 404 }
      );
    }

    // If customer has no service area, return null suggestions
    if (!customer.serviceArea) {
      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          serviceAreaId: null,
          serviceAreaName: null,
          serviceAreaColor: null,
        },
        suggestedDays: [],
        nextSuggestedDate: null,
        reason: null,
      });
    }

    // Get the default days this groomer works in this customer's area (weekly pattern)
    const suggestedDays = await getGroomerAreaDays(
      groomerId,
      customer.serviceArea.id
    );

    // Get upcoming dates including overrides (next 30 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAreaDates = await getUpcomingAreaDates(
      groomerId,
      customer.serviceArea.id,
      today,
      30
    );

    // Find the next date that falls on one of those days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextAreaDayResult = await findNextAreaDayDate(
      groomerId,
      customer.serviceArea.id,
      tomorrow
    );

    // Build reason text
    let reason: string | null = null;

    // Check if there are any override dates in upcoming dates
    const overrideDates = upcomingAreaDates.filter(d => d.isOverride);
    const hasOverrides = overrideDates.length > 0;

    if (suggestedDays.length > 0 || hasOverrides) {
      const parts: string[] = [];

      if (suggestedDays.length > 0) {
        const dayNames = suggestedDays.map((d) => DAY_NAMES[d]).join(", ");
        parts.push(`${groomer.name} works in ${customer.serviceArea.name} on ${dayNames}`);
      }

      // Add note about override dates if any
      if (hasOverrides) {
        const overrideDateStrs = overrideDates.slice(0, 3).map(d => {
          const date = new Date(d.date + 'T00:00:00');
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        if (overrideDates.length > 3) {
          overrideDateStrs.push(`+${overrideDates.length - 3} more`);
        }
        parts.push(`Special dates: ${overrideDateStrs.join(', ')}`);
      }

      reason = parts.join('. ');
    }

    // Find first available time slot on the suggested date
    let suggestedTime: { time: string; timeFormatted: string } | null = null;
    const nextSuggestedDate = nextAreaDayResult?.date || null;

    if (nextSuggestedDate) {
      const dateStr = nextSuggestedDate.toISOString().split("T")[0];

      // Get working hours (default 9 AM - 5 PM if not set)
      const workStart = groomer.workingHoursStart
        ? parseInt(groomer.workingHoursStart.split(":")[0])
        : 9;
      const workEnd = groomer.workingHoursEnd
        ? parseInt(groomer.workingHoursEnd.split(":")[0])
        : 17;

      // Get existing appointments on this date
      const startOfDay = new Date(`${dateStr}T00:00:00`);
      const endOfDay = new Date(`${dateStr}T23:59:59`);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          accountId: session.user.accountId,
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

      // Build busy periods
      const busyPeriods = existingAppointments.map((apt) => {
        const start = new Date(apt.startAt);
        const end = new Date(start.getTime() + apt.serviceMinutes * 60 * 1000);
        return { start, end };
      }).sort((a, b) => a.start.getTime() - b.start.getTime());

      // Default duration for finding slot (90 min for full groom)
      const defaultDuration = 90;
      const workStartToday = new Date(`${dateStr}T${String(workStart).padStart(2, "0")}:00:00`);
      const workEndToday = new Date(`${dateStr}T${String(workEnd).padStart(2, "0")}:00:00`);

      // Find first available slot
      for (let i = 0; i <= busyPeriods.length; i++) {
        let gapStart: Date;
        let gapEnd: Date;

        if (i === 0) {
          gapStart = workStartToday;
          gapEnd = busyPeriods.length > 0 ? busyPeriods[0].start : workEndToday;
        } else if (i === busyPeriods.length) {
          gapStart = busyPeriods[i - 1].end;
          gapEnd = workEndToday;
        } else {
          gapStart = busyPeriods[i - 1].end;
          gapEnd = busyPeriods[i].start;
        }

        const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (60 * 1000);

        if (gapDuration >= defaultDuration && gapStart < workEndToday) {
          // Add 15 min buffer after previous appointment
          if (i > 0) {
            const bufferStart = new Date(busyPeriods[i - 1].end.getTime() + 15 * 60 * 1000);
            if (bufferStart.getTime() + defaultDuration * 60 * 1000 <= gapEnd.getTime()) {
              gapStart = bufferStart;
            }
          }

          // Round to nearest 15 minutes
          const minutes = gapStart.getMinutes();
          const roundedMinutes = Math.ceil(minutes / 15) * 15;
          gapStart.setMinutes(roundedMinutes, 0, 0);

          if (gapStart.getTime() + defaultDuration * 60 * 1000 <= gapEnd.getTime() &&
              gapStart.getTime() + defaultDuration * 60 * 1000 <= workEndToday.getTime()) {
            const timeStr = `${String(gapStart.getHours()).padStart(2, "0")}:${String(gapStart.getMinutes()).padStart(2, "0")}`;
            suggestedTime = {
              time: timeStr,
              timeFormatted: formatTime(gapStart),
            };
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        serviceAreaId: customer.serviceArea.id,
        serviceAreaName: customer.serviceArea.name,
        serviceAreaColor: customer.serviceArea.color,
      },
      suggestedDays,
      upcomingAreaDates, // All dates (including overrides) in the next 30 days
      nextSuggestedDate: nextSuggestedDate?.toISOString().split("T")[0] || null,
      suggestedTime,
      reason,
    });
  } catch (error) {
    console.error("Error getting suggested date:", error);
    return NextResponse.json(
      { error: "Failed to get suggested date" },
      { status: 500 }
    );
  }
}
