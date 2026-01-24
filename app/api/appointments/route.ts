import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AppointmentType, AppointmentStatus } from "@prisma/client";
import { canAddAppointment, requireAdminRole } from "@/lib/feature-helpers";
import { getUserGroomerId } from "@/lib/get-user-groomer";
import { trackAppointmentCreated, checkAndTrackFirstAction } from "@/lib/posthog-server";
import { loopsOnFirstAppointmentCreated } from "@/lib/loops";
import { syncAppointmentToCalendar } from "@/lib/google-calendar";
import { hasFeature } from "@/lib/features";

const appointmentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  petId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  serviceType: z.string().min(1, "Service type is required"),
  serviceMinutes: z.number().min(1, "Service duration is required"),
  price: z.number().min(0, "Price is required"),
  notes: z.string().optional(),
  // Optional groomerId for Pro accounts with multi_groomer feature
  groomerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Groomer role cannot create appointments
    const roleError = requireAdminRole(session.user.role);
    if (roleError) {
      return NextResponse.json({ error: roleError.error }, { status: roleError.status });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const validatedData = appointmentSchema.parse(body);

    // Get account to check subscription plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check current month appointment count
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentMonthAppointments = await prisma.appointment.count({
      where: {
        accountId,
        startAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Check if user can add more appointments based on their plan
    const canAdd = await canAddAppointment(account, currentMonthAppointments);

    if (!canAdd.allowed) {
      return NextResponse.json(
        {
          error: canAdd.message,
          upgradeRequired: true,
          suggestedPlan: "GROWTH"
        },
        { status: 403 }
      );
    }

    // Determine which groomer to assign the appointment to
    let groomerId: string | null = null;

    // If groomerId is provided and user has multi_groomer feature (Pro plan), use it
    if (validatedData.groomerId && hasFeature(account.subscriptionPlan, "multi_groomer")) {
      // Verify the groomer belongs to this account
      const groomer = await prisma.groomer.findFirst({
        where: {
          id: validatedData.groomerId,
          accountId,
          isActive: true,
        },
      });

      if (!groomer) {
        return NextResponse.json(
          { error: "Invalid groomer selected" },
          { status: 400 }
        );
      }

      groomerId = groomer.id;
    } else {
      // Default behavior: use the current user's groomer (for Starter/Growth or when no groomerId specified)
      groomerId = await getUserGroomerId();
    }

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found. Please complete onboarding first." },
        { status: 400 }
      );
    }

    // Verify customer belongs to this account
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        accountId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If petId provided, verify it belongs to this customer
    if (validatedData.petId) {
      const pet = await prisma.pet.findFirst({
        where: {
          id: validatedData.petId,
          customerId: validatedData.customerId,
        },
      });

      if (!pet) {
        return NextResponse.json(
          { error: "Pet not found for this customer" },
          { status: 404 }
        );
      }
    }

    // Combine date and time into DateTime
    // Create date string without timezone to be interpreted as UTC
    // This ensures the time is stored exactly as entered
    const dateTimeString = `${validatedData.date}T${validatedData.time}:00.000Z`;
    const startAt = new Date(dateTimeString);

    // Check for scheduling conflicts (same groomer, overlapping time)
    // Get all appointments for this groomer on the same day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        groomerId,
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        startAt: {
          gte: new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate()),
          lt: new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate() + 1),
        },
      },
    });

    // Check for conflicts manually
    const newEndTime = startAt.getTime() + validatedData.serviceMinutes * 60000;
    const hasConflict = existingAppointments.some((appt) => {
      const apptEndTime = new Date(appt.startAt).getTime() + appt.serviceMinutes * 60000;
      const apptStartTime = new Date(appt.startAt).getTime();

      // Check if appointments overlap
      return (
        (startAt.getTime() >= apptStartTime && startAt.getTime() < apptEndTime) || // New starts during existing
        (newEndTime > apptStartTime && newEndTime <= apptEndTime) || // New ends during existing
        (startAt.getTime() <= apptStartTime && newEndTime >= apptEndTime) // New contains existing
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "This time slot conflicts with an existing appointment" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: validatedData.customerId,
        petId: validatedData.petId || null,
        groomerId,
        startAt,
        appointmentType: validatedData.serviceType as AppointmentType,
        serviceMinutes: validatedData.serviceMinutes,
        price: validatedData.price,
        notes: validatedData.notes || null,
        status: AppointmentStatus.CONFIRMED,
        accountId,
      },
      include: {
        customer: true,
        pet: true,
      },
    });

    // Track appointment creation in PostHog
    await trackAppointmentCreated(accountId, {
      appointmentType: validatedData.serviceType,
      serviceMinutes: validatedData.serviceMinutes,
      hasCustomer: true,
    });

    // Check if this is the first meaningful action and notify Loops
    const isFirstAction = await checkAndTrackFirstAction(accountId, "appointment_created");
    if (isFirstAction && session.user.email) {
      loopsOnFirstAppointmentCreated(session.user.email, accountId).catch((err) =>
        console.error("Loops appointment_created event failed:", err)
      );
    }

    // Sync to Google Calendar if connected (async, don't wait)
    const groomer = await prisma.groomer.findUnique({
      where: { id: groomerId },
      select: { name: true },
    });

    syncAppointmentToCalendar(accountId, {
      id: appointment.id,
      startAt: appointment.startAt,
      serviceMinutes: appointment.serviceMinutes,
      appointmentType: appointment.appointmentType,
      notes: appointment.notes,
      customer: {
        name: appointment.customer.name,
        phone: appointment.customer.phone,
        address: appointment.customer.address,
      },
      pet: appointment.pet,
      groomer: { name: groomer?.name || "Groomer" },
    }).catch((err) => console.error("Calendar sync failed:", err));

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// GET endpoint to list appointments
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const customerId = searchParams.get("customerId");
    const all = searchParams.get("all") === "true";

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      groomerId,
    };

    // If 'all' is not set, apply date/customer filters
    if (!all) {
      if (date) {
        // Parse date as UTC to match how appointments are stored
        // Appointments are stored with UTC timestamps (e.g., T09:00:00.000Z for 9 AM)
        const startOfDay = new Date(date + "T00:00:00.000Z");
        const endOfDay = new Date(date + "T23:59:59.999Z");

        where.startAt = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }

      if (customerId) {
        where.customerId = customerId;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: {
          include: {
            serviceArea: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        pet: true,
      },
      orderBy: {
        startAt: all ? "desc" : "asc", // Descending for 'all', ascending for date-specific
      },
      ...(all && { take: 100 }), // Limit to 100 most recent when fetching all
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
