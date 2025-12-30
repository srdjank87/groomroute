import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Sample customer data for demonstration
const SAMPLE_CUSTOMERS = [
  {
    name: "Sarah Johnson",
    phone: "(555) 123-4567",
    email: "sarah.j@example.com",
    address: "123 Oak Street, Springfield, IL 62701",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    pet: {
      name: "Max",
      breed: "Golden Retriever",
      species: "dog",
      weight: 65,
    },
    time: 9, // 9 AM
    duration: 90,
  },
  {
    name: "Michael Chen",
    phone: "(555) 234-5678",
    email: "mchen@example.com",
    address: "456 Maple Avenue, Springfield, IL 62702",
    city: "Springfield",
    state: "IL",
    zipCode: "62702",
    pet: {
      name: "Bella",
      breed: "Poodle",
      species: "dog",
      weight: 45,
    },
    time: 11, // 11 AM
    duration: 60,
  },
  {
    name: "Emily Rodriguez",
    phone: "(555) 345-6789",
    email: "emily.r@example.com",
    address: "789 Pine Road, Springfield, IL 62703",
    city: "Springfield",
    state: "IL",
    zipCode: "62703",
    pet: {
      name: "Charlie",
      breed: "Labrador Retriever",
      species: "dog",
      weight: 70,
    },
    time: 13, // 1 PM
    duration: 90,
  },
  {
    name: "David Thompson",
    phone: "(555) 456-7890",
    email: "dthompson@example.com",
    address: "321 Elm Street, Springfield, IL 62704",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    pet: {
      name: "Luna",
      breed: "French Bulldog",
      species: "dog",
      weight: 25,
    },
    time: 15, // 3 PM
    duration: 60,
  },
  {
    name: "Jessica Martinez",
    phone: "(555) 567-8901",
    email: "jmartinez@example.com",
    address: "654 Birch Lane, Springfield, IL 62705",
    city: "Springfield",
    state: "IL",
    zipCode: "62705",
    pet: {
      name: "Rocky",
      breed: "German Shepherd",
      species: "dog",
      weight: 80,
    },
    time: 16, // 4 PM
    duration: 90,
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Check if sample data already exists
    const existingSampleData = await prisma.customer.findFirst({
      where: {
        accountId,
        notes: {
          contains: "[SAMPLE_DATA]",
        },
      },
    });

    if (existingSampleData) {
      return NextResponse.json(
        { error: "Sample data already exists" },
        { status: 400 }
      );
    }

    // Get the first groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: {
        accountId,
        isActive: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found. Please complete onboarding first." },
        { status: 400 }
      );
    }

    // Create sample customers, pets, and appointments for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdAppointments = [];

    for (const sampleCustomer of SAMPLE_CUSTOMERS) {
      // Create customer
      const customer = await prisma.customer.create({
        data: {
          accountId,
          name: sampleCustomer.name,
          phone: sampleCustomer.phone,
          email: sampleCustomer.email,
          address: sampleCustomer.address,
          city: sampleCustomer.city,
          state: sampleCustomer.state,
          zipCode: sampleCustomer.zipCode,
          notes: "[SAMPLE_DATA] This is sample data to demonstrate GroomRoute's route optimization features.",
          geocodeStatus: "PENDING",
        },
      });

      // Create pet
      const pet = await prisma.pet.create({
        data: {
          customerId: customer.id,
          name: sampleCustomer.pet.name,
          breed: sampleCustomer.pet.breed,
          species: sampleCustomer.pet.species,
          weight: sampleCustomer.pet.weight,
        },
      });

      // Create appointment for today
      const appointmentTime = new Date(today);
      appointmentTime.setHours(sampleCustomer.time, 0, 0, 0);

      const appointment = await prisma.appointment.create({
        data: {
          accountId,
          groomerId: groomer.id,
          customerId: customer.id,
          petId: pet.id,
          startAt: appointmentTime,
          serviceMinutes: sampleCustomer.duration,
          status: "CONFIRMED",
          appointmentType: "FULL_GROOM",
          price: sampleCustomer.duration === 90 ? 85 : 65,
          customerConfirmed: true,
        },
      });

      createdAppointments.push(appointment);
    }

    // Create an optimized route for today
    const route = await prisma.route.create({
      data: {
        accountId,
        groomerId: groomer.id,
        routeDate: today,
        status: "PUBLISHED",
        // Sample stats showing optimization benefits
        totalDriveMinutes: 45, // Optimized drive time
        totalDistanceMeters: 24140, // ~15 miles
        totalServiceMinutes: 390, // Total service time
        efficiencyScore: 89.7, // High efficiency score
        estimatedGasCost: 2.65,
      },
    });

    // Create route stops
    for (let i = 0; i < createdAppointments.length; i++) {
      const appointment = createdAppointments[i];

      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          appointmentId: appointment.id,
          sequence: i + 1,
          arrivalTime: appointment.startAt,
          stopType: "APPOINTMENT",
          driveMinutesFromPrev: i === 0 ? 0 : Math.floor(Math.random() * 10) + 5,
          distanceMetersFromPrev:
            i === 0 ? 0 : Math.floor(Math.random() * 5000) + 3000,
        },
      });
    }

    return NextResponse.json({
      success: true,
      customersCreated: SAMPLE_CUSTOMERS.length,
      appointmentsCreated: createdAppointments.length,
      routeId: route.id,
    });
  } catch (error) {
    console.error("Generate sample data error:", error);
    return NextResponse.json(
      { error: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}
