import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateGroomerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  baseAddress: z.string().optional(),
  workingHoursStart: z.string().optional().nullable(),
  workingHoursEnd: z.string().optional().nullable(),
  contactMethods: z.array(z.string()).optional(),
  preferredMessaging: z.enum(["SMS", "WHATSAPP"]).optional(),
  preferredMaps: z.enum(["GOOGLE", "APPLE"]).optional(),
  defaultHasAssistant: z.boolean().optional(),
  largeDogDailyLimit: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get a single groomer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const accountId = session.user.accountId;

    const groomer = await prisma.groomer.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        areaDayAssignments: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!groomer) {
      return NextResponse.json({ error: "Groomer not found" }, { status: 404 });
    }

    return NextResponse.json({ groomer });
  } catch (error) {
    console.error("Get groomer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groomer" },
      { status: 500 }
    );
  }
}

// PATCH - Update a groomer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const accountId = session.user.accountId;

    // Verify groomer belongs to this account
    const existingGroomer = await prisma.groomer.findFirst({
      where: { id, accountId },
    });

    if (!existingGroomer) {
      return NextResponse.json({ error: "Groomer not found" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = updateGroomerSchema.parse(body);

    // If base address changed, re-geocode
    let geocodeUpdate: {
      baseLat?: number | null;
      baseLng?: number | null;
      geocodeStatus?: "OK" | "PARTIAL" | "FAILED" | "PENDING";
    } = {};

    if (validatedData.baseAddress && validatedData.baseAddress !== existingGroomer.baseAddress) {
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            validatedData.baseAddress
          )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            geocodeUpdate = {
              baseLat: location.lat,
              baseLng: location.lng,
              geocodeStatus: "OK",
            };
          } else {
            geocodeUpdate = { geocodeStatus: "FAILED" };
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        geocodeUpdate = { geocodeStatus: "FAILED" };
      }
    }

    const groomer = await prisma.groomer.update({
      where: { id },
      data: {
        ...validatedData,
        ...geocodeUpdate,
      },
    });

    return NextResponse.json({
      success: true,
      groomer,
      message: "Groomer updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update groomer error:", error);
    return NextResponse.json(
      { error: "Failed to update groomer" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate a groomer (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const accountId = session.user.accountId;

    // Verify groomer belongs to this account
    const existingGroomer = await prisma.groomer.findFirst({
      where: { id, accountId },
    });

    if (!existingGroomer) {
      return NextResponse.json({ error: "Groomer not found" }, { status: 404 });
    }

    // Check if this is the only active groomer
    const activeGroomerCount = await prisma.groomer.count({
      where: { accountId, isActive: true },
    });

    if (activeGroomerCount <= 1) {
      return NextResponse.json(
        { error: "Cannot deactivate the only groomer. You must have at least one active groomer." },
        { status: 400 }
      );
    }

    // Soft delete - just mark as inactive
    await prisma.groomer.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Groomer deactivated successfully",
    });
  } catch (error) {
    console.error("Delete groomer error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate groomer" },
      { status: 500 }
    );
  }
}
