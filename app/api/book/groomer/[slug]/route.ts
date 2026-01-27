import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/book/groomer/[slug]
 * Public endpoint - Get groomer info by booking slug
 * Used by the public booking page to display groomer info
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const groomer = await prisma.groomer.findUnique({
      where: { bookingSlug: slug },
      select: {
        id: true,
        name: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        bookingEnabled: true,
        accountId: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer not found" },
        { status: 404 }
      );
    }

    // Check if booking is enabled
    if (!groomer.bookingEnabled) {
      return NextResponse.json(
        { error: "Online booking is not available for this groomer" },
        { status: 403 }
      );
    }

    // Return public-safe groomer info (no accountId exposed)
    return NextResponse.json({
      groomer: {
        id: groomer.id,
        name: groomer.name,
        workingHoursStart: groomer.workingHoursStart || "08:00",
        workingHoursEnd: groomer.workingHoursEnd || "17:00",
      },
    });
  } catch (error) {
    console.error("Get groomer by slug error:", error);
    return NextResponse.json(
      { error: "Failed to get groomer info" },
      { status: 500 }
    );
  }
}
