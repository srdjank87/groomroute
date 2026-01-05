import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";

// Sample customer data for demonstration - using real Austin, TX addresses
const SAMPLE_CUSTOMERS = [
  {
    name: "Sarah Johnson",
    phone: "(512) 555-0101",
    email: "sarah.j@example.com",
    address: "1100 Congress Ave, Austin, TX 78701",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
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
    phone: "(512) 555-0102",
    email: "mchen@example.com",
    address: "2525 W Anderson Ln, Austin, TX 78757",
    city: "Austin",
    state: "TX",
    zipCode: "78757",
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
    phone: "(512) 555-0103",
    email: "emily.r@example.com",
    address: "4001 S Lamar Blvd, Austin, TX 78704",
    city: "Austin",
    state: "TX",
    zipCode: "78704",
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
    phone: "(512) 555-0104",
    email: "dthompson@example.com",
    address: "9500 S IH 35 Frontage Rd, Austin, TX 78748",
    city: "Austin",
    state: "TX",
    zipCode: "78748",
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
    phone: "(512) 555-0105",
    email: "jmartinez@example.com",
    address: "5400 Brodie Ln, Austin, TX 78745",
    city: "Austin",
    state: "TX",
    zipCode: "78745",
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
    phone: "(512) 555-0106",
    email: "awilson@example.com",
    address: "10710 Research Blvd, Austin, TX 78759",
    city: "Austin",
    state: "TX",
    zipCode: "78759",
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
    phone: "(512) 555-0107",
    email: "rgarcia@example.com",
    address: "6001 W Parmer Ln, Austin, TX 78729",
    city: "Austin",
    state: "TX",
    zipCode: "78729",
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
    phone: "(512) 555-0108",
    email: "landerson@example.com",
    address: "1201 Barbara Jordan Blvd, Austin, TX 78723",
    city: "Austin",
    state: "TX",
    zipCode: "78723",
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
    phone: "(512) 555-0109",
    email: "kbrown@example.com",
    address: "2901 S Capital of Texas Hwy, Austin, TX 78746",
    city: "Austin",
    state: "TX",
    zipCode: "78746",
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
    phone: "(512) 555-0110",
    email: "jlee@example.com",
    address: "7701 N Lamar Blvd, Austin, TX 78752",
    city: "Austin",
    state: "TX",
    zipCode: "78752",
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
    // Random number of appointments (6-8) per day with staggered times
    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);

      // Random number of appointments between 6 and 8
      const numAppointments = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8

      // Shuffle customers and pick the random number
      const shuffledCustomers = [...createdCustomers].sort(() => Math.random() - 0.5);
      const selectedCustomers = shuffledCustomers.slice(0, numAppointments);

      // Define appointment time slots (9 AM to 5 PM in local time)
      const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];

      for (let i = 0; i < selectedCustomers.length; i++) {
        const { customer, pet, sampleData } = selectedCustomers[i];

        // Assign staggered times based on index (ensures different times)
        const hour = timeSlots[i % timeSlots.length];

        // Create date string in local time format to avoid timezone issues
        // Format: YYYY-MM-DDTHH:MM:SS (interpreted as local time)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const appointmentTime = new Date(`${year}-${month}-${day}T${String(hour).padStart(2, '0')}:00:00`);

        // Vary price slightly
        const basePrice = sampleData.duration >= 90 ? 85 : 65;
        const priceVariation = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const price = Math.max(50, basePrice + priceVariation);

        // Determine appointment status for past days
        // ~85% completed, ~10% cancelled, ~5% no-show
        let status: string;
        const isPast = dayOffset > 0;

        if (isPast) {
          const randomValue = Math.random();
          if (randomValue < 0.85) {
            status = "COMPLETED";
          } else if (randomValue < 0.95) {
            status = "CANCELLED";
          } else {
            status = "NO_SHOW";
          }
        } else {
          status = "CONFIRMED";
        }

        await prisma.appointment.create({
          data: {
            accountId,
            groomerId: groomer.id,
            customerId: customer.id,
            petId: pet.id,
            startAt: appointmentTime,
            serviceMinutes: sampleData.duration,
            status,
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
