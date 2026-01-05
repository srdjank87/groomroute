import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";

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
    time: 10, // 10 AM
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
    time: 11, // 11 AM
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
    time: 12, // 12 PM
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
    time: 13, // 1 PM
    duration: 90,
  },
  {
    name: "Amanda Wilson",
    phone: "(555) 678-9012",
    email: "awilson@example.com",
    address: "987 Cedar Court, Springfield, IL 62706",
    city: "Springfield",
    state: "IL",
    zipCode: "62706",
    pet: {
      name: "Daisy",
      breed: "Shih Tzu",
      species: "dog",
      weight: 12,
    },
    time: 14, // 2 PM
    duration: 60,
  },
  {
    name: "Robert Garcia",
    phone: "(555) 789-0123",
    email: "rgarcia@example.com",
    address: "147 Walnut Drive, Springfield, IL 62707",
    city: "Springfield",
    state: "IL",
    zipCode: "62707",
    pet: {
      name: "Cooper",
      breed: "Australian Shepherd",
      species: "dog",
      weight: 55,
    },
    time: 15, // 3 PM
    duration: 90,
  },
  {
    name: "Lisa Anderson",
    phone: "(555) 890-1234",
    email: "landerson@example.com",
    address: "258 Spruce Way, Springfield, IL 62708",
    city: "Springfield",
    state: "IL",
    zipCode: "62708",
    pet: {
      name: "Milo",
      breed: "Bernese Mountain Dog",
      species: "dog",
      weight: 95,
    },
    time: 16, // 4 PM
    duration: 120,
  },
  {
    name: "Kevin Brown",
    phone: "(555) 901-2345",
    email: "kbrown@example.com",
    address: "369 Ash Boulevard, Springfield, IL 62709",
    city: "Springfield",
    state: "IL",
    zipCode: "62709",
    pet: {
      name: "Tucker",
      breed: "Beagle",
      species: "dog",
      weight: 28,
    },
    time: 17, // 5 PM
    duration: 60,
  },
  {
    name: "Jennifer Lee",
    phone: "(555) 012-3456",
    email: "jlee@example.com",
    address: "480 Hickory Lane, Springfield, IL 62710",
    city: "Springfield",
    state: "IL",
    zipCode: "62710",
    pet: {
      name: "Sadie",
      breed: "Cavalier King Charles",
      species: "dog",
      weight: 18,
    },
    time: 18, // 6 PM
    duration: 60,
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
      console.log("Sample data already exists for accountId", accountId);
      return NextResponse.json(
        { error: "Sample data already exists" },
        { status: 400 }
      );
    }

    console.log("No existing sample data found, proceeding to generate...");

    // Get the first groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: {
        accountId,
        isActive: true,
      },
    });

    if (!groomer) {
      console.error("Sample data generation failed: No groomer found for accountId", accountId);
      return NextResponse.json(
        { error: "No groomer found. Please complete onboarding first." },
        { status: 400 }
      );
    }

    console.log("Found groomer:", groomer.id, "for account:", accountId);

    // Generate appointments for the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAppointmentsCreated = 0;
    const createdCustomers: any[] = [];

    // Create customers first with geocoding
    for (const sampleCustomer of SAMPLE_CUSTOMERS) {
      // Geocode the address
      const geocodeResult = await geocodeAddress(sampleCustomer.address);

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
          lat: geocodeResult.success ? geocodeResult.lat : null,
          lng: geocodeResult.success ? geocodeResult.lng : null,
          geocodeStatus: geocodeResult.success ? "OK" : "FAILED",
          notes: "[SAMPLE_DATA] This is sample data to demonstrate GroomRoute's features.",
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

      createdCustomers.push({
        customer,
        pet,
        sampleData: sampleCustomer,
      });
    }

    // Create appointments for today and the last 7 days (8 days total)
    // Random number of appointments (6-10) per day
    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);

      // Random number of appointments between 6 and 8
      const numAppointments = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8

      // Shuffle customers and pick the random number
      const shuffledCustomers = [...createdCustomers].sort(() => Math.random() - 0.5);
      const selectedCustomers = shuffledCustomers.slice(0, numAppointments);

      for (let i = 0; i < selectedCustomers.length; i++) {
        const { customer, pet, sampleData } = selectedCustomers[i];

        // Use the scheduled time from sample data
        const appointmentTime = new Date(date);
        appointmentTime.setHours(sampleData.time, 0, 0, 0);

        // Vary price slightly
        const basePrice = sampleData.duration >= 90 ? 85 : 65;
        const priceVariation = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const price = Math.max(50, basePrice + priceVariation);

        // Mark appointments from past days as completed
        const isPast = dayOffset > 0;

        await prisma.appointment.create({
          data: {
            accountId,
            groomerId: groomer.id,
            customerId: customer.id,
            petId: pet.id,
            startAt: appointmentTime,
            serviceMinutes: sampleData.duration,
            status: isPast ? "COMPLETED" : "CONFIRMED",
            appointmentType: "FULL_GROOM",
            price: price,
            customerConfirmed: true,
          },
        });

        totalAppointmentsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      customersCreated: SAMPLE_CUSTOMERS.length,
      appointmentsCreated: totalAppointmentsCreated,
      daysGenerated: 8,
    });
  } catch (error) {
    console.error("Generate sample data error:", error);
    return NextResponse.json(
      { error: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}
