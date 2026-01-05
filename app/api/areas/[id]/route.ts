import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for updating service areas
const updateServiceAreaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  zipCodes: z.array(z.string().min(1)).min(1, "At least one zip code is required").optional(),
  centerLat: z.number().nullable().optional(),
  centerLng: z.number().nullable().optional(),
  radiusMiles: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get a single service area with details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const area = await prisma.serviceArea.findFirst({
      where: {
        id,
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
        customers: {
          select: {
            id: true,
            name: true,
            address: true,
            zipCode: true,
          },
          orderBy: { name: "asc" },
          take: 100, // Limit to first 100 customers
        },
      },
    });

    if (!area) {
      return NextResponse.json(
        { error: "Service area not found" },
        { status: 404 }
      );
    }

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
        assignedDays: area.dayAssignments.map((da) => ({
          dayOfWeek: da.dayOfWeek,
          groomerId: da.groomer.id,
          groomerName: da.groomer.name,
        })),
        customers: area.customers,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching service area:", error);
    return NextResponse.json(
      { error: "Failed to fetch service area" },
      { status: 500 }
    );
  }
}

// PATCH - Update a service area
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateServiceAreaSchema.parse(body);

    // Check that area belongs to this account
    const existingArea = await prisma.serviceArea.findFirst({
      where: {
        id,
        accountId: session.user.accountId,
      },
    });

    if (!existingArea) {
      return NextResponse.json(
        { error: "Service area not found" },
        { status: 404 }
      );
    }

    // If changing name, check for duplicates
    if (validatedData.name && validatedData.name !== existingArea.name) {
      const duplicateName = await prisma.serviceArea.findFirst({
        where: {
          accountId: session.user.accountId,
          name: validatedData.name,
          id: { not: id },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: "An area with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedArea = await prisma.serviceArea.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.zipCodes && { zipCodes: validatedData.zipCodes }),
        ...(validatedData.centerLat !== undefined && { centerLat: validatedData.centerLat }),
        ...(validatedData.centerLng !== undefined && { centerLng: validatedData.centerLng }),
        ...(validatedData.radiusMiles !== undefined && { radiusMiles: validatedData.radiusMiles }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
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
    });

    return NextResponse.json({
      success: true,
      area: {
        id: updatedArea.id,
        name: updatedArea.name,
        color: updatedArea.color,
        zipCodes: updatedArea.zipCodes,
        centerLat: updatedArea.centerLat,
        centerLng: updatedArea.centerLng,
        radiusMiles: updatedArea.radiusMiles,
        isActive: updatedArea.isActive,
        customerCount: updatedArea._count.customers,
        assignedDays: updatedArea.dayAssignments.map((da) => ({
          dayOfWeek: da.dayOfWeek,
          groomerId: da.groomer.id,
          groomerName: da.groomer.name,
        })),
        createdAt: updatedArea.createdAt,
        updatedAt: updatedArea.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating service area:", error);
    return NextResponse.json(
      { error: "Failed to update service area" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service area
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check that area belongs to this account
    const existingArea = await prisma.serviceArea.findFirst({
      where: {
        id,
        accountId: session.user.accountId,
      },
      include: {
        _count: {
          select: { customers: true, dayAssignments: true },
        },
      },
    });

    if (!existingArea) {
      return NextResponse.json(
        { error: "Service area not found" },
        { status: 404 }
      );
    }

    // Clear customer assignments before deleting (so they don't lose the relationship)
    await prisma.customer.updateMany({
      where: {
        serviceAreaId: id,
      },
      data: {
        serviceAreaId: null,
      },
    });

    // Delete the area (this will cascade delete day assignments)
    await prisma.serviceArea.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Service area deleted",
      customersUnassigned: existingArea._count.customers,
    });
  } catch (error) {
    console.error("Error deleting service area:", error);
    return NextResponse.json(
      { error: "Failed to delete service area" },
      { status: 500 }
    );
  }
}
