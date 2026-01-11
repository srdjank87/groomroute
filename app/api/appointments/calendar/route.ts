import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGroomerAreasForDateRange } from "@/lib/area-matcher";

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

    // Parse month to get date range
    const [year, monthNum] = month.split("-").map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Get appointments for this month - group by date
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
      select: {
        id: true,
        startAt: true,
      },
    });

    // Group appointments by date - just count them
    const appointmentsByDate: Record<string, { count: number }> = {};

    for (const apt of appointments) {
      const dateStr = apt.startAt.toISOString().split("T")[0];
      if (!appointmentsByDate[dateStr]) {
        appointmentsByDate[dateStr] = { count: 0 };
      }
      appointmentsByDate[dateStr].count++;
    }

    // Get per-date area assignments (respects overrides)
    const startDateUTC = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDateUTC = new Date(Date.UTC(year, monthNum, 0)); // Last day of month
    const areasMap = await getGroomerAreasForDateRange(groomer.id, startDateUTC, endDateUTC);

    // Convert Map to object for JSON response
    const areasByDate: Record<string, { areaId: string; areaName: string; areaColor: string; isOverride: boolean } | null> = {};
    for (const [dateStr, areaInfo] of areasMap.entries()) {
      areasByDate[dateStr] = areaInfo;
    }

    // Also return default day-of-week assignments for the week header display
    const areaDayAssignments = await prisma.areaDayAssignment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
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

    return NextResponse.json({
      month,
      appointmentsByDate,
      areasByDate,
      areasByDay, // Still include for week header
    });
  } catch (error) {
    console.error("Get calendar data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}
