import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format, addMinutes } from "date-fns";

/**
 * GET /api/calm/running-late
 * Get remaining appointments for today that would be affected by running late
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
          error: "Running Late notifications require the Growth or Pro plan.",
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

    // Get remaining active appointments for today (not completed, cancelled, or no-show)
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

    // Format appointments for the response
    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      customerName: apt.customer.name,
      customerPhone: apt.customer.phone,
      petName: apt.pet?.name,
      originalTime: apt.startAt.toISOString(),
      formattedTime: format(apt.startAt, "h:mm a"),
    }));

    return NextResponse.json({
      appointments: formattedAppointments,
      contactMethods: groomer?.contactMethods || ["sms"],
    });
  } catch (error) {
    console.error("Running Late GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calm/running-late
 * Calculate new ETAs based on delay minutes
 */
export async function POST(req: NextRequest) {
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
          error: "Running Late notifications require the Growth or Pro plan.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { delayMinutes } = body;

    if (!delayMinutes || typeof delayMinutes !== "number" || delayMinutes < 1) {
      return NextResponse.json(
        { error: "Invalid delay minutes" },
        { status: 400 }
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

    // Get remaining active appointments for today
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

    // Calculate new ETAs with delay applied
    const appointmentsWithNewETA = appointments.map((apt) => {
      const originalTime = apt.startAt;
      const newTime = addMinutes(originalTime, delayMinutes);

      return {
        id: apt.id,
        customerName: apt.customer.name,
        customerPhone: apt.customer.phone,
        petName: apt.pet?.name,
        originalTime: originalTime.toISOString(),
        formattedOriginalTime: format(originalTime, "h:mm a"),
        newTime: newTime.toISOString(),
        formattedNewTime: format(newTime, "h:mm a"),
        // Pre-generate message for each customer
        message: `Hi ${apt.customer.name}! I'm running about ${delayMinutes} minutes behind schedule today. Your new estimated arrival time for ${apt.pet?.name ? apt.pet.name + "'s" : "your"} appointment is around ${format(newTime, "h:mm a")}. I apologize for any inconvenience!`,
      };
    });

    return NextResponse.json({
      appointments: appointmentsWithNewETA,
      delayMinutes,
      contactMethods: groomer?.contactMethods || ["sms"],
    });
  } catch (error) {
    console.error("Running Late POST error:", error);
    return NextResponse.json(
      { error: "Failed to calculate new times" },
      { status: 500 }
    );
  }
}
