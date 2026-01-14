import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, format, addMinutes, parseISO, differenceInMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface Gap {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  previousAppointment: {
    id: string;
    customerName: string;
    endTime: Date;
  } | null;
  nextAppointment: {
    id: string;
    customerName: string;
    startTime: Date;
  } | null;
}

interface WaitlistMatch {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string;
  pets: Array<{ id: string; name: string; breed: string | null }>;
  serviceAreaName: string | null;
  serviceAreaColor: string | null;
  preferredDays: string[];
  preferredTimes: string[];
  flexibleTiming: boolean;
  matchScore: number; // 0-100, higher is better match
  matchReasons: string[];
}

// GET - Find gaps in the schedule for a specific date and suggest waitlist clients
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const minGapMinutes = parseInt(searchParams.get("minGap") || "45"); // Minimum gap to consider (default 45 min)

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Get the groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
    });

    if (!groomer) {
      return NextResponse.json({ error: "No groomer found" }, { status: 404 });
    }

    // Get account timezone
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { timezone: true },
    });
    const timezone = account?.timezone || "America/New_York";

    // Parse date and get working hours
    const targetDate = parseISO(dateStr);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Get working hours
    const workingStart = groomer.workingHoursStart || "08:00";
    const workingEnd = groomer.workingHoursEnd || "17:00";

    const [startHour, startMin] = workingStart.split(":").map(Number);
    const [endHour, endMin] = workingEnd.split(":").map(Number);

    const workdayStart = new Date(targetDate);
    workdayStart.setHours(startHour, startMin, 0, 0);

    const workdayEnd = new Date(targetDate);
    workdayEnd.setHours(endHour, endMin, 0, 0);

    // Get appointments for this date
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
      include: {
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

    // Find gaps in the schedule
    const gaps: Gap[] = [];

    if (appointments.length === 0) {
      // Entire day is free
      const durationMinutes = differenceInMinutes(workdayEnd, workdayStart);
      if (durationMinutes >= minGapMinutes) {
        gaps.push({
          startTime: workdayStart,
          endTime: workdayEnd,
          durationMinutes,
          previousAppointment: null,
          nextAppointment: null,
        });
      }
    } else {
      // Check for gap before first appointment
      const firstAppt = appointments[0];
      const gapBeforeFirst = differenceInMinutes(firstAppt.startAt, workdayStart);
      if (gapBeforeFirst >= minGapMinutes) {
        gaps.push({
          startTime: workdayStart,
          endTime: firstAppt.startAt,
          durationMinutes: gapBeforeFirst,
          previousAppointment: null,
          nextAppointment: {
            id: firstAppt.id,
            customerName: firstAppt.customer.name,
            startTime: firstAppt.startAt,
          },
        });
      }

      // Check for gaps between appointments
      for (let i = 0; i < appointments.length - 1; i++) {
        const current = appointments[i];
        const next = appointments[i + 1];

        const currentEnd = addMinutes(current.startAt, current.serviceMinutes);
        const gapMinutes = differenceInMinutes(next.startAt, currentEnd);

        if (gapMinutes >= minGapMinutes) {
          gaps.push({
            startTime: currentEnd,
            endTime: next.startAt,
            durationMinutes: gapMinutes,
            previousAppointment: {
              id: current.id,
              customerName: current.customer.name,
              endTime: currentEnd,
            },
            nextAppointment: {
              id: next.id,
              customerName: next.customer.name,
              startTime: next.startAt,
            },
          });
        }
      }

      // Check for gap after last appointment
      const lastAppt = appointments[appointments.length - 1];
      const lastApptEnd = addMinutes(lastAppt.startAt, lastAppt.serviceMinutes);
      const gapAfterLast = differenceInMinutes(workdayEnd, lastApptEnd);

      if (gapAfterLast >= minGapMinutes) {
        gaps.push({
          startTime: lastApptEnd,
          endTime: workdayEnd,
          durationMinutes: gapAfterLast,
          previousAppointment: {
            id: lastAppt.id,
            customerName: lastAppt.customer.name,
            endTime: lastApptEnd,
          },
          nextAppointment: null,
        });
      }
    }

    // Get the day of week for matching
    const dayOfWeek = format(targetDate, "EEEE").toUpperCase(); // "MONDAY", "TUESDAY", etc.

    // Get active waitlist entries
    const waitlistEntries = await prisma.customerWaitlist.findMany({
      where: {
        accountId,
        isActive: true,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            lat: true,
            lng: true,
            serviceArea: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            pets: {
              select: {
                id: true,
                name: true,
                breed: true,
              },
            },
          },
        },
      },
    });

    // Get the area scheduled for this day (if any)
    const areaForDay = await getAreaForDate(groomer.id, targetDate, accountId);

    // Match waitlist clients to each gap
    const gapsWithMatches = gaps.map((gap) => {
      const timeOfDay = getTimeOfDay(gap.startTime);

      const matches: WaitlistMatch[] = waitlistEntries
        .map((entry) => {
          let score = 0;
          const reasons: string[] = [];

          // Check day preference match
          if (entry.preferredDays.includes(dayOfWeek)) {
            score += 40;
            reasons.push(`Prefers ${dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}s`);
          } else if (entry.flexibleTiming) {
            score += 15;
            reasons.push("Flexible timing");
          }

          // Check time preference match
          if (entry.preferredTimes.includes(timeOfDay)) {
            score += 30;
            reasons.push(`Prefers ${timeOfDay.toLowerCase()} appointments`);
          } else if (entry.flexibleTiming) {
            score += 10;
          }

          // Check if client is in the same area as the scheduled area for today
          if (areaForDay && entry.customer.serviceArea?.id === areaForDay.id) {
            score += 30;
            reasons.push(`In today's area (${areaForDay.name})`);
          }

          // Don't return if score is 0 (no preference match at all)
          if (score === 0) return null;

          return {
            customerId: entry.customer.id,
            customerName: entry.customer.name,
            customerPhone: entry.customer.phone,
            customerEmail: entry.customer.email,
            customerAddress: entry.customer.address,
            pets: entry.customer.pets,
            serviceAreaName: entry.customer.serviceArea?.name || null,
            serviceAreaColor: entry.customer.serviceArea?.color || null,
            preferredDays: entry.preferredDays,
            preferredTimes: entry.preferredTimes,
            flexibleTiming: entry.flexibleTiming,
            matchScore: score,
            matchReasons: reasons,
          };
        })
        .filter((match): match is WaitlistMatch => match !== null)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Top 5 matches per gap

      return {
        ...gap,
        startTimeFormatted: format(gap.startTime, "h:mm a"),
        endTimeFormatted: format(gap.endTime, "h:mm a"),
        startTime24h: format(gap.startTime, "HH:mm"),
        endTime24h: format(gap.endTime, "HH:mm"),
        suggestedClients: matches,
      };
    });

    return NextResponse.json({
      date: dateStr,
      dayOfWeek,
      areaForDay: areaForDay
        ? { id: areaForDay.id, name: areaForDay.name, color: areaForDay.color }
        : null,
      workingHours: {
        start: workingStart,
        end: workingEnd,
      },
      appointmentCount: appointments.length,
      gaps: gapsWithMatches,
      totalGapMinutes: gaps.reduce((sum, g) => sum + g.durationMinutes, 0),
    });
  } catch (error) {
    console.error("Get gaps error:", error);
    return NextResponse.json(
      { error: "Failed to find gaps" },
      { status: 500 }
    );
  }
}

// Helper function to determine time of day
function getTimeOfDay(time: Date): "MORNING" | "AFTERNOON" | "EVENING" {
  const hour = time.getHours();
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

// Helper function to get the area for a specific date
async function getAreaForDate(
  groomerId: string,
  date: Date,
  accountId: string
): Promise<{ id: string; name: string; color: string } | null> {
  const dateOnly = format(date, "yyyy-MM-dd");

  // First check for date override
  const override = await prisma.areaDateOverride.findFirst({
    where: {
      groomerId,
      date: new Date(dateOnly),
    },
    include: {
      area: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (override) {
    return override.area;
  }

  // Fall back to default day assignment
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const assignment = await prisma.areaDayAssignment.findFirst({
    where: {
      groomerId,
      dayOfWeek,
    },
    include: {
      area: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return assignment?.area || null;
}
