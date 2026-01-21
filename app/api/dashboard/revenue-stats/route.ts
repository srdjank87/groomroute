import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailyQuote } from "@/lib/daily-quotes";
import { getUserGroomerId } from "@/lib/get-user-groomer";
import { hasFeature } from "@/lib/features";

// Period type for date ranges
type Period = "this_week" | "last_week" | "this_month" | "last_month";

function getDateRangeForPeriod(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date();
  const today = new Date(now);
  today.setHours(23, 59, 59, 999); // End of today for "this" periods

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  switch (period) {
    case "this_week": {
      // Monday of this week to today
      const dayOfWeek = startOfToday.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const start = new Date(startOfToday);
      start.setDate(startOfToday.getDate() - mondayOffset);
      return { start, end: today, label: "This Week" };
    }
    case "last_week": {
      // Previous Monday to Sunday
      const dayOfWeek = startOfToday.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisMonday = new Date(startOfToday);
      thisMonday.setDate(startOfToday.getDate() - mondayOffset);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      lastSunday.setHours(23, 59, 59, 999);
      return { start: lastMonday, end: lastSunday, label: "Last Week" };
    }
    case "this_month": {
      // 1st of current month to today
      const start = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
      return { start, end: today, label: "This Month" };
    }
    case "last_month": {
      // 1st to last day of previous month
      const start = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, 1);
      const end = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: "Last Month" };
    }
    default: {
      // Default to this_week
      const dayOfWeek = startOfToday.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const start = new Date(startOfToday);
      start.setDate(startOfToday.getDate() - mondayOffset);
      return { start, end: today, label: "This Week" };
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);

    // Get period from query params (default to this_week)
    const period = (searchParams.get("period") as Period) || "this_week";

    // Get groomer filter (optional - for Pro plan users)
    const groomerIdParam = searchParams.get("groomerId");

    // Get account to check plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });

    // Determine which groomer(s) to show
    let groomerId: string | null = null;
    const canFilterByGroomer = account && hasFeature(account.subscriptionPlan, "multi_groomer");

    if (groomerIdParam === "all" && canFilterByGroomer) {
      // Pro users can see all groomers
      groomerId = null;
    } else if (groomerIdParam && groomerIdParam !== "all" && canFilterByGroomer) {
      // Pro users can filter by specific groomer
      groomerId = groomerIdParam;
    } else {
      // Non-Pro users see only their own groomer's data
      groomerId = await getUserGroomerId();
    }

    // Get date range for selected period
    const { start: periodStart, end: periodEnd, label: periodLabel } = getDateRangeForPeriod(period);

    // For calm impact metrics, we always use standard week/month ranges
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Fetch ONLY completed appointments for the selected period
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: "COMPLETED",
      },
      select: {
        price: true,
        startAt: true,
        status: true,
        customer: {
          select: {
            id: true,
          },
        },
      },
    });

    // Fetch cancelled and no-show appointments for lost revenue calculation
    const lostAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: {
          in: ["CANCELLED", "NO_SHOW"],
        },
      },
      select: {
        price: true,
        startAt: true,
        status: true,
      },
    });

    // Calculate how many days to show in chart
    const daysDiff = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const isMonthlyView = daysDiff > 14;

    // For weekly views, show daily bars. For monthly views, show weekly bars.
    let chartData: Array<{
      date: string;
      label: string;
      revenue: number;
      lostRevenue: number;
      appointments: number;
      lostAppointments: number;
    }> = [];

    if (isMonthlyView) {
      // Group by week for monthly views
      const weeklyData: Map<string, { revenue: number; lostRevenue: number; appointments: number; lostAppointments: number; weekStart: Date }> = new Map();

      // Get the Monday of the first week in the period
      const firstDay = new Date(periodStart);
      const firstDayOfWeek = firstDay.getDay();
      const firstMonday = new Date(firstDay);
      firstMonday.setDate(firstDay.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));

      // Create week buckets
      let currentWeekStart = new Date(firstMonday);
      while (currentWeekStart <= periodEnd) {
        const weekKey = currentWeekStart.toISOString().split("T")[0];
        weeklyData.set(weekKey, { revenue: 0, lostRevenue: 0, appointments: 0, lostAppointments: 0, weekStart: new Date(currentWeekStart) });
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      // Assign appointments to weeks
      appointments.forEach((apt) => {
        const aptDate = new Date(apt.startAt);
        const aptDayOfWeek = aptDate.getDay();
        const aptMonday = new Date(aptDate);
        aptMonday.setDate(aptDate.getDate() - (aptDayOfWeek === 0 ? 6 : aptDayOfWeek - 1));
        const weekKey = aptMonday.toISOString().split("T")[0];

        const week = weeklyData.get(weekKey);
        if (week) {
          week.revenue += apt.price || 0;
          week.appointments += 1;
        }
      });

      lostAppointments.forEach((apt) => {
        const aptDate = new Date(apt.startAt);
        const aptDayOfWeek = aptDate.getDay();
        const aptMonday = new Date(aptDate);
        aptMonday.setDate(aptDate.getDate() - (aptDayOfWeek === 0 ? 6 : aptDayOfWeek - 1));
        const weekKey = aptMonday.toISOString().split("T")[0];

        const week = weeklyData.get(weekKey);
        if (week) {
          week.lostRevenue += apt.price || 0;
          week.lostAppointments += 1;
        }
      });

      // Convert to chart data
      chartData = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, data]) => {
          const weekEnd = new Date(data.weekStart);
          weekEnd.setDate(data.weekStart.getDate() + 6);
          return {
            date: data.weekStart.toISOString().split("T")[0],
            label: `${data.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            revenue: data.revenue,
            lostRevenue: data.lostRevenue,
            appointments: data.appointments,
            lostAppointments: data.lostAppointments,
          };
        });
    } else {
      // Daily view for weekly periods
      for (let d = new Date(periodStart); d <= periodEnd; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const dayAppointments = appointments.filter((apt) => {
          const aptDate = new Date(apt.startAt);
          return aptDate >= date && aptDate < nextDate;
        });

        const dayLostAppointments = lostAppointments.filter((apt) => {
          const aptDate = new Date(apt.startAt);
          return aptDate >= date && aptDate < nextDate;
        });

        const revenue = dayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        const lostRevenue = dayLostAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

        chartData.push({
          date: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          revenue,
          lostRevenue,
          appointments: dayAppointments.length,
          lostAppointments: dayLostAppointments.length,
        });
      }
    }

    // Calculate total revenue for the period
    const periodRevenue = appointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    const periodLostRevenue = lostAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    const periodAppointmentCount = appointments.length;

    // Calculate average revenue per appointment
    const avgRevenuePerAppointment =
      periodAppointmentCount > 0 ? periodRevenue / periodAppointmentCount : 0;

    // Calculate unique customers for the period
    const uniqueCustomers = new Set(appointments.map((apt) => apt.customer.id)).size;

    // Calculate average revenue per customer
    const avgRevenuePerCustomer =
      uniqueCustomers > 0 ? periodRevenue / uniqueCustomers : 0;

    // Get total appointments (all statuses) for completion rate
    const allAppointmentsCount = await prisma.appointment.count({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: {
          in: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
    });
    const completionRate =
      allAppointmentsCount > 0
        ? (periodAppointmentCount / allAppointmentsCount) * 100
        : 0;

    // ============================================
    // CALM IMPACT METRICS - Always use standard week/month ranges
    // ============================================

    // Get routes for the last 7 days to calculate time recovered
    const weeklyRoutes = await prisma.route.findMany({
      where: {
        accountId,
        routeDate: {
          gte: sevenDaysAgo,
          lt: today,
        },
      },
      select: {
        totalDriveMinutes: true,
        routeDate: true,
      },
    });

    // Get routes for the last 30 days
    const monthlyRoutes = await prisma.route.findMany({
      where: {
        accountId,
        routeDate: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        totalDriveMinutes: true,
        routeDate: true,
      },
    });

    // Calculate time recovered (estimate 20% savings from optimization)
    const weeklyTimeRecoveredMinutes = weeklyRoutes.reduce(
      (sum, route) => sum + Math.round((route.totalDriveMinutes || 0) * 0.2),
      0
    );
    const monthlyTimeRecoveredMinutes = monthlyRoutes.reduce(
      (sum, route) => sum + Math.round((route.totalDriveMinutes || 0) * 0.2),
      0
    );

    // Count days with routes (days stayed organized)
    const weeklyOrganizedDays = weeklyRoutes.length;
    const monthlyOrganizedDays = monthlyRoutes.length;

    // Get weekly appointments for calm impact (always last 7 days)
    const weeklyCompletedAppointments = await prisma.appointment.count({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: sevenDaysAgo,
          lt: today,
        },
        status: "COMPLETED",
      },
    });

    // Weekly unique customers for calm impact
    const weeklyCustomerAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: sevenDaysAgo,
          lt: today,
        },
        status: "COMPLETED",
      },
      select: {
        customer: { select: { id: true } },
      },
    });
    const weeklyClientsServed = new Set(weeklyCustomerAppointments.map((apt) => apt.customer.id)).size;

    // Get daily quote for calm impact message
    const calmImpactMessage = getDailyQuote();

    return NextResponse.json({
      // Period info
      period,
      periodLabel,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      isMonthlyView,

      // Chart data (daily for weeks, weekly for months)
      chartData,

      // Period totals
      periodRevenue,
      periodLostRevenue,
      periodAppointments: periodAppointmentCount,

      // Averages and rates
      avgRevenuePerAppointment,
      avgRevenuePerCustomer,
      uniqueCustomers,
      completionRate,

      // Groomer filter info
      groomerId: groomerId || "all",
      canFilterByGroomer,

      // Calm impact metrics (always based on standard week/month)
      calmImpact: {
        weeklyTimeRecoveredMinutes,
        monthlyTimeRecoveredMinutes,
        weeklyOrganizedDays,
        monthlyOrganizedDays,
        weeklyClientsServed,
        monthlyClientsServed: uniqueCustomers,
        weeklyAppointmentsSmooth: weeklyCompletedAppointments,
        monthlyAppointmentsSmooth: periodAppointmentCount,
        calmImpactMessage,
      },
    });
  } catch (error) {
    console.error("Revenue stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue stats" },
      { status: 500 }
    );
  }
}
