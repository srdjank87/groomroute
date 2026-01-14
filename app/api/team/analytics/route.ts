import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/features";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from "date-fns";

/**
 * GET /api/team/analytics
 * Get per-groomer performance analytics
 * Pro plan only
 *
 * Query params:
 * - period: "week" | "month" | "30days" (default: "30days")
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

    if (!hasFeature(account.subscriptionPlan, "groomer_performance_analytics")) {
      return NextResponse.json(
        {
          error: "Per-groomer analytics requires Pro plan",
          upgradeRequired: true,
          suggestedPlan: "PRO",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30days";

    // Calculate date range
    // Use rolling periods to match revenue-stats API for consistency
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "week":
        // Rolling 7 days (matching revenue-stats: last 7 days excluding today)
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case "month":
        // Rolling 30 days (matching revenue-stats)
        startDate = subDays(today, 29);
        endDate = now;
        break;
      default: // 30days
        startDate = subDays(now, 30);
        break;
    }

    // Get all active groomers
    const groomers = await prisma.groomer.findMany({
      where: {
        accountId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    // Get appointments for all groomers in the period
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: { in: groomers.map((g) => g.id) },
        startAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        groomerId: true,
        startAt: true,
        serviceMinutes: true,
        price: true,
        status: true,
      },
    });

    // Calculate per-groomer statistics
    const groomerStats = groomers.map((groomer) => {
      const groomerApts = appointments.filter((a) => a.groomerId === groomer.id);
      const completedApts = groomerApts.filter((a) => a.status === "COMPLETED");
      const cancelledApts = groomerApts.filter(
        (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
      );
      const scheduledApts = groomerApts.filter(
        (a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS"
      );

      // Dogs by size is not tracked in this schema, set to 0 for now
      const dogsBySize = {
        small: 0,
        medium: 0,
        large: 0,
        giant: 0,
      };

      // Calculate working days (unique dates with appointments)
      const workingDays = new Set(
        groomerApts.map((a) => a.startAt.toISOString().split("T")[0])
      ).size;

      const totalRevenue = completedApts.reduce((sum, a) => sum + (a.price || 0), 0);
      const totalMinutes = completedApts.reduce((sum, a) => sum + a.serviceMinutes, 0);
      const avgRevenuePerAppointment =
        completedApts.length > 0 ? totalRevenue / completedApts.length : 0;
      const avgAppointmentsPerDay =
        workingDays > 0 ? completedApts.length / workingDays : 0;
      const completionRate =
        groomerApts.length > 0
          ? (completedApts.length / groomerApts.length) * 100
          : 0;

      return {
        groomer: {
          id: groomer.id,
          name: groomer.name,
          color: null as string | null, // Color not in schema yet
        },
        stats: {
          totalAppointments: groomerApts.length,
          completedCount: completedApts.length,
          cancelledCount: cancelledApts.length,
          scheduledCount: scheduledApts.length,
          totalRevenue,
          totalMinutes,
          workingDays,
          avgRevenuePerAppointment: Math.round(avgRevenuePerAppointment),
          avgAppointmentsPerDay: Math.round(avgAppointmentsPerDay * 10) / 10,
          completionRate: Math.round(completionRate),
          dogsBySize,
        },
      };
    });

    // Calculate team totals
    const teamTotals = {
      totalAppointments: appointments.length,
      completedCount: appointments.filter((a) => a.status === "COMPLETED").length,
      totalRevenue: appointments
        .filter((a) => a.status === "COMPLETED")
        .reduce((sum, a) => sum + (a.price || 0), 0),
      avgCompletionRate:
        groomerStats.length > 0
          ? groomerStats.reduce((sum, g) => sum + g.stats.completionRate, 0) /
            groomerStats.length
          : 0,
    };

    // Find top performer
    const topPerformer = groomerStats.length > 0
      ? groomerStats.reduce((top, current) =>
          current.stats.totalRevenue > top.stats.totalRevenue ? current : top
        )
      : null;

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groomerStats,
      teamTotals,
      topPerformer: topPerformer
        ? {
            name: topPerformer.groomer.name,
            revenue: topPerformer.stats.totalRevenue,
            appointments: topPerformer.stats.completedCount,
          }
        : null,
    });
  } catch (error) {
    console.error("Team analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team analytics" },
      { status: 500 }
    );
  }
}
