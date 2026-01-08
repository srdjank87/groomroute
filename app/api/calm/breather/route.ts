import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format, addMinutes } from "date-fns";

/**
 * GET /api/calm/breather
 * Find available break slots in today's schedule
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get account to check subscription plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true, timezone: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user can access Calm Control
    if (!canAccessCalmControl(account)) {
      return NextResponse.json(
        {
          error: "This feature requires the Growth or Pro plan.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
        },
        { status: 403 }
      );
    }

    const timezone = account.timezone || "America/New_York";

    // Get today's date based on account's timezone
    const now = new Date();
    const localNow = toZonedTime(now, timezone);
    const today = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const tomorrow = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate() + 1,
        0,
        0,
        0,
        0
      )
    );

    // Get today's active appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
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
        pet: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Find gaps between appointments where breaks can be inserted
    const breakSlots: {
      id: string;
      afterAppointmentId: string;
      afterCustomerName: string;
      beforeAppointmentId?: string;
      beforeCustomerName?: string;
      startTime: string;
      endTime: string;
      duration: number;
      suggestedBreakDuration: number;
      type: "gap" | "extend" | "end";
    }[] = [];

    // Analyze gaps between appointments
    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];

      const currentEnd = addMinutes(current.startAt, current.serviceMinutes);
      const gap = (next.startAt.getTime() - currentEnd.getTime()) / (1000 * 60);

      // If there's a gap of 15+ minutes, suggest a break
      if (gap >= 15) {
        breakSlots.push({
          id: `gap-${current.id}`,
          afterAppointmentId: current.id,
          afterCustomerName: current.customer.name,
          beforeAppointmentId: next.id,
          beforeCustomerName: next.customer.name,
          startTime: format(currentEnd, "h:mm a"),
          endTime: format(next.startAt, "h:mm a"),
          duration: gap,
          suggestedBreakDuration: Math.min(gap, 30),
          type: "gap",
        });
      }
    }

    // Add option after last appointment
    if (appointments.length > 0) {
      const lastApt = appointments[appointments.length - 1];
      const lastEndTime = addMinutes(lastApt.startAt, lastApt.serviceMinutes);

      breakSlots.push({
        id: `end-${lastApt.id}`,
        afterAppointmentId: lastApt.id,
        afterCustomerName: lastApt.customer.name,
        startTime: format(lastEndTime, "h:mm a"),
        endTime: "End of day",
        duration: 60, // Arbitrary - end of day
        suggestedBreakDuration: 15,
        type: "end",
      });
    }

    // Break duration options
    const breakDurations = [
      { minutes: 10, label: "Quick breather (10 min)", description: "Stretch, hydrate, reset" },
      { minutes: 15, label: "Short break (15 min)", description: "Grab a snack, check messages" },
      { minutes: 30, label: "Lunch break (30 min)", description: "Full meal, proper rest" },
      { minutes: 45, label: "Extended break (45 min)", description: "Lunch + relaxation time" },
    ];

    // Calculate how many appointments are left
    const completedCount = appointments.filter((apt) => apt.status === "COMPLETED").length;
    const remainingCount = appointments.length - completedCount;

    // Wellness suggestions based on workload
    const suggestions: string[] = [];
    if (remainingCount >= 5) {
      suggestions.push("You have a full day ahead. Consider a 15-min break between appointments.");
    }
    if (remainingCount >= 3 && breakSlots.filter((s) => s.type === "gap").length === 0) {
      suggestions.push("Your schedule is tight. Even a 5-min stretch between stops helps!");
    }
    if (completedCount >= 3 && remainingCount >= 2) {
      suggestions.push("Great progress! A short break now will keep your energy up for the rest of the day.");
    }

    return NextResponse.json({
      totalAppointments: appointments.length,
      completedCount,
      remainingCount,
      breakSlots,
      breakDurations,
      suggestions,
      currentGapCount: breakSlots.filter((s) => s.type === "gap").length,
      hasSufficientBreaks: breakSlots.filter((s) => s.type === "gap" && s.duration >= 15).length >= 1,
    });
  } catch (error) {
    console.error("Breather GET error:", error);
    return NextResponse.json(
      { error: "Failed to find break slots" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calm/breather
 * Log a break (for future analytics)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { breakDuration, afterAppointmentId } = body;

    if (!breakDuration || breakDuration < 5 || breakDuration > 60) {
      return NextResponse.json(
        { error: "Invalid break duration. Must be between 5 and 60 minutes" },
        { status: 400 }
      );
    }

    // Get account to check subscription plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user can access Calm Control
    if (!canAccessCalmControl(account)) {
      return NextResponse.json(
        {
          error: "This feature requires the Growth or Pro plan.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
        },
        { status: 403 }
      );
    }

    // For now, just acknowledge the break
    // In the future, this could log to a breaks table for analytics

    const encouragingMessages = [
      "Enjoy your break! You've earned it. 🌿",
      "Taking breaks is a sign of wisdom, not weakness. 💚",
      "Rest well - your next client will thank you! ✨",
      "A calm groomer makes for calm pets. Enjoy! 🐕",
      "Recharge mode: activated. You got this! 💪",
    ];

    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

    return NextResponse.json({
      success: true,
      breakDuration,
      message: randomMessage,
      tip: breakDuration >= 15
        ? "Great choice! Use this time to hydrate, stretch, and clear your mind."
        : "Even short breaks help! Take a few deep breaths and reset.",
    });
  } catch (error) {
    console.error("Breather POST error:", error);
    return NextResponse.json(
      { error: "Failed to log break" },
      { status: 500 }
    );
  }
}
