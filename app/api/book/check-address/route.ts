import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * POST /api/book/check-address
 * Public endpoint - Check if address is in groomer's service area and get recommended days
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, groomerSlug } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!groomerSlug) {
      return NextResponse.json(
        { error: "Groomer slug is required" },
        { status: 400 }
      );
    }

    // Get groomer by slug
    const groomer = await prisma.groomer.findUnique({
      where: { bookingSlug: groomerSlug },
      select: {
        id: true,
        accountId: true,
        bookingEnabled: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer not found" },
        { status: 404 }
      );
    }

    if (!groomer.bookingEnabled) {
      return NextResponse.json(
        { error: "Online booking is not available" },
        { status: 403 }
      );
    }

    // Geocode the address
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult.success || !geocodeResult.zipCode) {
      return NextResponse.json({
        success: true,
        inServiceArea: false,
        geocoded: false,
        message: "Could not verify this address. Please check and try again.",
      });
    }

    // Get all service areas for this account with their customers
    const areas = await prisma.serviceArea.findMany({
      where: {
        accountId: groomer.accountId,
        isActive: true,
      },
      include: {
        customers: {
          select: { zipCode: true },
          where: { zipCode: { not: null } },
        },
        dayAssignments: {
          where: { groomerId: groomer.id },
          select: { dayOfWeek: true },
        },
      },
    });

    if (areas.length === 0) {
      // No service areas defined - accept all addresses
      return NextResponse.json({
        success: true,
        inServiceArea: true,
        areaId: null,
        areaName: null,
        recommendedDays: [],
        allDaysAvailable: true,
        geocoded: true,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        formattedAddress: geocodeResult.formattedAddress,
        zipCode: geocodeResult.zipCode,
        city: geocodeResult.city,
        state: geocodeResult.state,
      });
    }

    // Find matching area based on zip code
    let matchedArea: (typeof areas)[0] | null = null;
    let matchType: "exact" | "prefix" | "nearby" | null = null;

    const inputZip = geocodeResult.zipCode;
    const inputPrefix = inputZip.substring(0, 3);

    for (const area of areas) {
      const zipCodes = area.customers
        .map((c) => c.zipCode)
        .filter((z): z is string => z !== null);

      // Check for exact match
      if (zipCodes.includes(inputZip)) {
        matchedArea = area;
        matchType = "exact";
        break;
      }

      // Check for prefix match (same regional area)
      if (!matchedArea) {
        for (const areaZip of zipCodes) {
          if (areaZip.substring(0, 3) === inputPrefix) {
            matchedArea = area;
            matchType = "prefix";
            break;
          }
        }
      }
    }

    // If no match found by zip, check nearby zip codes
    if (!matchedArea) {
      const inputNum = parseInt(inputZip, 10);

      for (const area of areas) {
        const zipCodes = area.customers
          .map((c) => c.zipCode)
          .filter((z): z is string => z !== null);

        for (const areaZip of zipCodes) {
          const areaNum = parseInt(areaZip, 10);
          const distance = Math.abs(inputNum - areaNum);

          if (distance <= 50) {
            matchedArea = area;
            matchType = "nearby";
            break;
          }
        }
        if (matchedArea) break;
      }
    }

    if (!matchedArea) {
      return NextResponse.json({
        success: true,
        inServiceArea: false,
        geocoded: true,
        message:
          "This address appears to be outside the service area. Please contact the groomer directly.",
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        formattedAddress: geocodeResult.formattedAddress,
      });
    }

    // Get recommended days from area day assignments
    const recommendedDays = matchedArea.dayAssignments.map((assignment) => ({
      dayOfWeek: assignment.dayOfWeek,
      dayName: DAY_NAMES[assignment.dayOfWeek],
    }));

    return NextResponse.json({
      success: true,
      inServiceArea: true,
      areaId: matchedArea.id,
      areaName: matchedArea.name,
      areaColor: matchedArea.color,
      matchType,
      recommendedDays,
      geocoded: true,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      formattedAddress: geocodeResult.formattedAddress,
      zipCode: geocodeResult.zipCode,
      city: geocodeResult.city,
      state: geocodeResult.state,
    });
  } catch (error) {
    console.error("Check address error:", error);
    return NextResponse.json(
      { error: "Failed to check address" },
      { status: 500 }
    );
  }
}
