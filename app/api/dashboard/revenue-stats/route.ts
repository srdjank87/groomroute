import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailyQuote } from "@/lib/daily-quotes";
import { getUserGroomerId } from "@/lib/get-user-groomer";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get the current user's groomer ID (respects user-groomer link)
    const groomerId = await getUserGroomerId();

    // Get date ranges
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Last 7 days for chart (excluding today)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // Previous 7 days, not including today

    // Last 30 days for monthly stats (excluding today = days -30 to -1)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Fetch ONLY completed appointments for the last 30 days (actual revenue)
    // Filter by groomerId to show only current groomer's appointments
    // Use lt: today to exclude today (matching weekly calculation and team analytics)
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: thirtyDaysAgo,
          lt: today, // Exclude today to match weekly calculation
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
          gte: thirtyDaysAgo,
          lt: today, // Exclude today to match weekly calculation
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

    // Calculate daily revenue for last 7 days (excluding today)
    const dailyRevenue = [];
    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
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

      dailyRevenue.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue,
        lostRevenue,
        appointments: dayAppointments.length,
        lostAppointments: dayLostAppointments.length,
      });
    }

    // Calculate weekly revenue (last 7 days)
    const weeklyRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const weeklyLostRevenue = dailyRevenue.reduce((sum, day) => sum + day.lostRevenue, 0);
    const weeklyAppointments = dailyRevenue.reduce(
      (sum, day) => sum + day.appointments,
      0
    );

    // Calculate monthly revenue (last 30 days)
    const monthlyRevenue = appointments.reduce(
      (sum, apt) => sum + (apt.price || 0),
      0
    );
    const monthlyLostRevenue = lostAppointments.reduce(
      (sum, apt) => sum + (apt.price || 0),
      0
    );
    const monthlyAppointments = appointments.length;

    // Calculate average revenue per appointment
    const avgRevenuePerAppointment =
      monthlyAppointments > 0 ? monthlyRevenue / monthlyAppointments : 0;

    // Calculate unique customers this month
    const uniqueCustomers = new Set(appointments.map((apt) => apt.customer.id))
      .size;

    // Calculate average revenue per customer
    const avgRevenuePerCustomer =
      uniqueCustomers > 0 ? monthlyRevenue / uniqueCustomers : 0;

    // Get total appointments (all statuses) for completion rate
    const allAppointments = await prisma.appointment.count({
      where: {
        accountId,
        ...(groomerId ? { groomerId } : {}),
        startAt: {
          gte: thirtyDaysAgo,
          lt: today, // Exclude today to match other calculations
        },
        status: {
          in: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
    });
    const completionRate =
      allAppointments > 0
        ? (monthlyAppointments / allAppointments) * 100
        : 0;

    // ============================================
    // CALM IMPACT METRICS - Weekly/Monthly Aggregates
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
    // This is cumulative - bigger numbers feel more meaningful
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

    // Count unique customers served (monthly)
    const monthlyClientsServed = uniqueCustomers;

    // Weekly unique customers
    const weeklyCustomerIds = new Set(
      appointments
        .filter((apt) => {
          const aptDate = new Date(apt.startAt);
          return aptDate >= sevenDaysAgo && aptDate < today;
        })
        .map((apt) => apt.customer.id)
    );
    const weeklyClientsServed = weeklyCustomerIds.size;

    // Get daily quote for calm impact message
    const calmImpactMessage = getDailyQuote();

    return NextResponse.json({
      dailyRevenue,
      weeklyRevenue,
      weeklyLostRevenue,
      weeklyAppointments,
      monthlyRevenue,
      monthlyLostRevenue,
      monthlyAppointments,
      avgRevenuePerAppointment,
      avgRevenuePerCustomer,
      uniqueCustomers,
      completionRate,
      // New calm impact metrics
      calmImpact: {
        weeklyTimeRecoveredMinutes,
        monthlyTimeRecoveredMinutes,
        weeklyOrganizedDays,
        monthlyOrganizedDays,
        weeklyClientsServed,
        monthlyClientsServed,
        weeklyAppointmentsSmooth: weeklyAppointments, // completed appointments
        monthlyAppointmentsSmooth: monthlyAppointments,
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
