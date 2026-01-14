import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getRouteEfficiencyRating,
  ROUTE_EFFICIENCY,
  getAdjustedServiceMinutes,
  getBufferMinutes,
} from "@/lib/benchmarks";
import { getUserGroomerId } from "@/lib/get-user-groomer";
import { trackRouteOptimized, checkAndTrackFirstAction } from "@/lib/posthog-server";

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

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Get groomer defaults
    const groomer = await prisma.groomer.findUnique({
      where: { id: groomerId },
      select: { defaultHasAssistant: true },
    });

    // Ensure we're only optimizing today's route
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      return NextResponse.json(
        { error: "Can only optimize today's route" },
        { status: 400 }
      );
    }

    // Check if working with assistant today
    const routeDate = new Date(date + 'T00:00:00.000Z');
    const existingRoute = await prisma.route.findFirst({
      where: {
        accountId,
        groomerId,
        routeDate,
      },
      select: { id: true, hasAssistant: true },
    });
    const hasAssistant = existingRoute?.hasAssistant ?? groomer?.defaultHasAssistant ?? false;

    // Fetch all incomplete appointments for today only
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId,
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

    // Pre-calculate all new start times (must be done sequentially before parallel updates)
    // With assistant mode, service times are reduced and buffer times adjusted
    const bufferMinutes = getBufferMinutes(hasAssistant);
    const scheduledTimes: { id: string; newStartAt: Date; order: number }[] = [];
    for (let i = 0; i < optimizedLocations.length; i++) {
      const loc = optimizedLocations[i];
      const appointment = appointments.find((a) => a.id === loc.id)!;

      scheduledTimes.push({
        id: loc.id,
        newStartAt: new Date(currentTime),
        order: i + 1,
      });

      // Increment time for next appointment
      // With assistant: service time is reduced (~25% faster) and transitions are quicker
      const adjustedServiceMinutes = getAdjustedServiceMinutes(
        appointment.serviceMinutes,
        hasAssistant
      );
      currentTime = new Date(
        currentTime.getTime() + (adjustedServiceMinutes + bufferMinutes) * 60000
      );
    }

    // Update appointment times in database (can now run in parallel)
    const updates = await Promise.all(
      scheduledTimes.map(async (scheduled) => {
        await prisma.appointment.update({
          where: { id: scheduled.id },
          data: { startAt: scheduled.newStartAt },
        });

        return {
          id: scheduled.id,
          newStartAt: scheduled.newStartAt.toISOString(),
          order: scheduled.order,
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

    const totalDistanceMeters = Math.round(totalDistance * 1609.34); // Convert miles to meters
    const totalDriveMinutes = Math.round(totalDistance / 30 * 60); // Assuming 30 mph average

    // Save or update the Route record in the database
    // Note: routeDate and existingRoute were already defined earlier when checking assistant status

    if (existingRoute?.id) {
      // Update existing route
      await prisma.route.update({
        where: { id: existingRoute.id },
        data: {
          totalDistanceMeters,
          totalDriveMinutes,
          status: "DRAFT",
        },
      });
    } else {
      // Create new route
      await prisma.route.create({
        data: {
          accountId,
          groomerId,
          routeDate,
          totalDistanceMeters,
          totalDriveMinutes,
          status: "DRAFT",
          provider: "LOCAL",
        },
      });
    }

    // Calculate route details
    const stops = optimizedLocations.length;
    const avgMinutesBetweenStops = stops > 1
      ? Math.round(totalDriveMinutes / (stops - 1))
      : 0;

    // Get route efficiency rating
    const efficiencyRating = getRouteEfficiencyRating(avgMinutesBetweenStops);
    const efficiency = ROUTE_EFFICIENCY[efficiencyRating].label;

    // Calculate estimated finish time (using adjusted service time for assistant mode)
    const lastAppointment = appointments.find(
      (a) => a.id === optimizedLocations[optimizedLocations.length - 1].id
    );
    let estimatedFinish: string | null = null;
    if (lastAppointment) {
      const lastScheduled = scheduledTimes.find((s) => s.id === lastAppointment.id);
      if (lastScheduled) {
        const finishTime = new Date(lastScheduled.newStartAt);
        const adjustedLastServiceMinutes = getAdjustedServiceMinutes(
          lastAppointment.serviceMinutes,
          hasAssistant
        );
        finishTime.setMinutes(finishTime.getMinutes() + adjustedLastServiceMinutes);
        const hours = finishTime.getUTCHours();
        const minutes = finishTime.getUTCMinutes();
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        estimatedFinish = `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
      }
    }

    // Generate calm, affirming success message
    const calmMessages = [
      "Your day just got smoother",
      "Schedule is now calm and controlled",
      "Your route is set. You've got this",
      "Day organized. Less stress ahead",
      "Your schedule is sorted and ready",
    ];
    const calmMessage = calmMessages[Math.floor(Math.random() * calmMessages.length)];

    // Format total drive time for display
    const driveHours = Math.floor(totalDriveMinutes / 60);
    const driveMinutesRemainder = totalDriveMinutes % 60;
    const formattedDriveTime = driveHours > 0
      ? `${driveHours}h ${driveMinutesRemainder}m`
      : `${totalDriveMinutes}m`;

    // Track route optimization in PostHog
    await trackRouteOptimized(accountId, {
      numberOfStops: stops,
      estimatedTimeSaved: totalDriveMinutes,
      dayOfWeek: new Date().getDay(),
    });

    // Check if this is the first meaningful action
    await checkAndTrackFirstAction(accountId, "route_optimized");

    return NextResponse.json({
      success: true,
      message: calmMessage,
      estimatedFinish,
      appointmentsOptimized: updates.length,
      optimizedOrder: updates,
      routeDetails: {
        stops,
        avgMinutesBetweenStops,
        totalDriveMinutes,
        formattedDriveTime,
        efficiency,
        totalDistanceMiles: Math.round(totalDistance * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Route optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    );
  }
}
