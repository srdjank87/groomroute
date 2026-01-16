import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/feature-helpers";
import { geocodeAddress } from "@/lib/geocoding";

interface ImportPet {
  name: string;
  species: string;
  breed: string;
  weight: number | null;
  notes: string;
}

interface ImportClient {
  name: string;
  phone: string;
  email: string;
  address: string;
  pets: ImportPet[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can import
    const roleError = requireAdminRole(session.user.role);
    if (roleError) {
      return NextResponse.json({ error: roleError.error }, { status: roleError.status });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { clients } = body as { clients: ImportClient[] };

    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      return NextResponse.json(
        { error: "No clients to import" },
        { status: 400 }
      );
    }

    // Get existing customers to check for duplicates
    const existingCustomers = await prisma.customer.findMany({
      where: { accountId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    // Create a map for duplicate detection
    const existingMap = new Map<string, string>();
    existingCustomers.forEach((c) => {
      // Key by normalized phone
      if (c.phone) {
        const normalizedPhone = c.phone.replace(/\D/g, "");
        if (normalizedPhone.length >= 10) {
          existingMap.set(`phone:${normalizedPhone.slice(-10)}`, c.id);
        }
      }
      // Key by email
      if (c.email) {
        existingMap.set(`email:${c.email.toLowerCase()}`, c.id);
      }
    });

    let clientsCreated = 0;
    let petsCreated = 0;
    let skipped = 0;

    // Process clients in batches
    for (const client of clients) {
      // Check for duplicates
      let isDuplicate = false;

      if (client.phone) {
        const normalizedPhone = client.phone.replace(/\D/g, "");
        if (normalizedPhone.length >= 10) {
          if (existingMap.has(`phone:${normalizedPhone.slice(-10)}`)) {
            isDuplicate = true;
          }
        }
      }

      if (!isDuplicate && client.email) {
        if (existingMap.has(`email:${client.email.toLowerCase()}`)) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        skipped++;
        continue;
      }

      // Geocode address
      const geocodeResult = client.address
        ? await geocodeAddress(client.address)
        : { success: false, lat: null, lng: null };

      // Create customer with pets in transaction
      await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.create({
          data: {
            accountId,
            name: client.name,
            phone: client.phone || null,
            email: client.email || null,
            address: client.address || "",
            lat: geocodeResult.success ? geocodeResult.lat : null,
            lng: geocodeResult.success ? geocodeResult.lng : null,
            geocodeStatus: geocodeResult.success ? "OK" : client.address ? "FAILED" : "PENDING",
          },
        });

        // Add to duplicate map to prevent duplicates within same import
        if (client.phone) {
          const normalizedPhone = client.phone.replace(/\D/g, "");
          if (normalizedPhone.length >= 10) {
            existingMap.set(`phone:${normalizedPhone.slice(-10)}`, customer.id);
          }
        }
        if (client.email) {
          existingMap.set(`email:${client.email.toLowerCase()}`, customer.id);
        }

        clientsCreated++;

        // Create pets
        for (const pet of client.pets) {
          await tx.pet.create({
            data: {
              customerId: customer.id,
              name: pet.name,
              species: normalizeSpecies(pet.species),
              breed: pet.breed || null,
              weight: pet.weight,
              specialHandling: pet.notes || null,
            },
          });
          petsCreated++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      clientsCreated,
      petsCreated,
      skipped,
    });
  } catch (error) {
    console.error("Import customers error:", error);
    return NextResponse.json(
      { error: "Failed to import customers" },
      { status: 500 }
    );
  }
}

function normalizeSpecies(species: string): string {
  const normalized = species.toLowerCase().trim();
  if (normalized.includes("cat") || normalized.includes("feline")) {
    return "cat";
  }
  if (normalized.includes("dog") || normalized.includes("canine")) {
    return "dog";
  }
  return normalized || "dog";
}
