/**
 * Smart Watchlist Suggestion Engine
 *
 * Intelligently suggests customers from the waitlist based on multiple factors:
 * - Day/time preference matching
 * - Service area alignment
 * - Proximity to scheduled appointments
 * - Customer value (spending history)
 * - Reliability (cancellation/no-show history)
 * - Appointment recency and frequency
 */

import { prisma } from "@/lib/prisma";
import { format, differenceInDays, subDays } from "date-fns";

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Convert km to miles
function kmToMiles(km: number): number {
  return km * 0.621371;
}

export interface WatchlistSuggestion {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string;
  pets: Array<{ id: string; name: string; breed: string | null; weight: number | null }>;
  serviceArea: { id: string; name: string; color: string } | null;
  // Waitlist preferences
  preferredDays: string[];
  preferredTimes: string[];
  flexibleTiming: boolean;
  maxDistance: number | null;
  // Scoring
  matchScore: number;
  matchReasons: string[];
  // Customer value metrics
  totalRevenue: number;
  averageAppointmentValue: number;
  appointmentCount: number;
  lastAppointmentDate: Date | null;
  daysSinceLastAppointment: number | null;
  // Reliability metrics
  completionRate: number;
  cancellationCount: number;
  noShowCount: number;
  reliabilityTier: "excellent" | "good" | "fair" | "poor";
  // Proximity
  distanceToRoute: number | null; // in miles
  isInTodaysArea: boolean;
  // Value tier
  valueTier: "high" | "medium" | "low";
}

export interface SuggestOptions {
  accountId: string;
  groomerId: string;
  targetDate: Date;
  limit?: number;
  // Optional filters
  minReliabilityTier?: "excellent" | "good" | "fair" | "poor";
  valueTierFilter?: ("high" | "medium" | "low")[];
  maxDistanceMiles?: number;
}

/**
 * Get smart watchlist suggestions for a specific date
 */
export async function getWatchlistSuggestions(
  options: SuggestOptions
): Promise<WatchlistSuggestion[]> {
  const {
    accountId,
    groomerId,
    targetDate,
    limit = 10,
    minReliabilityTier,
    valueTierFilter,
    maxDistanceMiles,
  } = options;

  // Get the day of week for matching
  const dayOfWeek = format(targetDate, "EEEE").toUpperCase();

  // Get groomer's base location
  const groomer = await prisma.groomer.findUnique({
    where: { id: groomerId },
    select: {
      baseLat: true,
      baseLng: true,
      baseAddress: true,
    },
  });

  // Get today's scheduled appointments for proximity calculation
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const todaysAppointments = await prisma.appointment.findMany({
    where: {
      accountId,
      groomerId,
      startAt: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        notIn: ["CANCELLED", "NO_SHOW"],
      },
    },
    include: {
      customer: {
        select: {
          lat: true,
          lng: true,
        },
      },
    },
  });

  // Collect appointment locations for proximity calculation
  const appointmentLocations = todaysAppointments
    .filter((apt) => apt.customer.lat && apt.customer.lng)
    .map((apt) => ({
      lat: apt.customer.lat!,
      lng: apt.customer.lng!,
    }));

  // Get the area for this date
  const areaForDay = await getAreaForDate(groomerId, targetDate);

  // Get active waitlist entries with customer data
  const waitlistEntries = await prisma.customerWaitlist.findMany({
    where: {
      accountId,
      isActive: true,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          lat: true,
          lng: true,
          cancellationCount: true,
          noShowCount: true,
          serviceArea: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              breed: true,
              weight: true,
            },
          },
        },
      },
    },
  });

  // Get customer IDs for batch queries
  const customerIds = waitlistEntries.map((e) => e.customer.id);

  // Batch fetch appointment history for all waitlist customers
  const appointmentHistory = await prisma.appointment.groupBy({
    by: ["customerId"],
    where: {
      customerId: { in: customerIds },
      accountId,
    },
    _count: { id: true },
    _sum: { price: true },
  });

  // Fetch last appointment for each customer
  const lastAppointments = await prisma.appointment.findMany({
    where: {
      customerId: { in: customerIds },
      accountId,
      status: "COMPLETED",
    },
    orderBy: { startAt: "desc" },
    distinct: ["customerId"],
    select: {
      customerId: true,
      startAt: true,
    },
  });

  // Fetch completed appointment counts
  const completedCounts = await prisma.appointment.groupBy({
    by: ["customerId"],
    where: {
      customerId: { in: customerIds },
      accountId,
      status: "COMPLETED",
    },
    _count: { id: true },
  });

  // Create lookup maps
  const historyMap = new Map(
    appointmentHistory.map((h) => [
      h.customerId,
      { count: h._count.id, totalRevenue: Number(h._sum.price) || 0 },
    ])
  );
  const lastApptMap = new Map(
    lastAppointments.map((a) => [a.customerId, a.startAt])
  );
  const completedMap = new Map(
    completedCounts.map((c) => [c.customerId, c._count.id])
  );

  // Calculate revenue quartiles for value tier assignment
  const allRevenues = Array.from(historyMap.values())
    .map((h) => h.totalRevenue)
    .filter((r) => r > 0)
    .sort((a, b) => a - b);

  const highThreshold = allRevenues.length > 0
    ? allRevenues[Math.floor(allRevenues.length * 0.75)]
    : 500;
  const mediumThreshold = allRevenues.length > 0
    ? allRevenues[Math.floor(allRevenues.length * 0.25)]
    : 100;

  // Score each waitlist entry
  const suggestions: WatchlistSuggestion[] = [];

  for (const entry of waitlistEntries) {
    const customer = entry.customer;
    let score = 0;
    const reasons: string[] = [];

    // Get customer history
    const history = historyMap.get(customer.id) || { count: 0, totalRevenue: 0 };
    const lastAppt = lastApptMap.get(customer.id);
    const completedCount = completedMap.get(customer.id) || 0;

    // Calculate metrics
    const avgValue = history.count > 0 ? history.totalRevenue / history.count : 0;
    const daysSinceLast = lastAppt ? differenceInDays(new Date(), lastAppt) : null;
    const totalAppts = history.count;
    const completionRate = totalAppts > 0 ? (completedCount / totalAppts) * 100 : 100;

    // Determine reliability tier
    let reliabilityTier: "excellent" | "good" | "fair" | "poor" = "excellent";
    if (customer.noShowCount >= 3 || customer.cancellationCount >= 5) {
      reliabilityTier = "poor";
    } else if (customer.noShowCount >= 2 || customer.cancellationCount >= 3) {
      reliabilityTier = "fair";
    } else if (customer.noShowCount >= 1 || customer.cancellationCount >= 2) {
      reliabilityTier = "good";
    }

    // Apply reliability filter
    if (minReliabilityTier) {
      const tierOrder = { excellent: 4, good: 3, fair: 2, poor: 1 };
      if (tierOrder[reliabilityTier] < tierOrder[minReliabilityTier]) {
        continue;
      }
    }

    // Determine value tier
    let valueTier: "high" | "medium" | "low" = "low";
    if (history.totalRevenue >= highThreshold) {
      valueTier = "high";
    } else if (history.totalRevenue >= mediumThreshold) {
      valueTier = "medium";
    }

    // Apply value tier filter
    if (valueTierFilter && !valueTierFilter.includes(valueTier)) {
      continue;
    }

    // Calculate distance to route
    let distanceToRoute: number | null = null;
    if (customer.lat && customer.lng) {
      if (appointmentLocations.length > 0) {
        // Find minimum distance to any scheduled appointment
        const distances = appointmentLocations.map((loc) =>
          kmToMiles(calculateDistance(customer.lat!, customer.lng!, loc.lat, loc.lng))
        );
        distanceToRoute = Math.min(...distances);
      } else if (groomer?.baseLat && groomer?.baseLng) {
        // No appointments today, use distance from groomer base
        distanceToRoute = kmToMiles(
          calculateDistance(customer.lat, customer.lng, groomer.baseLat, groomer.baseLng)
        );
      }
    }

    // Apply max distance filter
    if (maxDistanceMiles && distanceToRoute && distanceToRoute > maxDistanceMiles) {
      continue;
    }

    // Check customer's max distance preference
    if (entry.maxDistance && distanceToRoute && distanceToRoute > entry.maxDistance) {
      continue;
    }

    // Check if customer is in today's area
    const isInTodaysArea = areaForDay && customer.serviceArea?.id === areaForDay.id;

    // --- SCORING ---

    // Day preference match (max 30 points)
    if (entry.preferredDays.includes(dayOfWeek)) {
      score += 30;
      reasons.push(`Prefers ${dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}s`);
    } else if (entry.flexibleTiming) {
      score += 10;
      reasons.push("Has flexible timing");
    }

    // Service area match (max 25 points)
    if (isInTodaysArea) {
      score += 25;
      reasons.push(`In today's area (${areaForDay!.name})`);
    }

    // Proximity bonus (max 20 points)
    if (distanceToRoute !== null) {
      if (distanceToRoute <= 2) {
        score += 20;
        reasons.push("Very close to route (<2 mi)");
      } else if (distanceToRoute <= 5) {
        score += 15;
        reasons.push("Near route (<5 mi)");
      } else if (distanceToRoute <= 10) {
        score += 10;
        reasons.push("Within 10 miles");
      } else if (distanceToRoute <= 15) {
        score += 5;
      }
    }

    // Customer value bonus (max 15 points)
    if (valueTier === "high") {
      score += 15;
      reasons.push("High-value customer");
    } else if (valueTier === "medium") {
      score += 8;
      reasons.push("Regular customer");
    }

    // Reliability bonus (max 10 points)
    if (reliabilityTier === "excellent") {
      score += 10;
      reasons.push("Excellent reliability");
    } else if (reliabilityTier === "good") {
      score += 5;
    } else if (reliabilityTier === "poor") {
      score -= 10;
      reasons.push("History of cancellations/no-shows");
    }

    // Recency bonus - prioritize customers who haven't been seen recently (max 10 points)
    if (daysSinceLast !== null) {
      if (daysSinceLast >= 60) {
        score += 10;
        reasons.push("Due for appointment (60+ days)");
      } else if (daysSinceLast >= 45) {
        score += 7;
        reasons.push("Due for appointment (45+ days)");
      } else if (daysSinceLast >= 30) {
        score += 5;
        reasons.push("Due for appointment (30+ days)");
      }
    } else if (history.count === 0) {
      // New customer on waitlist - boost them
      score += 8;
      reasons.push("New customer");
    }

    // Skip if score is too low
    if (score <= 0) {
      continue;
    }

    suggestions.push({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      pets: customer.pets,
      serviceArea: customer.serviceArea,
      preferredDays: entry.preferredDays,
      preferredTimes: entry.preferredTimes,
      flexibleTiming: entry.flexibleTiming,
      maxDistance: entry.maxDistance,
      matchScore: Math.min(score, 100), // Cap at 100
      matchReasons: reasons,
      totalRevenue: history.totalRevenue,
      averageAppointmentValue: Math.round(avgValue * 100) / 100,
      appointmentCount: totalAppts,
      lastAppointmentDate: lastAppt || null,
      daysSinceLastAppointment: daysSinceLast,
      completionRate: Math.round(completionRate),
      cancellationCount: customer.cancellationCount,
      noShowCount: customer.noShowCount,
      reliabilityTier,
      distanceToRoute: distanceToRoute ? Math.round(distanceToRoute * 10) / 10 : null,
      isInTodaysArea: !!isInTodaysArea,
      valueTier,
    });
  }

  // Sort by score descending and limit
  return suggestions
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Get the assigned service area for a groomer on a specific date
 */
async function getAreaForDate(
  groomerId: string,
  date: Date
): Promise<{ id: string; name: string; color: string } | null> {
  const dateOnly = format(date, "yyyy-MM-dd");

  // First check for date override
  const override = await prisma.areaDateOverride.findFirst({
    where: {
      groomerId,
      date: new Date(dateOnly),
    },
    include: {
      area: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (override) {
    return override.area;
  }

  // Fall back to default day assignment
  const dayOfWeek = date.getDay();
  const assignment = await prisma.areaDayAssignment.findFirst({
    where: {
      groomerId,
      dayOfWeek,
    },
    include: {
      area: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return assignment?.area || null;
}
