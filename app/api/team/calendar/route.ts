import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/features";

/**
 * GET /api/team/calendar
 * Get team calendar data for all groomers
 * Pro plan only - shows all groomers' appointments for a given date range
 *
 * Query params:
 * - date: YYYY-MM-DD format (specific day) or
 * - week: YYYY-MM-DD format (returns week starting from that date)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Check Pro plan access
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (!hasFeature(account.subscriptionPlan, "team_calendar")) {
      return NextResponse.json(
        {
          error: "Team calendar requires Pro plan",
          upgradeRequired: true,
          suggestedPlan: "PRO",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const weekStr = searchParams.get("week");

    let startDate: Date;
    let endDate: Date;
    let viewMode: "day" | "week" = "day";

    if (weekStr) {
      // Week view - start from the provided date
      viewMode = "week";
      startDate = new Date(weekStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateStr) {
      // Day view
      startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Get all active groomers for this account
    const groomers = await prisma.groomer.findMany({
      where: {
        accountId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    });

    // Map groomers to add placeholder color
    const groomersWithColor = groomers.map((g, i) => ({
      ...g,
      color: null as string | null, // Color not in schema yet
    }));

    // Get appointments for all groomers in the date range
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: { in: groomers.map((g) => g.id) },
        startAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { notIn: ["CANCELLED"] },
      },
      select: {
        id: true,
        startAt: true,
        serviceMinutes: true,
        appointmentType: true,
        price: true,
        status: true,
        groomerId: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            serviceArea: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
      },
      orderBy: { startAt: "asc" },
    });

    // Group appointments by groomer
    const appointmentsByGroomer: Record<
      string,
      typeof appointments
    > = {};

    for (const groomer of groomersWithColor) {
      appointmentsByGroomer[groomer.id] = [];
    }

    for (const apt of appointments) {
      if (appointmentsByGroomer[apt.groomerId]) {
        appointmentsByGroomer[apt.groomerId].push(apt);
      }
    }

    // Calculate statistics for each groomer
    const groomerStats = groomersWithColor.map((groomer) => {
      const groomerApts = appointmentsByGroomer[groomer.id] || [];
      const completedApts = groomerApts.filter((a) => a.status === "COMPLETED");
      const scheduledApts = groomerApts.filter((a) => a.status !== "COMPLETED" && a.status !== "NO_SHOW");

      return {
        groomerId: groomer.id,
        totalAppointments: groomerApts.length,
        completedCount: completedApts.length,
        scheduledCount: scheduledApts.length,
        totalRevenue: completedApts.reduce((sum, a) => sum + (a.price || 0), 0),
        totalMinutes: groomerApts.reduce((sum, a) => sum + a.serviceMinutes, 0),
      };
    });

    return NextResponse.json({
      viewMode,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groomers: groomersWithColor,
      appointmentsByGroomer,
      groomerStats,
      totals: {
        totalAppointments: appointments.length,
        totalRevenue: appointments
          .filter((a) => a.status === "COMPLETED")
          .reduce((sum, a) => sum + (a.price || 0), 0),
      },
    });
  } catch (error) {
    console.error("Team calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team calendar" },
      { status: 500 }
    );
  }
}
