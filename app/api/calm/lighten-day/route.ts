import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format, addMinutes } from "date-fns";

/**
 * GET /api/calm/lighten-day
 * Get today's appointments with relief options when the day is too heavy
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

    // Get groomer for contact methods
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
      select: { contactMethods: true },
    });

    // Get today's active appointments (not completed, cancelled, or no-show)
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            notes: true,
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

    // Analyze the day and provide relief suggestions
    const totalAppointments = appointments.length;
    const suggestions: {
      id: string;
      type: "reschedule" | "shorten" | "delegate" | "break";
      title: string;
      description: string;
      action: string;
      appointmentId?: string;
      customerName?: string;
      petName?: string;
      time?: string;
      impact: string;
    }[] = [];

    // Identify appointments that could be rescheduled (not confirmed, later in day)
    const laterAppointments = appointments.filter((apt, idx) => {
      const isLaterHalf = idx >= Math.floor(appointments.length / 2);
      const isNotConfirmed = apt.status === "BOOKED";
      return isLaterHalf && isNotConfirmed;
    });

    laterAppointments.slice(0, 2).forEach((apt) => {
      suggestions.push({
        id: `reschedule-${apt.id}`,
        type: "reschedule",
        title: `Reschedule ${apt.customer.name}`,
        description: `${apt.pet?.name || "Pet"} at ${format(apt.startAt, "h:mm a")} - not yet confirmed`,
        action: "Offer to Reschedule",
        appointmentId: apt.id,
        customerName: apt.customer.name,
        petName: apt.pet?.name,
        time: format(apt.startAt, "h:mm a"),
        impact: "Free up 1 slot",
      });
    });

    // Suggest adding buffer time if appointments are back-to-back
    let hasBackToBack = false;
    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];
      const currentEnd = addMinutes(current.startAt, current.serviceMinutes);
      const gap = (next.startAt.getTime() - currentEnd.getTime()) / (1000 * 60);
      if (gap < 10) {
        hasBackToBack = true;
        break;
      }
    }

    if (hasBackToBack) {
      suggestions.push({
        id: "add-buffer",
        type: "break",
        title: "Add Buffer Time",
        description: "Your appointments are back-to-back. Adding 10-min buffers can reduce stress.",
        action: "Add Buffers",
        impact: "Reduce rushing",
      });
    }

    // Suggest a break if no breaks scheduled
    if (totalAppointments >= 5) {
      suggestions.push({
        id: "add-break",
        type: "break",
        title: "Schedule a Breather",
        description: "With 5+ appointments, consider a 15-min break midday to recharge.",
        action: "Insert Break",
        impact: "Prevent burnout",
      });
    }

    // Format appointments for potential rescheduling
    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      customerName: apt.customer.name,
      customerPhone: apt.customer.phone,
      petName: apt.pet?.name,
      scheduledTime: apt.startAt.toISOString(),
      formattedTime: format(apt.startAt, "h:mm a"),
      status: apt.status,
      serviceMinutes: apt.serviceMinutes,
      isConfirmed: apt.status === "CONFIRMED",
      canReschedule: apt.status === "BOOKED",
    }));

    // Generate reschedule message template
    const rescheduleMessage = (customerName: string, petName?: string) =>
      `Hi ${customerName}! I'm having a packed day and want to give ${petName || "your pet"} my full attention. Would you be open to rescheduling to tomorrow or later this week? I'll prioritize you!`;

    return NextResponse.json({
      totalAppointments,
      remainingAppointments: formattedAppointments.length,
      appointments: formattedAppointments,
      suggestions,
      rescheduleMessageTemplate: rescheduleMessage,
      contactMethods: groomer?.contactMethods || ["sms", "call"],
      dayAssessment: {
        status: totalAppointments > 7 ? "overloaded" : totalAppointments > 5 ? "heavy" : "manageable",
        message: totalAppointments > 7
          ? "Your day is overloaded. Consider these relief options."
          : totalAppointments > 5
            ? "You have a heavy day. Here are some ways to lighten it."
            : "Your day looks manageable, but here are options if you need them.",
      },
    });
  } catch (error) {
    console.error("Lighten Day GET error:", error);
    return NextResponse.json(
      { error: "Failed to analyze day" },
      { status: 500 }
    );
  }
}
