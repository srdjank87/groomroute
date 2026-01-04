import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Location {
  id: string;
  lat: number;
  lng: number;
  startAt: Date;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Nearest neighbor algorithm for route optimization
function optimizeRoute(locations: Location[], startLat?: number, startLng?: number): Location[] {
  if (locations.length <= 1) return locations;

  const unvisited = [...locations];
  const route: Location[] = [];

  // Start from first appointment or given starting point
  let current = startLat && startLng
    ? { lat: startLat, lng: startLng }
    : { lat: unvisited[0].lat, lng: unvisited[0].lng };

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Find nearest unvisited location
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    current = { lat: nearest.lat, lng: nearest.lng };
  }

  return route;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { date, startLat, startLng } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Fetch all appointments for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        groomerId: groomer.id,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW", "COMPLETED"],
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Filter appointments with valid geocoded locations
    const locatedAppointments = appointments.filter(
      (apt) => apt.customer.lat !== null && apt.customer.lng !== null
    );

    if (locatedAppointments.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No appointments with verified locations found",
        optimizedOrder: [],
      });
    }

    // Prepare locations for optimization
    const locations: Location[] = locatedAppointments.map((apt) => ({
      id: apt.id,
      lat: apt.customer.lat!,
      lng: apt.customer.lng!,
      startAt: apt.startAt,
    }));

    // Optimize route
    const optimizedLocations = optimizeRoute(locations, startLat, startLng);

    // Calculate time slots based on first appointment time
    const firstAppointmentTime = new Date(appointments[0].startAt);
    let currentTime = new Date(firstAppointmentTime);

    // Update appointment times in database
    const updates = await Promise.all(
      optimizedLocations.map(async (loc, index) => {
        const appointment = appointments.find((a) => a.id === loc.id)!;

        // Set new start time
        const newStartAt = new Date(currentTime);

        await prisma.appointment.update({
          where: { id: loc.id },
          data: { startAt: newStartAt },
        });

        // Increment time for next appointment (appointment duration + 15 min travel time)
        currentTime = new Date(currentTime.getTime() + (appointment.serviceMinutes + 15) * 60000);

        return {
          id: loc.id,
          newStartAt: newStartAt.toISOString(),
          order: index + 1,
        };
      })
    );

    // Calculate total distance
    let totalDistance = 0;
    if (startLat && startLng) {
      totalDistance += calculateDistance(startLat, startLng, optimizedLocations[0].lat, optimizedLocations[0].lng);
    }

    for (let i = 0; i < optimizedLocations.length - 1; i++) {
      totalDistance += calculateDistance(
        optimizedLocations[i].lat,
        optimizedLocations[i].lng,
        optimizedLocations[i + 1].lat,
        optimizedLocations[i + 1].lng
      );
    }

    return NextResponse.json({
      success: true,
      message: `Route optimized! ${updates.length} appointments reordered.`,
      optimizedOrder: updates,
      totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
      estimatedDriveTime: Math.round(totalDistance / 30 * 60), // Assuming 30 mph average, in minutes
    });
  } catch (error) {
    console.error("Route optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    );
  }
}
