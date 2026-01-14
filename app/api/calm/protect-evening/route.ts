import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format, addMinutes } from "date-fns";

/**
 * GET /api/calm/protect-evening
 * Get today's schedule with evening protection options
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

    // Get groomer settings and ID for filtering
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
      select: {
        id: true,
        contactMethods: true,
        workingHoursEnd: true,
      },
    });

    // Get today's active appointments
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

    // Calculate current estimated end time
    let estimatedEndTime: Date | null = null;
    if (appointments.length > 0) {
      const lastAppointment = appointments[appointments.length - 1];
      estimatedEndTime = addMinutes(lastAppointment.startAt, lastAppointment.serviceMinutes);
    }

    // Get appointments that extend past common evening cutoffs
    const eveningCutoffs = [17, 18, 19]; // 5 PM, 6 PM, 7 PM
    const appointmentsToMove: {
      id: string;
      customerName: string;
      customerPhone: string;
      petName?: string;
      time: string;
      endTime: string;
      extendsPast: number; // Hour (17, 18, 19)
    }[] = [];

    appointments.forEach((apt) => {
      const endTime = addMinutes(apt.startAt, apt.serviceMinutes);
      const endHour = endTime.getUTCHours();

      eveningCutoffs.forEach((cutoff) => {
        if (endHour >= cutoff) {
          // Only add once for the earliest cutoff it exceeds
          if (!appointmentsToMove.find((a) => a.id === apt.id)) {
            appointmentsToMove.push({
              id: apt.id,
              customerName: apt.customer.name,
              customerPhone: apt.customer.phone || "",
              petName: apt.pet?.name,
              time: format(apt.startAt, "h:mm a"),
              endTime: format(endTime, "h:mm a"),
              extendsPast: cutoff,
            });
          }
        }
      });
    });

    // Determine current working hours end
    const currentEndHour = groomer?.workingHoursEnd
      ? parseInt(groomer.workingHoursEnd.split(":")[0])
      : 18;

    // Protection options
    const protectionOptions = [
      {
        id: "end-5pm",
        label: "End by 5:00 PM",
        description: "Wrap up work by 5 PM for a full evening",
        hour: 17,
        appointmentsAffected: appointmentsToMove.filter((a) => a.extendsPast <= 17).length,
      },
      {
        id: "end-6pm",
        label: "End by 6:00 PM",
        description: "Standard workday ending",
        hour: 18,
        appointmentsAffected: appointmentsToMove.filter((a) => a.extendsPast <= 18).length,
      },
      {
        id: "end-7pm",
        label: "End by 7:00 PM",
        description: "Extended day with some evening time",
        hour: 19,
        appointmentsAffected: appointmentsToMove.filter((a) => a.extendsPast <= 19).length,
      },
    ];

    // Generate reschedule message
    const rescheduleMessage = (customerName: string, petName?: string) =>
      `Hi ${customerName}! I'm trying to protect my evening hours for some personal time. Would you be open to rescheduling ${petName || "your pet"}'s appointment to earlier in the day or another day this week? I really appreciate your understanding!`;

    return NextResponse.json({
      estimatedEndTime: estimatedEndTime?.toISOString(),
      formattedEstimatedEndTime: estimatedEndTime ? format(estimatedEndTime, "h:mm a") : null,
      currentEndHourSetting: currentEndHour,
      appointmentsToMove,
      protectionOptions,
      totalAppointments: appointments.length,
      rescheduleMessageTemplate: rescheduleMessage,
      contactMethods: groomer?.contactMethods || ["sms", "call"],
      eveningStatus: estimatedEndTime
        ? {
            endHour: estimatedEndTime.getUTCHours(),
            isLate: estimatedEndTime.getUTCHours() >= 18,
            message: estimatedEndTime.getUTCHours() >= 19
              ? "Your day runs past 7 PM. Consider moving some appointments."
              : estimatedEndTime.getUTCHours() >= 18
                ? "Your day ends around 6 PM or later."
                : "Your evening looks protected!",
          }
        : null,
    });
  } catch (error) {
    console.error("Protect Evening GET error:", error);
    return NextResponse.json(
      { error: "Failed to analyze evening schedule" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calm/protect-evening
 * Update working hours end time setting
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { endHour } = body;

    if (!endHour || endHour < 15 || endHour > 21) {
      return NextResponse.json(
        { error: "Invalid end hour. Must be between 15 (3 PM) and 21 (9 PM)" },
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

    // Update groomer's working hours
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer profile not found" },
        { status: 404 }
      );
    }

    await prisma.groomer.update({
      where: { id: groomer.id },
      data: {
        workingHoursEnd: `${endHour}:00`,
      },
    });

    return NextResponse.json({
      success: true,
      newEndHour: endHour,
      message: `Your workday now ends at ${endHour > 12 ? endHour - 12 : endHour}:00 ${endHour >= 12 ? "PM" : "AM"}`,
    });
  } catch (error) {
    console.error("Protect Evening POST error:", error);
    return NextResponse.json(
      { error: "Failed to update evening protection" },
      { status: 500 }
    );
  }
}
