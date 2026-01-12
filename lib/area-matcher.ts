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
 * Get the assigned area for a groomer on a specific day of the week (default pattern).
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
 * Get the assigned area for a groomer on a specific date.
 * Checks for date-specific override first, then falls back to default day-of-week assignment.
 * @returns Area info with isOverride flag, or null if no assignment (day off)
 */
export async function getGroomerAreaForDate(
  groomerId: string,
  date: Date
): Promise<{
  areaId: string;
  areaName: string;
  areaColor: string;
  isOverride: boolean;
} | null> {
  // Normalize date to start of day in UTC
  const dateOnly = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // 1. Check for date-specific override first
  const override = await prisma.areaDateOverride.findUnique({
    where: {
      groomerId_date: {
        groomerId,
        date: dateOnly,
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

  // If override exists (even if areaId is null = day off)
  if (override) {
    if (!override.area) {
      return null; // Day off
    }
    return {
      areaId: override.area.id,
      areaName: override.area.name,
      areaColor: override.area.color,
      isOverride: true,
    };
  }

  // 2. Fall back to default day-of-week assignment
  const dayOfWeek = date.getDay();
  const defaultAssignment = await getGroomerAssignedArea(groomerId, dayOfWeek);

  if (!defaultAssignment) {
    return null;
  }

  return {
    ...defaultAssignment,
    isOverride: false,
  };
}

/**
 * Get all area assignments for a date range (batch query for efficiency).
 * Returns a map of date string (YYYY-MM-DD) to area info.
 */
export async function getGroomerAreasForDateRange(
  groomerId: string,
  startDate: Date,
  endDate: Date
): Promise<Map<string, { areaId: string; areaName: string; areaColor: string; isOverride: boolean } | null>> {
  // Normalize dates
  const start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  // Get all overrides in the range
  const overrides = await prisma.areaDateOverride.findMany({
    where: {
      groomerId,
      date: {
        gte: start,
        lte: end,
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

  // Get default day-of-week assignments
  const defaultAssignments = await prisma.areaDayAssignment.findMany({
    where: { groomerId },
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

  // Build a map of day-of-week to default area
  const defaultByDay = new Map<number, { areaId: string; areaName: string; areaColor: string }>();
  for (const assignment of defaultAssignments) {
    defaultByDay.set(assignment.dayOfWeek, {
      areaId: assignment.area.id,
      areaName: assignment.area.name,
      areaColor: assignment.area.color,
    });
  }

  // Build a map of date string to override
  const overrideByDate = new Map<string, typeof overrides[0]>();
  for (const override of overrides) {
    const dateStr = override.date.toISOString().split("T")[0];
    overrideByDate.set(dateStr, override);
  }

  // Build result map for each date in range
  const result = new Map<string, { areaId: string; areaName: string; areaColor: string; isOverride: boolean } | null>();

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const dayOfWeek = current.getUTCDay();

    // Check for override first
    const override = overrideByDate.get(dateStr);
    if (override) {
      if (override.area) {
        result.set(dateStr, {
          areaId: override.area.id,
          areaName: override.area.name,
          areaColor: override.area.color,
          isOverride: true,
        });
      } else {
        result.set(dateStr, null); // Day off
      }
    } else {
      // Fall back to default
      const defaultArea = defaultByDay.get(dayOfWeek);
      if (defaultArea) {
        result.set(dateStr, { ...defaultArea, isOverride: false });
      } else {
        result.set(dateStr, null);
      }
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}

/**
 * Find the next available date that matches a groomer's area day for a customer.
 * Respects date-specific overrides when searching.
 * @param groomerId The groomer to check
 * @param customerAreaId The customer's service area
 * @param fromDate Starting date to search from
 * @param maxDaysAhead Maximum days to search
 * @returns Object with date and isOverride flag, or null if none found
 */
export async function findNextAreaDayDate(
  groomerId: string,
  customerAreaId: string,
  fromDate: Date = new Date(),
  maxDaysAhead: number = 30
): Promise<{ date: Date; isOverride: boolean } | null> {
  // Get all days when groomer is assigned to customer's area (default pattern)
  const defaultAreaDays = await getGroomerAreaDays(groomerId, customerAreaId);

  // Normalize start date
  const startDate = new Date(fromDate);
  startDate.setHours(0, 0, 0, 0);

  // Calculate end date for range query
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + maxDaysAhead);

  // Get all overrides in the date range
  const overrides = await prisma.areaDateOverride.findMany({
    where: {
      groomerId,
      date: {
        gte: new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())),
        lte: new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())),
      },
    },
    select: {
      date: true,
      areaId: true,
    },
  });

  // Build a map of date string to override areaId (null means day off)
  const overrideMap = new Map<string, string | null>();
  for (const o of overrides) {
    const dateStr = o.date.toISOString().split("T")[0];
    overrideMap.set(dateStr, o.areaId);
  }

  // Search for next matching date
  for (let i = 0; i < maxDaysAhead; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dateStr = checkDate.toISOString().split("T")[0];
    const dayOfWeek = checkDate.getDay();

    // Check for override first
    if (overrideMap.has(dateStr)) {
      const overrideAreaId = overrideMap.get(dateStr);
      if (overrideAreaId === customerAreaId) {
        // Override matches customer's area
        return { date: checkDate, isOverride: true };
      }
      // Override exists but for different area (or day off) - skip this date
      continue;
    }

    // No override - check default pattern
    if (defaultAreaDays.includes(dayOfWeek)) {
      return { date: checkDate, isOverride: false };
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

/**
 * Get upcoming dates when a groomer will be in a specific area (including overrides).
 * Returns dates for the next N days where the groomer's assigned area matches.
 * @param groomerId The groomer to check
 * @param areaId The target service area
 * @param fromDate Starting date to search from
 * @param maxDaysAhead Maximum days to search (default 30)
 * @returns Array of dates with override flag
 */
export async function getUpcomingAreaDates(
  groomerId: string,
  areaId: string,
  fromDate: Date = new Date(),
  maxDaysAhead: number = 30
): Promise<Array<{ date: string; dayOfWeek: number; isOverride: boolean }>> {
  // Get default day-of-week assignments for this area
  const defaultAreaDays = await getGroomerAreaDays(groomerId, areaId);

  // Normalize start date
  const startDate = new Date(fromDate);
  startDate.setHours(0, 0, 0, 0);

  // Calculate end date for range query
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + maxDaysAhead);

  // Get all overrides in the date range
  const overrides = await prisma.areaDateOverride.findMany({
    where: {
      groomerId,
      date: {
        gte: new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())),
        lte: new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())),
      },
    },
    select: {
      date: true,
      areaId: true,
    },
  });

  // Build a map of date string to override areaId (null means day off)
  const overrideMap = new Map<string, string | null>();
  for (const o of overrides) {
    const dateStr = o.date.toISOString().split("T")[0];
    overrideMap.set(dateStr, o.areaId);
  }

  const result: Array<{ date: string; dayOfWeek: number; isOverride: boolean }> = [];

  // Search through each day in the range
  for (let i = 0; i < maxDaysAhead; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dateStr = checkDate.toISOString().split("T")[0];
    const dayOfWeek = checkDate.getDay();

    // Check for override first
    if (overrideMap.has(dateStr)) {
      const overrideAreaId = overrideMap.get(dateStr);
      if (overrideAreaId === areaId) {
        // Override matches target area
        result.push({ date: dateStr, dayOfWeek, isOverride: true });
      }
      // Override exists but for different area (or day off) - skip this date
      continue;
    }

    // No override - check default pattern
    if (defaultAreaDays.includes(dayOfWeek)) {
      result.push({ date: dateStr, dayOfWeek, isOverride: false });
    }
  }

  return result;
}
