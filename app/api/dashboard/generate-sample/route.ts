import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";
import { AppointmentStatus, BehaviorFlag, EquipmentRequired } from "@prisma/client";

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

// Additional groomers for team features (Pro plan testing)
const ADDITIONAL_GROOMERS = [
  {
    name: "Jessica Martinez",
    email: "jessica@groomroute.com",
    phone: "(512) 555-2001",
    baseAddress: "1601 Guadalupe St, Austin, TX 78701",
  },
  {
    name: "Marcus Johnson",
    email: "marcus@groomroute.com",
    phone: "(512) 555-2002",
    baseAddress: "2222 Rio Grande St, Austin, TX 78705",
  },
];

// Pet type definition for the sample data
interface SamplePet {
  name: string;
  breed: string;
  species: string;
  weight: number;
  ageYears?: number;
  behaviorFlags?: BehaviorFlag[];
  equipmentRequired?: EquipmentRequired[];
  behaviorNotes?: string;
  groomingNotes?: string;
}

// Customer type definition
interface SampleCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  areaName: string;
  pets: SamplePet[]; // Changed from single pet to array
  duration: number;
  // Flags for testing warning features
  isCanceller?: boolean; // Will have 3+ cancellations
  isNoShow?: boolean; // Will have 3+ no-shows
  addressNotes?: string;
  accessInstructions?: string;
}

// Sample customer data for demonstration - using real Austin, TX addresses
// Now with multiple pets per customer, behavior flags, and problem customers
const SAMPLE_CUSTOMERS: SampleCustomer[] = [
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
    pets: [
      {
        name: "Max",
        breed: "Golden Retriever",
        species: "dog",
        weight: 65,
        ageYears: 4,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Loves the dryer, very cooperative",
      },
      {
        name: "Buddy",
        breed: "Golden Retriever",
        species: "dog",
        weight: 70,
        ageYears: 6,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Max's brother, equally good boy",
      },
    ],
    duration: 90,
    addressNotes: "Blue house with white trim",
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
    pets: [
      {
        name: "Bella",
        breed: "Standard Poodle",
        species: "dog",
        weight: 45,
        ageYears: 3,
        behaviorFlags: [BehaviorFlag.ANXIOUS],
        equipmentRequired: [EquipmentRequired.SENSITIVE_SKIN_PRODUCTS],
        behaviorNotes: "Gets anxious with loud dryers, use low setting",
        groomingNotes: "Continental clip, show dog",
      },
    ],
    duration: 75,
    isCanceller: true, // Will have 3+ cancellations for testing warning
    addressNotes: "Apartment complex, building C",
    accessInstructions: "Gate code: 1234#, park in visitor spot",
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
    pets: [
      {
        name: "Daisy",
        breed: "Shih Tzu",
        species: "dog",
        weight: 12,
        ageYears: 7,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
      },
      {
        name: "Gizmo",
        breed: "Yorkshire Terrier",
        species: "dog",
        weight: 6,
        ageYears: 5,
        behaviorFlags: [BehaviorFlag.ANXIOUS],
        groomingNotes: "Tiny but feisty, prefers quick grooms",
      },
      {
        name: "Princess",
        breed: "Maltese",
        species: "dog",
        weight: 7,
        ageYears: 4,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Puppy cut, very sweet",
      },
    ],
    duration: 90,
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
    pets: [
      {
        name: "Sadie",
        breed: "Cavalier King Charles Spaniel",
        species: "dog",
        weight: 18,
        ageYears: 2,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Show coat, extra careful with ears",
      },
    ],
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
    pets: [
      {
        name: "Zeus",
        breed: "Rottweiler",
        species: "dog",
        weight: 110,
        ageYears: 5,
        behaviorFlags: [BehaviorFlag.AGGRESSIVE, BehaviorFlag.MUZZLE_REQUIRED],
        equipmentRequired: [EquipmentRequired.MUZZLE, EquipmentRequired.HEAVY_DUTY_DRYER],
        behaviorNotes: "Protective, needs slow introduction. ALWAYS use muzzle.",
      },
    ],
    duration: 120,
    isNoShow: true, // Will have 3+ no-shows for testing warning
    addressNotes: "Gated property",
    accessInstructions: "Call when arriving, owner will open gate",
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
    pets: [
      {
        name: "Charlie",
        breed: "Labrador Retriever",
        species: "dog",
        weight: 70,
        ageYears: 3,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Yellow lab, loves water during bath",
      },
      {
        name: "Scout",
        breed: "Labrador Retriever",
        species: "dog",
        weight: 65,
        ageYears: 2,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Black lab, Charlie's puppy",
      },
    ],
    duration: 90,
    addressNotes: "High-rise condo, unit 1205",
    accessInstructions: "Use service elevator, notify concierge",
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
    pets: [
      {
        name: "Tucker",
        breed: "Beagle",
        species: "dog",
        weight: 28,
        ageYears: 6,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Vocal during nail trims, otherwise great",
      },
    ],
    duration: 60,
    isCanceller: true, // Another canceller for testing
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
    pets: [
      {
        name: "Milo",
        breed: "Bernese Mountain Dog",
        species: "dog",
        weight: 95,
        ageYears: 4,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        equipmentRequired: [EquipmentRequired.HEAVY_DUTY_DRYER, EquipmentRequired.EXTRA_TOWELS, EquipmentRequired.TABLE_EXTENDER],
        groomingNotes: "Gentle giant, large breed needs extra time",
      },
    ],
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
    pets: [
      {
        name: "Oscar",
        breed: "Cockapoo",
        species: "dog",
        weight: 22,
        ageYears: 3,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
      },
      {
        name: "Felix",
        breed: "Domestic Shorthair",
        species: "cat",
        weight: 10,
        ageYears: 5,
        behaviorFlags: [BehaviorFlag.ANXIOUS],
        groomingNotes: "Cat - lion cut every 3 months, surprisingly calm",
      },
    ],
    duration: 75,
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
    pets: [
      {
        name: "Nala",
        breed: "Goldendoodle",
        species: "dog",
        weight: 55,
        ageYears: 2,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Teddy bear cut, super fluffy",
      },
    ],
    duration: 90,
    isNoShow: true, // No-show customer for testing
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
    pets: [
      {
        name: "Luna",
        breed: "French Bulldog",
        species: "dog",
        weight: 25,
        ageYears: 3,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        equipmentRequired: [EquipmentRequired.SENSITIVE_SKIN_PRODUCTS],
        groomingNotes: "Sensitive skin, use hypoallergenic products",
      },
      {
        name: "Stella",
        breed: "French Bulldog",
        species: "dog",
        weight: 22,
        ageYears: 2,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Luna's sister, same skin sensitivity",
      },
    ],
    duration: 60,
  },
  {
    name: "Jessica Santos",
    phone: "(512) 555-0112",
    email: "jsantos@example.com",
    address: "5400 Brodie Ln, Austin, TX 78745",
    city: "Austin",
    state: "TX",
    zipCode: "78745",
    areaName: "South Austin",
    pets: [
      {
        name: "Rocky",
        breed: "German Shepherd",
        species: "dog",
        weight: 80,
        ageYears: 4,
        behaviorFlags: [BehaviorFlag.ANXIOUS, BehaviorFlag.BITE_RISK],
        equipmentRequired: [EquipmentRequired.MUZZLE],
        behaviorNotes: "Protective of owner, nervous with strangers. Muzzle recommended.",
        groomingNotes: "Heavy shedder, deshed treatment every visit",
      },
    ],
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
    pets: [
      {
        name: "Cooper",
        breed: "Australian Shepherd",
        species: "dog",
        weight: 55,
        ageYears: 3,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Loves being brushed, perfect coat",
      },
      {
        name: "Murphy",
        breed: "Border Collie",
        species: "dog",
        weight: 45,
        ageYears: 5,
        behaviorFlags: [BehaviorFlag.ANXIOUS],
        behaviorNotes: "High energy, needs to be tired out before groom",
        groomingNotes: "Regular trim, hates nail grinding",
      },
      {
        name: "Penny",
        breed: "Australian Shepherd",
        species: "dog",
        weight: 48,
        ageYears: 1,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Puppy, still learning groom routine",
      },
    ],
    duration: 120,
  },
  {
    name: "Maria Gonzalez",
    phone: "(512) 555-0114",
    email: "mgonzalez@example.com",
    address: "6800 Manchaca Rd, Austin, TX 78745",
    city: "Austin",
    state: "TX",
    zipCode: "78745",
    areaName: "South Austin",
    pets: [
      {
        name: "Pepper",
        breed: "Miniature Schnauzer",
        species: "dog",
        weight: 15,
        ageYears: 8,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        groomingNotes: "Senior dog, takes her time",
      },
    ],
    duration: 60,
    isCanceller: true, // Third canceller
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
    pets: [
      {
        name: "Bear",
        breed: "Great Pyrenees",
        species: "dog",
        weight: 100,
        ageYears: 5,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        equipmentRequired: [EquipmentRequired.HEAVY_DUTY_DRYER, EquipmentRequired.EXTRA_TOWELS, EquipmentRequired.TABLE_EXTENDER],
        groomingNotes: "Massive fluffball, needs full deshed every visit",
      },
      {
        name: "Moose",
        breed: "Newfoundland",
        species: "dog",
        weight: 130,
        ageYears: 4,
        behaviorFlags: [BehaviorFlag.FRIENDLY],
        equipmentRequired: [EquipmentRequired.HEAVY_DUTY_DRYER, EquipmentRequired.EXTRA_TOWELS, EquipmentRequired.TABLE_EXTENDER],
        groomingNotes: "Even bigger than Bear, drools a lot",
      },
    ],
    duration: 180,
    addressNotes: "Ranch property with long driveway",
    accessInstructions: "Drive past the barn, house is on the left",
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

    // Get or create groomers for this account
    let primaryGroomer = await prisma.groomer.findFirst({
      where: {
        accountId,
        isActive: true,
      },
    });

    if (!primaryGroomer) {
      console.error("Sample data generation failed: No groomer found for accountId", accountId);
      return NextResponse.json(
        { error: "No groomer found. Please complete onboarding first." },
        { status: 400 }
      );
    }

    console.log("Found primary groomer:", primaryGroomer.id, "for account:", accountId);

    // Check if account is on Pro plan for multi-groomer support
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });
    const isProPlan = account?.subscriptionPlan === "PRO";

    // Create additional groomers for team features (Pro plan only)
    const allGroomers = [primaryGroomer];
    if (isProPlan) {
      for (const groomerData of ADDITIONAL_GROOMERS) {
        // Check if groomer with this email already exists
        const existingGroomer = await prisma.groomer.findFirst({
          where: {
            accountId,
            email: groomerData.email,
          },
        });

        if (!existingGroomer) {
          const geocodeResult = await geocodeAddress(groomerData.baseAddress);
          const newGroomer = await prisma.groomer.create({
            data: {
              accountId,
              name: groomerData.name,
              email: groomerData.email,
              phone: groomerData.phone,
              baseAddress: groomerData.baseAddress,
              baseLat: geocodeResult.success ? geocodeResult.lat : null,
              baseLng: geocodeResult.success ? geocodeResult.lng : null,
              geocodeStatus: geocodeResult.success ? "OK" : "FAILED",
              isActive: true,
            },
          });
          allGroomers.push(newGroomer);
          console.log("Created additional groomer:", newGroomer.name);
        } else {
          allGroomers.push(existingGroomer);
        }
      }
    } else {
      console.log("Skipping additional groomers - not on Pro plan");
    }

    // Generate appointments for the last 30 days (more data for analytics)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAppointmentsCreated = 0;
    let totalPetsCreated = 0;
    const createdCustomers: {
      customer: any;
      pets: any[];
      sampleData: SampleCustomer;
    }[] = [];

    // Create service areas first (just name + color)
    const areaIdsByName: { [key: string]: string } = {};

    for (const areaData of SERVICE_AREAS) {
      const existingArea = await prisma.serviceArea.findFirst({
        where: {
          accountId,
          name: areaData.name,
        },
      });

      if (existingArea) {
        areaIdsByName[areaData.name] = existingArea.id;
      } else {
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
    }

    console.log("Service areas ready:", Object.keys(areaIdsByName));

    // Create area day assignments for all groomers
    const dayAssignments = [
      { dayOfWeek: 1, areaName: "North Austin" },
      { dayOfWeek: 2, areaName: "Downtown & Central" },
      { dayOfWeek: 3, areaName: "South Austin" },
      { dayOfWeek: 4, areaName: "North Austin" },
      { dayOfWeek: 5, areaName: "Downtown & Central" },
      { dayOfWeek: 6, areaName: "South Austin" },
    ];

    for (const groomer of allGroomers) {
      for (const assignment of dayAssignments) {
        const areaId = areaIdsByName[assignment.areaName];
        if (areaId) {
          const existingAssignment = await prisma.areaDayAssignment.findUnique({
            where: {
              groomerId_dayOfWeek: {
                groomerId: groomer.id,
                dayOfWeek: assignment.dayOfWeek,
              },
            },
          });

          if (!existingAssignment) {
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
      }
    }

    console.log("Area day assignments ready for all groomers");

    // Create customers with geocoding, area assignment, and multiple pets
    for (const sampleCustomer of SAMPLE_CUSTOMERS) {
      const geocodeResult = await geocodeAddress(sampleCustomer.address);
      const serviceAreaId = areaIdsByName[sampleCustomer.areaName] || null;

      // Create customer with initial cancellation/no-show counts if flagged
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
          locationVerified: geocodeResult.success,
          serviceAreaId,
          addressNotes: sampleCustomer.addressNotes || null,
          accessInstructions: sampleCustomer.accessInstructions || null,
          // Set initial counts for problem customers (will be updated during appointment generation)
          cancellationCount: 0,
          noShowCount: 0,
          notes: "[SAMPLE_DATA] This is sample data to demonstrate GroomRoute's features.",
        },
      });

      // Create all pets for this customer
      const createdPets: any[] = [];
      for (const petData of sampleCustomer.pets) {
        const pet = await prisma.pet.create({
          data: {
            customerId: customer.id,
            name: petData.name,
            breed: petData.breed,
            species: petData.species,
            weight: petData.weight,
            ageYears: petData.ageYears || null,
            behaviorFlags: petData.behaviorFlags || [],
            equipmentRequired: petData.equipmentRequired || [],
            behaviorNotes: petData.behaviorNotes || null,
            groomingNotes: petData.groomingNotes || null,
          },
        });
        createdPets.push(pet);
        totalPetsCreated++;
      }

      createdCustomers.push({
        customer,
        pets: createdPets,
        sampleData: sampleCustomer,
      });
    }

    console.log(`Created ${createdCustomers.length} customers with ${totalPetsCreated} pets`);

    // Track cancellation/no-show counts per customer
    const customerCancellations: { [customerId: string]: number } = {};
    const customerNoShows: { [customerId: string]: number } = {};
    const customerLastCancellation: { [customerId: string]: Date } = {};
    const customerLastNoShow: { [customerId: string]: Date } = {};

    // Create appointments for today and the last 30 days (31 days total)
    // Generate appointments PER GROOMER to ensure each has a minimum of 4 per day
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);

      // Skip Sundays
      if (date.getDay() === 0) continue;

      // For each groomer, generate 4-6 appointments per day
      for (const assignedGroomer of allGroomers) {
        // Random number of appointments between 4 and 6 per groomer
        const numAppointmentsForGroomer = Math.floor(Math.random() * 3) + 4;

        // Shuffle customers and pick random ones for this groomer
        const shuffledCustomers = [...createdCustomers].sort(() => Math.random() - 0.5);
        const selectedCustomers = shuffledCustomers.slice(0, numAppointmentsForGroomer);

        // Each groomer starts at 9:00 AM
        let currentMinutes = 9 * 60;

        for (let i = 0; i < selectedCustomers.length; i++) {
          const { customer, pets, sampleData } = selectedCustomers[i];

        // Pick a random pet from this customer for this appointment
        const randomPetIndex = Math.floor(Math.random() * pets.length);
        const selectedPet = pets[randomPetIndex];

        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const appointmentTime = new Date(`${year}-${month}-${dayNum}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`);

        const driveTime = Math.floor(Math.random() * 11) + 15;
        currentMinutes += sampleData.duration + driveTime;

        // Vary price based on duration and add some randomness
        const basePrice = sampleData.duration >= 120 ? 120 : sampleData.duration >= 90 ? 85 : 65;
        const priceVariation = Math.floor(Math.random() * 21) - 10;
        const price = Math.max(50, basePrice + priceVariation);

        // Determine appointment status
        let status: AppointmentStatus;
        const isPast = dayOffset > 0;

        if (isPast) {
          // For problem customers, ensure they have enough cancellations/no-shows
          if (sampleData.isCanceller && Math.random() < 0.4) {
            status = AppointmentStatus.CANCELLED;
            customerCancellations[customer.id] = (customerCancellations[customer.id] || 0) + 1;
            customerLastCancellation[customer.id] = appointmentTime;
          } else if (sampleData.isNoShow && Math.random() < 0.4) {
            status = AppointmentStatus.NO_SHOW;
            customerNoShows[customer.id] = (customerNoShows[customer.id] || 0) + 1;
            customerLastNoShow[customer.id] = appointmentTime;
          } else {
            // Normal distribution for other appointments
            const randomValue = Math.random();
            if (randomValue < 0.88) {
              status = AppointmentStatus.COMPLETED;
            } else if (randomValue < 0.95) {
              status = AppointmentStatus.CANCELLED;
              customerCancellations[customer.id] = (customerCancellations[customer.id] || 0) + 1;
              customerLastCancellation[customer.id] = appointmentTime;
            } else {
              status = AppointmentStatus.NO_SHOW;
              customerNoShows[customer.id] = (customerNoShows[customer.id] || 0) + 1;
              customerLastNoShow[customer.id] = appointmentTime;
            }
          }
        } else {
          status = AppointmentStatus.CONFIRMED;
        }

        // Vary appointment types
        const appointmentTypes = [
          "FULL_GROOM",
          "FULL_GROOM",
          "FULL_GROOM",
          "BATH_BRUSH",
          "DESHED",
          "BATH_ONLY",
        ];
        const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];

        await prisma.appointment.create({
          data: {
            accountId,
            groomerId: assignedGroomer.id,
            customerId: customer.id,
            petId: selectedPet.id,
            startAt: appointmentTime,
            serviceMinutes: sampleData.duration,
            status,
            appointmentType: appointmentType as any,
            price: price,
            customerConfirmed: true, // All sample appointments are confirmed
          },
        });

        totalAppointmentsCreated++;
        }
      }
    }

    // Update customer cancellation and no-show counts
    for (const customerId of Object.keys(customerCancellations)) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          cancellationCount: customerCancellations[customerId],
          lastCancellationAt: customerLastCancellation[customerId] || null,
        },
      });
    }

    for (const customerId of Object.keys(customerNoShows)) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          noShowCount: customerNoShows[customerId],
          lastNoShowAt: customerLastNoShow[customerId] || null,
        },
      });
    }

    console.log("Updated customer cancellation/no-show counts");

    return NextResponse.json({
      success: true,
      customersCreated: SAMPLE_CUSTOMERS.length,
      petsCreated: totalPetsCreated,
      appointmentsCreated: totalAppointmentsCreated,
      groomersCreated: allGroomers.length - 1,
      areasCreated: SERVICE_AREAS.length,
      daysGenerated: 31,
      problemCustomers: {
        cancellers: SAMPLE_CUSTOMERS.filter(c => c.isCanceller).length,
        noShows: SAMPLE_CUSTOMERS.filter(c => c.isNoShow).length,
      },
    });
  } catch (error) {
    console.error("Generate sample data error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to generate sample data";

    if (errorMessage.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Sample data or areas may already exist. Try clearing existing data first." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
