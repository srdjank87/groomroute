import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating/updating service areas
const serviceAreaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  zipCodes: z.array(z.string().min(1)).min(1, "At least one zip code is required"),
  centerLat: z.number().optional(),
  centerLng: z.number().optional(),
  radiusMiles: z.number().positive().optional(),
});

// GET - List all service areas for the account
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const areas = await prisma.serviceArea.findMany({
      where: {
        accountId: session.user.accountId,
      },
      include: {
        _count: {
          select: { customers: true },
        },
        dayAssignments: {
          include: {
            groomer: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform the data for easier consumption
    const transformedAreas = areas.map((area) => ({
      id: area.id,
      name: area.name,
      color: area.color,
      zipCodes: area.zipCodes,
      centerLat: area.centerLat,
      centerLng: area.centerLng,
      radiusMiles: area.radiusMiles,
      isActive: area.isActive,
      customerCount: area._count.customers,
      // Group day assignments by day
      assignedDays: area.dayAssignments.map((da) => ({
        dayOfWeek: da.dayOfWeek,
        groomerId: da.groomer.id,
        groomerName: da.groomer.name,
      })),
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    }));

    return NextResponse.json({ success: true, areas: transformedAreas });
  } catch (error) {
    console.error("Error fetching service areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch service areas" },
      { status: 500 }
    );
  }
}

// POST - Create a new service area
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = serviceAreaSchema.parse(body);

    // Check for duplicate name within the account
    const existingArea = await prisma.serviceArea.findFirst({
      where: {
        accountId: session.user.accountId,
        name: validatedData.name,
      },
    });

    if (existingArea) {
      return NextResponse.json(
        { error: "An area with this name already exists" },
        { status: 400 }
      );
    }

    const area = await prisma.serviceArea.create({
      data: {
        accountId: session.user.accountId,
        name: validatedData.name,
        color: validatedData.color,
        zipCodes: validatedData.zipCodes,
        centerLat: validatedData.centerLat,
        centerLng: validatedData.centerLng,
        radiusMiles: validatedData.radiusMiles,
      },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      area: {
        id: area.id,
        name: area.name,
        color: area.color,
        zipCodes: area.zipCodes,
        centerLat: area.centerLat,
        centerLng: area.centerLng,
        radiusMiles: area.radiusMiles,
        isActive: area.isActive,
        customerCount: area._count.customers,
        assignedDays: [],
        createdAt: area.createdAt,
        updatedAt: area.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating service area:", error);
    return NextResponse.json(
      { error: "Failed to create service area" },
      { status: 500 }
    );
  }
}
