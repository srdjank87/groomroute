import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

/**
 * GET /api/calm/no-show
 * Get today's appointments that could be marked as no-show
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
          error: "No-Show handling requires the Growth or Pro plan.",
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

    // Get today's active appointments (not completed, cancelled, or already no-show)
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
            noShowCount: true,
            cancellationCount: true,
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
      petName: apt.pet?.name,
      scheduledTime: apt.startAt.toISOString(),
      formattedTime: format(apt.startAt, "h:mm a"),
      price: apt.price,
      noShowCount: apt.customer.noShowCount || 0,
      cancellationCount: apt.customer.cancellationCount || 0,
      // Flag if this is a repeat offender
      isRepeatOffender: (apt.customer.noShowCount || 0) >= 2,
    }));

    return NextResponse.json({
      appointments: formattedAppointments,
      contactMethods: groomer?.contactMethods || ["sms"],
    });
  } catch (error) {
    console.error("No-Show GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calm/no-show
 * Mark an appointment as no-show and optionally notify customer
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get account to check subscription plan and business name
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true, name: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user can access Calm Control
    if (!canAccessCalmControl(account)) {
      return NextResponse.json(
        {
          error: "No-Show handling requires the Growth or Pro plan.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
        },
        { status: 403 }
      );
    }

    const businessName = account.name || "Your Groomer";
    const body = await req.json();
    const { appointmentId, notes } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Verify appointment belongs to this account
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        accountId,
      },
      include: {
        customer: true,
        pet: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update appointment to NO_SHOW status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "NO_SHOW",
        notes: notes
          ? `${appointment.notes || ""}\n[NO_SHOW] ${notes}`.trim()
          : appointment.notes,
      },
    });

    // Increment customer's no-show count
    await prisma.customer.update({
      where: { id: appointment.customerId },
      data: {
        noShowCount: {
          increment: 1,
        },
      },
    });

    // Get updated customer data
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: appointment.customerId },
      select: {
        name: true,
        noShowCount: true,
        cancellationCount: true,
      },
    });

    // Generate a message for the customer
    const message = `Hi ${appointment.customer.name}, this is ${businessName}. We missed you at your ${appointment.pet?.name ? appointment.pet.name + "'s " : ""}grooming appointment today. Please reach out when you'd like to reschedule. We hope everything is okay!`;

    return NextResponse.json({
      success: true,
      message: "Appointment marked as no-show",
      customer: updatedCustomer,
      suggestedMessage: message,
      isRepeatOffender: (updatedCustomer?.noShowCount || 0) >= 2,
      warning:
        (updatedCustomer?.noShowCount || 0) >= 2
          ? `${appointment.customer.name} has now missed ${updatedCustomer?.noShowCount} appointments. Consider requiring deposits for future bookings.`
          : null,
    });
  } catch (error) {
    console.error("No-Show POST error:", error);
    return NextResponse.json(
      { error: "Failed to mark as no-show" },
      { status: 500 }
    );
  }
}
