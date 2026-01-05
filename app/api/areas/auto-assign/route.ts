import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findMatchingArea, ServiceArea } from "@/lib/area-matcher";

// POST - Auto-assign customers to service areas based on their zip codes
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active service areas for the account
    const areas = await prisma.serviceArea.findMany({
      where: {
        accountId: session.user.accountId,
        isActive: true,
      },
    });

    if (areas.length === 0) {
      return NextResponse.json(
        { error: "No service areas defined. Create areas first." },
        { status: 400 }
      );
    }

    // Convert to ServiceArea type for matching
    const serviceAreas: ServiceArea[] = areas.map((a) => ({
      id: a.id,
      name: a.name,
      color: a.color,
      zipCodes: a.zipCodes,
      centerLat: a.centerLat,
      centerLng: a.centerLng,
      radiusMiles: a.radiusMiles,
    }));

    // Get all customers for the account that don't have an area assigned
    const unassignedCustomers = await prisma.customer.findMany({
      where: {
        accountId: session.user.accountId,
        serviceAreaId: null,
      },
      select: {
        id: true,
        name: true,
        zipCode: true,
        lat: true,
        lng: true,
      },
    });

    let assigned = 0;
    let unmatched = 0;
    const assignments: { customerId: string; customerName: string; areaId: string; areaName: string }[] = [];
    const unmatchedCustomers: { id: string; name: string; zipCode: string | null }[] = [];

    // Process each customer
    for (const customer of unassignedCustomers) {
      const matchingArea = findMatchingArea(serviceAreas, {
        zipCode: customer.zipCode,
        lat: customer.lat,
        lng: customer.lng,
      });

      if (matchingArea) {
        // Update customer with area assignment
        await prisma.customer.update({
          where: { id: customer.id },
          data: { serviceAreaId: matchingArea.id },
        });

        assigned++;
        assignments.push({
          customerId: customer.id,
          customerName: customer.name,
          areaId: matchingArea.id,
          areaName: matchingArea.name,
        });
      } else {
        unmatched++;
        unmatchedCustomers.push({
          id: customer.id,
          name: customer.name,
          zipCode: customer.zipCode,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-assignment complete. ${assigned} customer${assigned !== 1 ? "s" : ""} assigned, ${unmatched} unmatched.`,
      assigned,
      unmatched,
      assignments,
      unmatchedCustomers: unmatchedCustomers.slice(0, 20), // Limit to first 20
    });
  } catch (error) {
    console.error("Error auto-assigning customers:", error);
    return NextResponse.json(
      { error: "Failed to auto-assign customers" },
      { status: 500 }
    );
  }
}
