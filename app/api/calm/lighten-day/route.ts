import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format, addMinutes, parseISO } from "date-fns";

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

    // Get groomer for contact methods and ID for filtering
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
      select: { id: true, contactMethods: true },
    });

    // Get today's active appointments (not completed, cancelled, or no-show)
    // Filter by groomerId to only show this groomer's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        ...(groomer?.id ? { groomerId: groomer.id } : {}),
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

/**
 * POST /api/calm/lighten-day
 * Add buffer time between appointments
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { bufferMinutes = 10 } = body;

    // Validate buffer minutes
    if (bufferMinutes < 5 || bufferMinutes > 30) {
      return NextResponse.json(
        { error: "Buffer time must be between 5 and 30 minutes" },
        { status: 400 }
      );
    }

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

    // Get groomer ID for filtering
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
      select: { id: true },
    });

    // Get today's active appointments sorted by time
    // Filter by groomerId to only show this groomer's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        ...(groomer?.id ? { groomerId: groomer.id } : {}),
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
            name: true,
            phone: true,
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

    if (appointments.length < 2) {
      return NextResponse.json({
        success: true,
        message: "Not enough appointments to add buffer time",
        adjustedCount: 0,
        adjustedAppointments: [],
      });
    }

    // Calculate new times with buffer
    // First appointment stays fixed, subsequent ones shift forward
    const adjustedAppointments: {
      id: string;
      customerName: string;
      petName?: string;
      oldTime: string;
      newTime: string;
      shifted: number;
    }[] = [];

    let accumulatedShift = 0;

    for (let i = 0; i < appointments.length; i++) {
      const apt = appointments[i];

      if (i === 0) {
        // First appointment stays fixed
        adjustedAppointments.push({
          id: apt.id,
          customerName: apt.customer.name,
          petName: apt.pet?.name,
          oldTime: format(apt.startAt, "h:mm a"),
          newTime: format(apt.startAt, "h:mm a"),
          shifted: 0,
        });
        continue;
      }

      const prev = appointments[i - 1];
      const prevEnd = addMinutes(prev.startAt, prev.serviceMinutes + accumulatedShift);
      const currentGap = (apt.startAt.getTime() - prevEnd.getTime()) / (1000 * 60);

      // If gap is less than buffer, add buffer time
      if (currentGap < bufferMinutes) {
        const neededShift = bufferMinutes - currentGap;
        accumulatedShift += neededShift;
      }

      const newStartTime = addMinutes(apt.startAt, accumulatedShift);

      adjustedAppointments.push({
        id: apt.id,
        customerName: apt.customer.name,
        petName: apt.pet?.name,
        oldTime: format(apt.startAt, "h:mm a"),
        newTime: format(newStartTime, "h:mm a"),
        shifted: accumulatedShift,
      });
    }

    // Apply the changes to the database
    const updates = adjustedAppointments
      .filter((apt) => apt.shifted > 0)
      .map((apt) => {
        const originalApt = appointments.find((a) => a.id === apt.id);
        if (!originalApt) return null;

        return prisma.appointment.update({
          where: { id: apt.id },
          data: {
            startAt: addMinutes(originalApt.startAt, apt.shifted),
          },
        });
      })
      .filter(Boolean);

    await Promise.all(updates);

    const adjustedCount = adjustedAppointments.filter((a) => a.shifted > 0).length;
    const totalShiftedMinutes = accumulatedShift;

    return NextResponse.json({
      success: true,
      message: adjustedCount > 0
        ? `Added ${bufferMinutes}-min buffers. ${adjustedCount} appointments adjusted.`
        : "All appointments already have sufficient buffer time.",
      bufferMinutes,
      adjustedCount,
      totalShiftedMinutes,
      adjustedAppointments: adjustedAppointments.filter((a) => a.shifted > 0),
      newEndTime: adjustedAppointments.length > 0
        ? adjustedAppointments[adjustedAppointments.length - 1].newTime
        : null,
    });
  } catch (error) {
    console.error("Lighten Day POST error:", error);
    return NextResponse.json(
      { error: "Failed to add buffer time" },
      { status: 500 }
    );
  }
}
