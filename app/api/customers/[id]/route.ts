import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { geocodeAddress } from "@/lib/geocoding";

const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required").optional(),
  addressNotes: z.string().optional(),
  accessInstructions: z.string().optional(),
});

// GET single customer
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

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId,
      },
      include: {
        pets: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { startAt: "desc" },
          include: {
            pet: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PATCH - Update customer
export async function PATCH(
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
    const validatedData = updateCustomerSchema.parse(body);

    // Verify customer belongs to this account
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Geocode if address changed
    let geocodeData = {};
    if (validatedData.address && validatedData.address !== existingCustomer.address) {
      const geocodeResult = await geocodeAddress(validatedData.address);
      geocodeData = {
        address: validatedData.address,
        lat: geocodeResult.success ? geocodeResult.lat : null,
        lng: geocodeResult.success ? geocodeResult.lng : null,
        geocodeStatus: geocodeResult.success ? "OK" : "FAILED",
        locationVerified: false, // Reset verification when address changes
      };
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone || null }),
        ...(validatedData.email !== undefined && { email: validatedData.email || null }),
        ...geocodeData,
        ...(validatedData.addressNotes !== undefined && {
          addressNotes: validatedData.addressNotes || null
        }),
        ...(validatedData.accessInstructions !== undefined && {
          accessInstructions: validatedData.accessInstructions || null
        }),
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update customer error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
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
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId,
      },
      include: {
        _count: {
          select: {
            appointments: true,
            pets: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Delete customer (cascade will delete pets and appointments)
    await prisma.customer.delete({
      where: { id: customerId },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
