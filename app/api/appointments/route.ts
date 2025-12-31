import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const appointmentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  petId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  serviceType: z.string().min(1, "Service type is required"),
  serviceMinutes: z.number().min(1, "Service duration is required"),
  price: z.number().min(0, "Price is required"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const validatedData = appointmentSchema.parse(body);

    // Get the groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
    });

    if (!groomer) {
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
    const startAt = new Date(`${validatedData.date}T${validatedData.time}`);

    // Check for scheduling conflicts (same groomer, overlapping time)
    const endAt = new Date(startAt.getTime() + validatedData.serviceMinutes * 60000);

    const conflictingAppt = await prisma.appointment.findFirst({
      where: {
        groomerId: groomer.id,
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        OR: [
          {
            // New appointment starts during existing appointment
            AND: [
              { startAt: { lte: startAt } },
              { endAt: { gt: startAt } },
            ],
          },
          {
            // New appointment ends during existing appointment
            AND: [
              { startAt: { lt: endAt } },
              { endAt: { gte: endAt } },
            ],
          },
          {
            // New appointment completely contains existing appointment
            AND: [
              { startAt: { gte: startAt } },
              { endAt: { lte: endAt } },
            ],
          },
        ],
      },
    });

    if (conflictingAppt) {
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
        groomerId: groomer.id,
        startAt,
        endAt,
        appointmentType: validatedData.serviceType,
        serviceMinutes: validatedData.serviceMinutes,
        price: validatedData.price,
        notes: validatedData.notes || null,
        status: "SCHEDULED",
      },
      include: {
        customer: true,
        pet: true,
      },
    });

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

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      groomerId: groomer.id,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.startAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        pet: true,
      },
      orderBy: {
        startAt: "asc",
      },
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
