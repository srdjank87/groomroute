import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { assessWorkload, WorkloadAssessment } from "@/lib/workload-assessment";

const LARGE_DOG_THRESHOLD = 50; // lbs

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
      select: { subscriptionPlan: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user can access Calm Control
    if (!canAccessCalmControl(account)) {
      return NextResponse.json(
        {
          error: "Calm Control is only available on the Growth and Pro plans.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
          featureName: "Calm Control Center"
        },
        { status: 403 }
      );
    }

    // Get groomer for assistant preference
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
      select: { id: true, defaultHasAssistant: true },
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's route for assistant status
    const route = await prisma.route.findFirst({
      where: {
        accountId,
        routeDate: today,
      },
      select: { hasAssistant: true },
    });

    // Use route's hasAssistant if set, otherwise fall back to groomer's default
    const hasAssistant = route?.hasAssistant ?? groomer?.defaultHasAssistant ?? false;

    // Fetch today's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["BOOKED", "CONFIRMED", "IN_PROGRESS"],
        },
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Calculate workload using the unified assessment
    const totalAppointments = appointments.length;
    const totalMinutes = appointments.reduce((sum, apt) => sum + apt.serviceMinutes, 0);
    const largeDogCount = appointments.filter(
      apt => apt.pet?.weight && apt.pet.weight > LARGE_DOG_THRESHOLD
    ).length;

    // Get completed count for remaining workload calculation
    const completedCount = 0; // Calm center shows active appointments, so no completed ones

    const workloadAssessment = assessWorkload({
      appointmentCount: totalAppointments,
      totalMinutes,
      largeDogCount,
      hasAssistant,
      completedCount,
    });

    // Map workload level to calm center status
    type CalmStatus = "smooth" | "tight" | "overloaded";
    const levelToStatus: Record<string, CalmStatus> = {
      "day-off": "smooth",
      "light": "smooth",
      "moderate": "smooth",
      "busy": "tight",
      "heavy": "tight",
      "overloaded": "overloaded",
    };

    const status: CalmStatus = levelToStatus[workloadAssessment.level] || "smooth";
    const message = workloadAssessment.message;
    const stressPoints = workloadAssessment.stressPoints;

    // Check for unconfirmed appointments tomorrow
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const unconfirmedTomorrow = await prisma.appointment.count({
      where: {
        accountId,
        startAt: {
          gte: tomorrow,
          lt: tomorrowEnd,
        },
        customerConfirmed: false,
        status: "BOOKED",
      },
    });

    // Analyze Quick Rescues
    const quickRescues = [];

    // Check for missing confirmations
    if (unconfirmedTomorrow > 0) {
      quickRescues.push({
        id: "missing-confirmations",
        type: "missing_confirmations",
        title: "Missing Confirmations",
        description: `${unconfirmedTomorrow} customer${
          unconfirmedTomorrow > 1 ? "s haven't" : " hasn't"
        } confirmed tomorrow. Want to nudge them?`,
        action: "Send Reminders",
        urgency: 2,
      });
    }

    // Check for tight schedule (appointments < 15 min apart)
    let hasTightTravel = false;
    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];

      const currentEnd = new Date(current.startAt);
      currentEnd.setMinutes(currentEnd.getMinutes() + current.serviceMinutes);

      const gap = (next.startAt.getTime() - currentEnd.getTime()) / (1000 * 60);

      if (gap < 15) {
        hasTightTravel = true;
        break;
      }
    }

    if (hasTightTravel) {
      quickRescues.push({
        id: "travel-risk",
        type: "travel_risk",
        title: "Travel Time Risk",
        description: "Your travel time between some stops looks tight. Want to smooth it?",
        action: "Fix My Route",
        urgency: 3,
      });
    }

    // Check for schedule gaps (90+ min between appointments)
    let hasLargeGap = false;
    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];

      const currentEnd = new Date(current.startAt);
      currentEnd.setMinutes(currentEnd.getMinutes() + current.serviceMinutes);

      const gap = (next.startAt.getTime() - currentEnd.getTime()) / (1000 * 60);

      if (gap >= 90) {
        hasLargeGap = true;
        break;
      }
    }

    if (hasLargeGap) {
      quickRescues.push({
        id: "schedule-gap",
        type: "schedule_gap",
        title: "Schedule Gap Detected",
        description: "You have a 90-minute gap today. Want help filling it?",
        action: "Help Me Fill It",
        urgency: 1,
      });
    }

    // Check for overloaded schedule
    if (totalAppointments > 8) {
      quickRescues.push({
        id: "running-behind",
        type: "running_behind",
        title: "Heavy Day Alert",
        description:
          "Your schedule is packed. Want us to suggest relief options or add buffer time?",
        action: "Lighten My Day",
        urgency: 4,
      });
    }

    // Sort by urgency (higher = more urgent)
    quickRescues.sort((a, b) => b.urgency - a.urgency);

    // Customer Situations (mock data for now - would come from messaging system)
    const customerSituations: Array<{
      id: string;
      customerName: string;
      type: string;
      message?: string;
      needsAction: boolean;
    }> = [];

    // Check for unconfirmed appointments today
    const unconfirmedToday = appointments.filter(
      (apt) => !apt.customerConfirmed
    );

    unconfirmedToday.forEach((apt) => {
      customerSituations.push({
        id: `unconfirmed-${apt.id}`,
        customerName: apt.customer.name,
        type: "reschedule",
        needsAction: true,
      });
    });

    // Wellness Alerts
    const wellnessAlerts: Array<{
      id: string;
      message: string;
      suggestion: string;
    }> = [];

    // Check for heavy workload this week
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekAppointments = await prisma.appointment.count({
      where: {
        accountId,
        startAt: {
          gte: weekStart,
          lt: weekEnd,
        },
        status: {
          in: ["BOOKED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"],
        },
      },
    });

    if (weekAppointments > 30) {
      wellnessAlerts.push({
        id: "heavy-week",
        message: `You've handled ${weekAppointments} appointments this week. That's impressive!`,
        suggestion: "Want to set a max per day to prevent burnout?",
      });
    }

    // Check for late finish
    if (appointments.length > 0) {
      const lastAppointment = appointments[appointments.length - 1];
      const endTime = new Date(lastAppointment.startAt);
      endTime.setMinutes(endTime.getMinutes() + lastAppointment.serviceMinutes);

      if (endTime.getHours() >= 18) {
        // After 6 PM
        wellnessAlerts.push({
          id: "late-finish",
          message: "Your day ends after 6 PM today.",
          suggestion: "Want to protect your evening hours going forward?",
        });
      }
    }

    const response = {
      dayStatus: {
        status,
        message,
        totalAppointments,
        stressPoints,
        // Additional workload context
        workloadLevel: workloadAssessment.level,
        workloadLabel: workloadAssessment.label,
        workloadEmoji: workloadAssessment.emoji,
        workloadColor: workloadAssessment.color,
        workloadScore: workloadAssessment.workloadScore,
        hasAssistant,
        largeDogCount,
        totalMinutes,
      },
      quickRescues: quickRescues.slice(0, 5), // Max 5
      customerSituations: customerSituations.slice(0, 10), // Max 10
      wellnessAlerts: wellnessAlerts.slice(0, 3), // Max 3
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Calm Center API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calm center data" },
      { status: 500 }
    );
  }
}
