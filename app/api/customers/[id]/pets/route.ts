import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().optional(),
  breed: z.string().optional(),
  weight: z.number().positive().optional(),
  ageYears: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  groomingNotes: z.string().optional(),
  behaviorNotes: z.string().optional(),
  behaviorFlags: z.array(z.enum([
    "FRIENDLY",
    "ANXIOUS",
    "AGGRESSIVE",
    "BITE_RISK",
    "MUZZLE_REQUIRED",
    "TWO_PERSON_REQUIRED"
  ])).optional(),
  equipmentRequired: z.array(z.enum([
    "MUZZLE",
    "TABLE_EXTENDER",
    "HEAVY_DUTY_DRYER",
    "EXTRA_TOWELS",
    "SENSITIVE_SKIN_PRODUCTS"
  ])).optional(),
  specialHandling: z.string().optional(),
  canBookSolo: z.boolean().optional(),
});

// GET all pets for a customer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: customerId } = await params;

    // Verify customer belongs to this account
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const pets = await prisma.pet.findMany({
      where: {
        customerId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pets });
  } catch (error) {
    console.error("Get pets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pets" },
      { status: 500 }
    );
  }
}

// POST - Create new pet for customer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: customerId } = await params;
    const body = await req.json();
    const validatedData = createPetSchema.parse(body);

    // Verify customer belongs to this account
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Create pet
    const pet = await prisma.pet.create({
      data: {
        customerId,
        name: validatedData.name,
        species: validatedData.species || null,
        breed: validatedData.breed || null,
        weight: validatedData.weight || null,
        ageYears: validatedData.ageYears || null,
        notes: validatedData.notes || null,
        groomingNotes: validatedData.groomingNotes || null,
        behaviorNotes: validatedData.behaviorNotes || null,
        behaviorFlags: validatedData.behaviorFlags || [],
        equipmentRequired: validatedData.equipmentRequired || [],
        specialHandling: validatedData.specialHandling || null,
        canBookSolo: validatedData.canBookSolo ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      pet,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create pet error:", error);
    return NextResponse.json(
      { error: "Failed to create pet" },
      { status: 500 }
    );
  }
}
