import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { estimateDuration } from "@/lib/booking-duration";

/**
 * POST /api/book/create
 * Public endpoint - Create a booking from the public booking page
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      groomerSlug,
      clientName,
      clientEmail,
      clientPhone,
      address,
      lat,
      lng,
      zipCode,
      city,
      state,
      areaId,
      date,
      time,
      petName,
      petSpecies,
      petBreed,
      petSize, // small, medium, large, giant
      notes,
    } = body;

    // Convert pet size to approximate weight
    const sizeToWeight: Record<string, number> = {
      small: 15,
      medium: 35,
      large: 65,
      giant: 100,
    };
    const petWeight = petSize ? sizeToWeight[petSize] : null;

    // Estimate appointment duration from pet details
    let serviceDuration = 60; // default
    if (petSpecies && petBreed && petSize) {
      const estimate = estimateDuration({
        species: petSpecies,
        breed: petBreed,
        size: petSize,
      });
      serviceDuration = estimate.minutes;
    }

    // Validate required fields
    if (!groomerSlug) {
      return NextResponse.json(
        { error: "Groomer slug is required" },
        { status: 400 }
      );
    }
    if (!clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Client name, email, and phone are required" },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }
    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400 }
      );
    }
    if (!petName) {
      return NextResponse.json(
        { error: "Pet name is required" },
        { status: 400 }
      );
    }

    // Get groomer by slug
    const groomer = await prisma.groomer.findUnique({
      where: { bookingSlug: groomerSlug },
      select: {
        id: true,
        accountId: true,
        bookingEnabled: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer not found" },
        { status: 404 }
      );
    }

    if (!groomer.bookingEnabled) {
      return NextResponse.json(
        { error: "Online booking is not available" },
        { status: 403 }
      );
    }

    // Check if time slot is still available
    const [hours, minutes] = time.split(":");
    const startAt = new Date(`${date}T${hours}:${minutes}:00`);
    const endAt = new Date(startAt.getTime() + serviceDuration * 60 * 1000); // Use estimated duration

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        accountId: groomer.accountId,
        groomerId: groomer.id,
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        OR: [
          {
            // New appointment starts during existing
            startAt: {
              lte: startAt,
            },
            AND: {
              startAt: {
                gte: new Date(startAt.getTime() - 75 * 60 * 1000), // Allow 75 min before
              },
            },
          },
        ],
      },
    });

    // More accurate conflict check
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        accountId: groomer.accountId,
        groomerId: groomer.id,
        startAt: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59`),
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
    });

    const hasConflict = existingAppointments.some((apt) => {
      const aptStart = new Date(apt.startAt);
      const aptEnd = new Date(aptStart.getTime() + (apt.serviceMinutes + 15) * 60 * 1000);

      // Check if new appointment overlaps with existing
      return startAt < aptEnd && endAt > aptStart;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please select another time." },
        { status: 409 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        accountId: groomer.accountId,
        email: clientEmail.toLowerCase(),
      },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          accountId: groomer.accountId,
          name: clientName,
          email: clientEmail.toLowerCase(),
          phone: clientPhone,
          address,
          lat,
          lng,
          zipCode,
          city,
          state,
          geocodeStatus: lat && lng ? "OK" : "PENDING",
          serviceAreaId: areaId || undefined,
        },
      });
    } else {
      // Update existing customer's address if they provided a new one
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          phone: clientPhone,
          address,
          lat,
          lng,
          zipCode,
          city,
          state,
          geocodeStatus: lat && lng ? "OK" : customer.geocodeStatus,
          serviceAreaId: areaId || customer.serviceAreaId,
        },
      });
    }

    // Find or create pet
    let pet = await prisma.pet.findFirst({
      where: {
        customerId: customer.id,
        name: petName,
      },
    });

    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          customerId: customer.id,
          name: petName,
          species: petSpecies || "dog",
          breed: petBreed || null,
          weight: petWeight || null,
        },
      });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        accountId: groomer.accountId,
        groomerId: groomer.id,
        customerId: customer.id,
        petId: pet.id,
        startAt,
        serviceMinutes: serviceDuration, // Duration based on pet size/breed
        status: "BOOKED",
        appointmentType: "FULL_GROOM",
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
