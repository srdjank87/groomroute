import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePetSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  weight: z.number().positive().optional().nullable(),
  ageYears: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  groomingNotes: z.string().optional().nullable(),
  behaviorNotes: z.string().optional().nullable(),
  behaviorFlags: z.array(z.enum([
    "FRIENDLY",
    "ANXIOUS",
    "AGGRESSIVE",
    "BITE_RISK",
    "MUZZLE_REQUIRED"
  ])).optional(),
  equipmentRequired: z.array(z.enum([
    "MUZZLE",
    "TABLE_EXTENDER",
    "HEAVY_DUTY_DRYER",
    "EXTRA_TOWELS",
    "SENSITIVE_SKIN_PRODUCTS"
  ])).optional(),
  specialHandling: z.string().optional().nullable(),
});

// GET single pet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; petId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: customerId, petId } = await params;

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

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Get pet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pet" },
      { status: 500 }
    );
  }
}

// PATCH - Update pet
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; petId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: customerId, petId } = await params;
    const body = await req.json();
    const validatedData = updatePetSchema.parse(body);

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

    // Verify pet exists and belongs to customer
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId,
      },
    });

    if (!existingPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Update pet
    const pet = await prisma.pet.update({
      where: { id: petId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.species !== undefined && { species: validatedData.species || null }),
        ...(validatedData.breed !== undefined && { breed: validatedData.breed || null }),
        ...(validatedData.weight !== undefined && { weight: validatedData.weight }),
        ...(validatedData.ageYears !== undefined && { ageYears: validatedData.ageYears }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.groomingNotes !== undefined && { groomingNotes: validatedData.groomingNotes }),
        ...(validatedData.behaviorNotes !== undefined && { behaviorNotes: validatedData.behaviorNotes }),
        ...(validatedData.behaviorFlags !== undefined && { behaviorFlags: validatedData.behaviorFlags }),
        ...(validatedData.equipmentRequired !== undefined && { equipmentRequired: validatedData.equipmentRequired }),
        ...(validatedData.specialHandling !== undefined && { specialHandling: validatedData.specialHandling }),
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

    console.error("Update pet error:", error);
    return NextResponse.json(
      { error: "Failed to update pet" },
      { status: 500 }
    );
  }
}

// DELETE pet
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; petId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: customerId, petId } = await params;

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

    // Verify pet exists and belongs to customer
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId,
      },
    });

    if (!existingPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Delete pet
    await prisma.pet.delete({
      where: { id: petId },
    });

    return NextResponse.json({
      success: true,
      message: "Pet deleted successfully",
    });
  } catch (error) {
    console.error("Delete pet error:", error);
    return NextResponse.json(
      { error: "Failed to delete pet" },
      { status: 500 }
    );
  }
}
