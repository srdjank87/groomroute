import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGroomerAreasForDateRange } from "@/lib/area-matcher";
import { getUserGroomerId } from "@/lib/get-user-groomer";

// Disable Next.js caching for this route - data changes frequently
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/appointments/calendar
 * Get calendar data for a month including:
 * - Dates with existing appointments
 * - Per-date area assignments (respects date-specific overrides)
 *
 * Query params:
 * - month: YYYY-MM format (required)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM format

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "month parameter is required in YYYY-MM format" },
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

    // Parse month to get date range
    const [year, monthNum] = month.split("-").map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Get appointments for this month - group by date
    // Exclude CANCELLED and NO_SHOW from counts
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId,
        startAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
      select: {
        id: true,
        startAt: true,
        status: true,
      },
    });

    // Group appointments by date - count scheduled vs completed
    const appointmentsByDate: Record<string, { count: number; scheduledCount: number; completedCount: number }> = {};

    for (const apt of appointments) {
      const dateStr = apt.startAt.toISOString().split("T")[0];
      if (!appointmentsByDate[dateStr]) {
        appointmentsByDate[dateStr] = { count: 0, scheduledCount: 0, completedCount: 0 };
      }
      appointmentsByDate[dateStr].count++;

      // Count by status - COMPLETED vs scheduled (CONFIRMED, IN_PROGRESS, etc.)
      if (apt.status === "COMPLETED") {
        appointmentsByDate[dateStr].completedCount++;
      } else {
        appointmentsByDate[dateStr].scheduledCount++;
      }
    }

    // Get per-date area assignments (respects overrides)
    const startDateUTC = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDateUTC = new Date(Date.UTC(year, monthNum, 0)); // Last day of month

    const areasMap = await getGroomerAreasForDateRange(groomerId, startDateUTC, endDateUTC);

    // Convert Map to object for JSON response
    const areasByDate: Record<string, { areaId: string; areaName: string; areaColor: string; isOverride: boolean } | null> = {};
    for (const [dateStr, areaInfo] of areasMap.entries()) {
      areasByDate[dateStr] = areaInfo;
    }

    // Also return default day-of-week assignments for the week header display
    const areaDayAssignments = await prisma.areaDayAssignment.findMany({
      where: {
        accountId,
        groomerId,
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

    const areasByDay: Record<number, Array<{ id: string; name: string; color: string }>> = {};
    for (const assignment of areaDayAssignments) {
      if (!areasByDay[assignment.dayOfWeek]) {
        areasByDay[assignment.dayOfWeek] = [];
      }
      areasByDay[assignment.dayOfWeek].push({
        id: assignment.area.id,
        name: assignment.area.name,
        color: assignment.area.color,
      });
    }

    const response = NextResponse.json({
      month,
      appointmentsByDate,
      areasByDate,
      areasByDay, // Still include for week header
    });

    // Prevent all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Get calendar data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}
