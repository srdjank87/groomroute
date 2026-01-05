import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";
import { AppointmentStatus } from "@prisma/client";

// Service areas for demo - simple name + color groupings
const SERVICE_AREAS = [
  {
    name: "North Austin",
    color: "#3B82F6", // Blue
  },
  {
    name: "Downtown & Central",
    color: "#22C55E", // Green
  },
  {
    name: "South Austin",
    color: "#F59E0B", // Amber
  },
];

// Sample customer data for demonstration - using real Austin, TX addresses (15 customers)
// Customers are grouped by area for demo purposes
const SAMPLE_CUSTOMERS = [
  // North Austin customers (5)
  {
    name: "Sarah Johnson",
    phone: "(512) 555-0101",
    email: "sarah.j@example.com",
    address: "2525 W Anderson Ln, Austin, TX 78757",
    city: "Austin",
    state: "TX",
    zipCode: "78757",
    areaName: "North Austin",
    pet: {
      name: "Max",
      breed: "Golden Retriever",
      species: "dog",
      weight: 65,
    },
    duration: 90,
  },
  {
    name: "Michael Chen",
    phone: "(512) 555-0102",
    email: "mchen@example.com",
    address: "10710 Research Blvd, Austin, TX 78759",
    city: "Austin",
    state: "TX",
    zipCode: "78759",
    areaName: "North Austin",
    pet: {
      name: "Bella",
      breed: "Poodle",
      species: "dog",
      weight: 45,
    },
    duration: 60,
  },
  {
    name: "Amanda Wilson",
    phone: "(512) 555-0103",
    email: "awilson@example.com",
    address: "6001 W Parmer Ln, Austin, TX 78729",
    city: "Austin",
    state: "TX",
    zipCode: "78729",
    areaName: "North Austin",
    pet: {
      name: "Daisy",
      breed: "Shih Tzu",
      species: "dog",
      weight: 12,
    },
    duration: 60,
  },
  {
    name: "Jennifer Lee",
    phone: "(512) 555-0104",
    email: "jlee@example.com",
    address: "7701 N Lamar Blvd, Austin, TX 78752",
    city: "Austin",
    state: "TX",
    zipCode: "78752",
    areaName: "North Austin",
    pet: {
      name: "Sadie",
      breed: "Cavalier King Charles",
      species: "dog",
      weight: 18,
    },
    duration: 60,
  },
  {
    name: "Thomas Wright",
    phone: "(512) 555-0105",
    email: "twright@example.com",
    address: "9901 N Capital of Texas Hwy, Austin, TX 78759",
    city: "Austin",
    state: "TX",
    zipCode: "78759",
    areaName: "North Austin",
    pet: {
      name: "Zeus",
      breed: "Rottweiler",
      species: "dog",
      weight: 110,
    },
    duration: 120,
  },
  // Downtown & Central customers (5)
  {
    name: "Emily Rodriguez",
    phone: "(512) 555-0106",
    email: "emily.r@example.com",
    address: "1100 Congress Ave, Austin, TX 78701",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    areaName: "Downtown & Central",
    pet: {
      name: "Charlie",
      breed: "Labrador Retriever",
      species: "dog",
      weight: 70,
    },
    duration: 90,
  },
  {
    name: "Kevin Brown",
    phone: "(512) 555-0107",
    email: "kbrown@example.com",
    address: "2901 S Capital of Texas Hwy, Austin, TX 78746",
    city: "Austin",
    state: "TX",
    zipCode: "78746",
    areaName: "Downtown & Central",
    pet: {
      name: "Tucker",
      breed: "Beagle",
      species: "dog",
      weight: 28,
    },
    duration: 60,
  },
  {
    name: "Lisa Anderson",
    phone: "(512) 555-0108",
    email: "landerson@example.com",
    address: "1201 Barbara Jordan Blvd, Austin, TX 78723",
    city: "Austin",
    state: "TX",
    zipCode: "78723",
    areaName: "Downtown & Central",
    pet: {
      name: "Milo",
      breed: "Bernese Mountain Dog",
      species: "dog",
      weight: 95,
    },
    duration: 120,
  },
  {
    name: "Rachel Kim",
    phone: "(512) 555-0109",
    email: "rkim@example.com",
    address: "4001 S Lamar Blvd, Austin, TX 78704",
    city: "Austin",
    state: "TX",
    zipCode: "78704",
    areaName: "Downtown & Central",
    pet: {
      name: "Oscar",
      breed: "Cockapoo",
      species: "dog",
      weight: 22,
    },
    duration: 60,
  },
  {
    name: "Daniel Park",
    phone: "(512) 555-0110",
    email: "dpark@example.com",
    address: "1601 E Cesar Chavez St, Austin, TX 78702",
    city: "Austin",
    state: "TX",
    zipCode: "78702",
    areaName: "Downtown & Central",
    pet: {
      name: "Nala",
      breed: "Goldendoodle",
      species: "dog",
      weight: 55,
    },
    duration: 90,
  },
  // South Austin customers (5)
  {
    name: "David Thompson",
    phone: "(512) 555-0111",
    email: "dthompson@example.com",
    address: "9500 S IH 35 Frontage Rd, Austin, TX 78748",
    city: "Austin",
    state: "TX",
    zipCode: "78748",
    areaName: "South Austin",
    pet: {
      name: "Luna",
      breed: "French Bulldog",
      species: "dog",
      weight: 25,
    },
    duration: 60,
  },
  {
    name: "Jessica Martinez",
    phone: "(512) 555-0112",
    email: "jmartinez@example.com",
    address: "5400 Brodie Ln, Austin, TX 78745",
    city: "Austin",
    state: "TX",
    zipCode: "78745",
    areaName: "South Austin",
    pet: {
      name: "Rocky",
      breed: "German Shepherd",
      species: "dog",
      weight: 80,
    },
    duration: 90,
  },
  {
    name: "Robert Garcia",
    phone: "(512) 555-0113",
    email: "rgarcia@example.com",
    address: "4301 W William Cannon Dr, Austin, TX 78749",
    city: "Austin",
    state: "TX",
    zipCode: "78749",
    areaName: "South Austin",
    pet: {
      name: "Cooper",
      breed: "Australian Shepherd",
      species: "dog",
      weight: 55,
    },
    duration: 90,
  },
  {
    name: "Maria Santos",
    phone: "(512) 555-0114",
    email: "msantos@example.com",
    address: "6800 Manchaca Rd, Austin, TX 78745",
    city: "Austin",
    state: "TX",
    zipCode: "78745",
    areaName: "South Austin",
    pet: {
      name: "Pepper",
      breed: "Miniature Schnauzer",
      species: "dog",
      weight: 15,
    },
    duration: 60,
  },
  {
    name: "Chris Taylor",
    phone: "(512) 555-0115",
    email: "ctaylor@example.com",
    address: "1700 Slaughter Ln, Austin, TX 78748",
    city: "Austin",
    state: "TX",
    zipCode: "78748",
    areaName: "South Austin",
    pet: {
      name: "Bear",
      breed: "Great Pyrenees",
      species: "dog",
      weight: 100,
    },
    duration: 120,
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

    // Generate appointments for the last 14 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAppointmentsCreated = 0;
    const createdCustomers: any[] = [];

    // Create service areas first (just name + color)
    const areaIdsByName: { [key: string]: string } = {}; // areaName -> areaId mapping

    for (const areaData of SERVICE_AREAS) {
      const area = await prisma.serviceArea.create({
        data: {
          accountId,
          name: areaData.name,
          color: areaData.color,
          isActive: true,
        },
      });

      areaIdsByName[areaData.name] = area.id;
    }

    console.log("Created service areas:", Object.keys(areaIdsByName));

    // Create area day assignments for the groomer
    // Monday & Thursday: North Austin
    // Tuesday & Friday: Downtown & Central
    // Wednesday & Saturday: South Austin
    const dayAssignments = [
      { dayOfWeek: 1, areaName: "North Austin" },     // Monday
      { dayOfWeek: 2, areaName: "Downtown & Central" }, // Tuesday
      { dayOfWeek: 3, areaName: "South Austin" },     // Wednesday
      { dayOfWeek: 4, areaName: "North Austin" },     // Thursday
      { dayOfWeek: 5, areaName: "Downtown & Central" }, // Friday
      { dayOfWeek: 6, areaName: "South Austin" },     // Saturday
    ];

    for (const assignment of dayAssignments) {
      const areaId = areaIdsByName[assignment.areaName];
      if (areaId) {
        await prisma.areaDayAssignment.create({
          data: {
            accountId,
            groomerId: groomer.id,
            areaId,
            dayOfWeek: assignment.dayOfWeek,
          },
        });
      }
    }

    console.log("Created area day assignments for groomer");

    // Create customers with geocoding and area assignment
    for (const sampleCustomer of SAMPLE_CUSTOMERS) {
      // Geocode the address
      const geocodeResult = await geocodeAddress(sampleCustomer.address);

      // Find the matching service area by name
      const serviceAreaId = areaIdsByName[sampleCustomer.areaName] || null;

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
          locationVerified: geocodeResult.success, // Mark as verified if geocoded successfully
          serviceAreaId, // Assign to service area by name
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

    // Create appointments for today and the last 14 days (15 days total)
    // Random number of appointments (4-8) per day with staggered times
    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);

      // Random number of appointments between 4 and 8
      const numAppointments = Math.floor(Math.random() * 5) + 4; // 4, 5, 6, 7, or 8

      // Shuffle customers and pick the random number
      const shuffledCustomers = [...createdCustomers].sort(() => Math.random() - 0.5);
      const selectedCustomers = shuffledCustomers.slice(0, numAppointments);

      // Define appointment time slots (9 AM to 5 PM in local time)
      const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];

      for (let i = 0; i < selectedCustomers.length; i++) {
        const { customer, pet, sampleData } = selectedCustomers[i];

        // Assign staggered times based on index (ensures different times)
        const hour = timeSlots[i % timeSlots.length];

        // Create date with explicit UTC timezone
        // We store times as UTC - the frontend will convert to local time for display
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const appointmentTime = new Date(`${year}-${month}-${dayNum}T${String(hour).padStart(2, '0')}:00:00.000Z`);

        // Vary price slightly
        const basePrice = sampleData.duration >= 90 ? 85 : 65;
        const priceVariation = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const price = Math.max(50, basePrice + priceVariation);

        // Determine appointment status for past days
        // ~85% completed, ~10% cancelled, ~5% no-show
        let status: AppointmentStatus;
        const isPast = dayOffset > 0;

        if (isPast) {
          const randomValue = Math.random();
          if (randomValue < 0.85) {
            status = AppointmentStatus.COMPLETED;
          } else if (randomValue < 0.95) {
            status = AppointmentStatus.CANCELLED;
          } else {
            status = AppointmentStatus.NO_SHOW;
          }
        } else {
          status = AppointmentStatus.CONFIRMED;
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
      areasCreated: SERVICE_AREAS.length,
      daysGenerated: 15,
    });
  } catch (error) {
    console.error("Generate sample data error:", error);
    return NextResponse.json(
      { error: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}
