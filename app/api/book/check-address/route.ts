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
 * Accepts optional pre-geocoded coordinates from client-side Google Places API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, groomerSlug, lat, lng, zipCode, city, state } = body;

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

    // Use pre-geocoded data if available, otherwise geocode server-side
    let geocodeResult: {
      success: boolean;
      lat?: number;
      lng?: number;
      formattedAddress?: string;
      zipCode?: string;
      city?: string;
      state?: string;
    };

    if (lat && lng) {
      // Use pre-geocoded data from client (zip code is optional)
      geocodeResult = {
        success: true,
        lat,
        lng,
        formattedAddress: address,
        zipCode: zipCode || undefined,
        city,
        state,
      };
    } else {
      // Geocode server-side
      geocodeResult = await geocodeAddress(address);
    }

    // Check if geocoding failed completely
    if (!geocodeResult.success) {
      return NextResponse.json({
        success: true,
        inServiceArea: false,
        geocoded: false,
        message:
          "Could not verify this address. Please select an address from the dropdown suggestions.",
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

    // Check if any areas have customers with zip codes for matching
    const totalCustomerZipCodes = areas.reduce(
      (sum, area) => sum + area.customers.length,
      0
    );

    // If no service areas defined OR areas exist but no customers assigned yet,
    // accept all addresses (groomer hasn't set up area-based routing yet)
    if (areas.length === 0 || totalCustomerZipCodes === 0) {
      // Get all days the groomer has assigned to any area (for recommendations)
      const allAssignedDays = areas.flatMap((area) =>
        area.dayAssignments.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          dayName: DAY_NAMES[a.dayOfWeek],
        }))
      );

      // Remove duplicates
      const uniqueDays = allAssignedDays.filter(
        (day, index, self) =>
          index === self.findIndex((d) => d.dayOfWeek === day.dayOfWeek)
      );

      return NextResponse.json({
        success: true,
        inServiceArea: true,
        areaId: null,
        areaName: null,
        recommendedDays: uniqueDays,
        allDaysAvailable: areas.length === 0,
        geocoded: true,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        formattedAddress: geocodeResult.formattedAddress,
        zipCode: geocodeResult.zipCode,
        city: geocodeResult.city,
        state: geocodeResult.state,
      });
    }

    // If we have areas with customers but no zip code from the address,
    // we can't do zip-based matching - accept anyway with a note
    if (!geocodeResult.zipCode) {
      // Get all days the groomer works
      const allAssignedDays = areas.flatMap((area) =>
        area.dayAssignments.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          dayName: DAY_NAMES[a.dayOfWeek],
        }))
      );

      const uniqueDays = allAssignedDays.filter(
        (day, index, self) =>
          index === self.findIndex((d) => d.dayOfWeek === day.dayOfWeek)
      );

      return NextResponse.json({
        success: true,
        inServiceArea: true,
        areaId: null,
        areaName: null,
        recommendedDays: uniqueDays,
        allDaysAvailable: false,
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

    // If still no match, accept the address but without area assignment
    // (groomer can manually assign later, or the address is in a new area)
    if (!matchedArea) {
      // Get all days the groomer works
      const allAssignedDays = areas.flatMap((area) =>
        area.dayAssignments.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          dayName: DAY_NAMES[a.dayOfWeek],
        }))
      );

      const uniqueDays = allAssignedDays.filter(
        (day, index, self) =>
          index === self.findIndex((d) => d.dayOfWeek === day.dayOfWeek)
      );

      return NextResponse.json({
        success: true,
        inServiceArea: true,
        areaId: null,
        areaName: null,
        matchType: "new_area",
        recommendedDays: uniqueDays,
        allDaysAvailable: false,
        geocoded: true,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        formattedAddress: geocodeResult.formattedAddress,
        zipCode: geocodeResult.zipCode,
        city: geocodeResult.city,
        state: geocodeResult.state,
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
