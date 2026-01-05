/**
 * Area matching utilities for the Area Days feature.
 * Areas are now simple name+color groupings - customers are assigned manually.
 */

import { prisma } from "@/lib/prisma";

export interface ServiceArea {
  id: string;
  name: string;
  color: string;
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
