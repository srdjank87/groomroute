/**
 * Area matching utilities for the Area Days feature.
 * Matches customers to service areas based on zip codes or coordinates.
 */

import { prisma } from "@/lib/prisma";

export interface ServiceArea {
  id: string;
  name: string;
  color: string;
  zipCodes: string[];
  centerLat: number | null;
  centerLng: number | null;
  radiusMiles: number | null;
}

export interface CustomerLocation {
  zipCode: string | null;
  lat: number | null;
  lng: number | null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the best matching service area for a customer location.
 * Priority:
 * 1. Exact zip code match
 * 2. Within radius (if area has centerLat/centerLng/radiusMiles)
 *
 * @returns The matching area or null if no match
 */
export function findMatchingArea(
  areas: ServiceArea[],
  location: CustomerLocation
): ServiceArea | null {
  // First, try zip code match
  if (location.zipCode) {
    const normalizedZip = location.zipCode.trim();
    const zipMatch = areas.find((area) =>
      area.zipCodes.some((zip) => zip.trim() === normalizedZip)
    );
    if (zipMatch) {
      return zipMatch;
    }
  }

  // Second, try radius match if customer has coordinates
  if (location.lat !== null && location.lng !== null) {
    for (const area of areas) {
      if (
        area.centerLat !== null &&
        area.centerLng !== null &&
        area.radiusMiles !== null
      ) {
        const distance = calculateDistanceMiles(
          location.lat,
          location.lng,
          area.centerLat,
          area.centerLng
        );
        if (distance <= area.radiusMiles) {
          return area;
        }
      }
    }
  }

  return null;
}

/**
 * Get days of the week when a groomer is assigned to a specific area.
 * @returns Array of day numbers (0=Sunday, 1=Monday, etc.)
 */
export async function getGroomerAreaDays(
  groomerId: string,
  areaId: string
): Promise<number[]> {
  const assignments = await prisma.areaDayAssignment.findMany({
    where: {
      groomerId,
      areaId,
    },
    select: {
      dayOfWeek: true,
    },
  });

  return assignments.map((a) => a.dayOfWeek).sort();
}

/**
 * Get the assigned area for a groomer on a specific day.
 */
export async function getGroomerAssignedArea(
  groomerId: string,
  dayOfWeek: number
): Promise<{ areaId: string; areaName: string; areaColor: string } | null> {
  const assignment = await prisma.areaDayAssignment.findUnique({
    where: {
      groomerId_dayOfWeek: {
        groomerId,
        dayOfWeek,
      },
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

  if (!assignment) {
    return null;
  }

  return {
    areaId: assignment.area.id,
    areaName: assignment.area.name,
    areaColor: assignment.area.color,
  };
}

/**
 * Find the next available date that matches a groomer's area day for a customer.
 * @param groomerId The groomer to check
 * @param customerAreaId The customer's service area
 * @param fromDate Starting date to search from
 * @param maxDaysAhead Maximum days to search
 * @returns The next matching date or null if none found
 */
export async function findNextAreaDayDate(
  groomerId: string,
  customerAreaId: string,
  fromDate: Date = new Date(),
  maxDaysAhead: number = 30
): Promise<Date | null> {
  // Get all days when groomer is assigned to customer's area
  const areaDays = await getGroomerAreaDays(groomerId, customerAreaId);

  if (areaDays.length === 0) {
    return null;
  }

  // Find the next date that falls on one of those days
  const startDate = new Date(fromDate);
  startDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < maxDaysAhead; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dayOfWeek = checkDate.getDay();

    if (areaDays.includes(dayOfWeek)) {
      return checkDate;
    }
  }

  return null;
}

/**
 * Day names for display
 */
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Format day numbers into readable string
 * e.g., [1, 4] -> "Monday, Thursday"
 */
export function formatDayNames(dayNumbers: number[]): string {
  return dayNumbers.map((d) => DAY_NAMES[d]).join(", ");
}

/**
 * Format day numbers into short readable string
 * e.g., [1, 4] -> "Mon, Thu"
 */
export function formatDayNamesShort(dayNumbers: number[]): string {
  return dayNumbers.map((d) => DAY_NAMES_SHORT[d]).join(", ");
}
