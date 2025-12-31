import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { BehaviorFlag } from "@prisma/client";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  addressNotes: z.string().optional(),
  accessInstructions: z.string().optional(),
  notes: z.string().optional(),
  // Pet data (optional)
  petName: z.string().optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  weight: z.string().optional(),
  behaviorFlags: z.array(z.string()).optional(),
  specialHandling: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const validatedData = customerSchema.parse(body);

    // Create customer in transaction (with optional pet)
    const result = await prisma.$transaction(async (tx) => {
      // Create customer
      const customer = await tx.customer.create({
        data: {
          accountId,
          name: validatedData.name,
          phone: validatedData.phone || null,
          email: validatedData.email || null,
          address: validatedData.address,
          addressNotes: validatedData.addressNotes || null,
          accessInstructions: validatedData.accessInstructions || null,
          notes: validatedData.notes || null,
          geocodeStatus: "PENDING",
        },
      });

      // Create pet if provided
      let pet = null;
      if (validatedData.petName) {
        pet = await tx.pet.create({
          data: {
            customerId: customer.id,
            name: validatedData.petName,
            species: validatedData.species || "dog",
            breed: validatedData.breed || null,
            weight: validatedData.weight ? parseFloat(validatedData.weight) : null,
            behaviorFlags: (validatedData.behaviorFlags || []) as BehaviorFlag[],
            specialHandling: validatedData.specialHandling || null,
          },
        });
      }

      return { customer, pet };
    });

    // TODO: Trigger geocoding in background
    // This would be a separate service that geocodes the address
    // and updates the customer record with lat/lng

    return NextResponse.json({
      success: true,
      customer: result.customer,
      pet: result.pet,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

// GET endpoint to list customers
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const customers = await prisma.customer.findMany({
      where: {
        accountId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        pets: true,
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
