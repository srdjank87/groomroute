import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

/**
 * GET /api/calm/contact
 * Get today's appointments with contact information for quick calling/messaging
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
          error: "Quick Contact requires the Growth or Pro plan.",
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
            address: true,
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
      customerId: apt.customer.id,
      customerPhone: apt.customer.phone,
      customerAddress: apt.customer.address,
      petName: apt.pet?.name,
      scheduledTime: apt.startAt.toISOString(),
      formattedTime: format(apt.startAt, "h:mm a"),
      status: apt.status,
    }));

    // Get the next appointment (first one)
    const nextAppointment = formattedAppointments.length > 0 ? formattedAppointments[0] : null;

    return NextResponse.json({
      appointments: formattedAppointments,
      nextAppointment,
      contactMethods: groomer?.contactMethods || ["sms", "call"],
    });
  } catch (error) {
    console.error("Contact GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
