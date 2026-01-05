import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateTodayPerformance,
  calculateWeeklyPerformance,
  generateIndustryInsights,
  calculateRouteEfficiency,
  type AppointmentData,
} from "@/lib/performance-calculator";
import { calculateBreakStats } from "@/lib/break-calculator";

/**
 * GET /api/dashboard/performance
 * Get performance metrics for today and this week
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Fetch today's appointments with pet data
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
      include: {
        pet: {
          select: {
            weight: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Fetch today's route
    const todayRoute = await prisma.route.findFirst({
      where: {
        accountId,
        groomerId: groomer.id,
        routeDate: today,
      },
    });

    // Fetch today's breaks
    const todayBreaks = await prisma.break.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        breakDate: today,
      },
    });

    // Fetch this week's completed appointments
    const weeklyAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: startOfWeek,
          lt: tomorrow,
        },
        status: "COMPLETED",
      },
      include: {
        pet: {
          select: {
            weight: true,
          },
        },
      },
    });

    // Fetch this week's routes
    const weeklyRoutes = await prisma.route.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        routeDate: {
          gte: startOfWeek,
          lt: tomorrow,
        },
      },
      select: {
        totalDriveMinutes: true,
        routeDate: true,
      },
    });

    // Count days worked this week (days with completed appointments)
    const daysWorkedSet = new Set<string>();
    weeklyAppointments.forEach((apt) => {
      const dateStr = new Date(apt.startAt).toISOString().split("T")[0];
      daysWorkedSet.add(dateStr);
    });
    const daysWorked = daysWorkedSet.size;

    // Get assistant status for today
    const hasAssistant = todayRoute?.hasAssistant ?? groomer.defaultHasAssistant;

    // Transform appointments for calculator
    const todayData: AppointmentData[] = todayAppointments.map((apt) => ({
      id: apt.id,
      status: apt.status,
      price: apt.price ? Number(apt.price) : null,
      startAt: apt.startAt,
      serviceMinutes: apt.serviceMinutes,
      pet: apt.pet,
    }));

    const completedTodayData = todayData.filter(
      (apt) => apt.status === "COMPLETED"
    );

    const weeklyData: AppointmentData[] = weeklyAppointments.map((apt) => ({
      id: apt.id,
      status: apt.status,
      price: apt.price ? Number(apt.price) : null,
      startAt: apt.startAt,
      serviceMinutes: apt.serviceMinutes,
      pet: apt.pet,
    }));

    // Calculate today's performance
    const todayPerformance = calculateTodayPerformance(
      todayData,
      completedTodayData,
      todayRoute
        ? {
            totalDriveMinutes: todayRoute.totalDriveMinutes,
            totalDistanceMeters: todayRoute.totalDistanceMeters,
            hasAssistant,
          }
        : null,
      hasAssistant
    );

    // Calculate weekly performance
    const weeklyPerformance = calculateWeeklyPerformance(
      weeklyData,
      weeklyRoutes,
      daysWorked
    );

    // Calculate 30-day stats for industry insights
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: thirtyDaysAgo,
          lt: tomorrow,
        },
        status: "COMPLETED",
      },
      include: {
        pet: {
          select: {
            weight: true,
          },
        },
      },
    });

    const last30DaysRoutes = await prisma.route.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        routeDate: {
          gte: thirtyDaysAgo,
          lt: tomorrow,
        },
      },
      select: {
        totalDriveMinutes: true,
        routeDate: true,
      },
    });

    // Calculate 30-day metrics
    const days30Worked = new Set<string>();
    last30DaysAppointments.forEach((apt) => {
      const dateStr = new Date(apt.startAt).toISOString().split("T")[0];
      days30Worked.add(dateStr);
    });
    const daysWorked30 = days30Worked.size || 1;

    const totalDogs30 = last30DaysAppointments.length;
    const avgDogsPerDay30 = totalDogs30 / daysWorked30;

    // Calculate energy load
    let totalEnergy30 = 0;
    let largeDogCount30 = 0;
    for (const apt of last30DaysAppointments) {
      const weight = apt.pet?.weight || 35; // Default medium
      if (weight <= 20) totalEnergy30 += 1;
      else if (weight <= 50) totalEnergy30 += 1.5;
      else if (weight <= 80) {
        totalEnergy30 += 2;
        largeDogCount30++;
      } else {
        totalEnergy30 += 3;
        largeDogCount30++;
      }
    }
    const avgEnergyPerDay30 = totalEnergy30 / daysWorked30;
    const avgLargeDogsPerDay30 = largeDogCount30 / daysWorked30;

    // Calculate avg drive time
    const totalDriveMinutes30 = last30DaysRoutes.reduce(
      (sum, r) => sum + (r.totalDriveMinutes || 0),
      0
    );
    const avgDriveMinutes30 =
      totalDogs30 > daysWorked30
        ? totalDriveMinutes30 / (totalDogs30 - daysWorked30)
        : null;

    // Calculate cancellation rate
    const last30DaysCancelled = await prisma.appointment.count({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: thirtyDaysAgo,
          lt: tomorrow,
        },
        status: {
          in: ["CANCELLED", "NO_SHOW"],
        },
      },
    });
    const totalAppointments30 = totalDogs30 + last30DaysCancelled;
    const cancellationRate30 =
      totalAppointments30 > 0
        ? (last30DaysCancelled / totalAppointments30) * 100
        : 0;

    // Generate industry insights
    const insights = generateIndustryInsights(
      avgDogsPerDay30,
      avgEnergyPerDay30,
      avgDriveMinutes30,
      cancellationRate30,
      avgLargeDogsPerDay30,
      hasAssistant
    );

    // Calculate route efficiency if we have route data
    let routeEfficiency = null;
    if (
      todayRoute?.totalDriveMinutes &&
      todayAppointments.length > 1
    ) {
      routeEfficiency = calculateRouteEfficiency(
        todayRoute.totalDriveMinutes,
        todayAppointments.length
      );
    }

    // Calculate break stats
    const breakStats = calculateBreakStats(
      todayBreaks.map((b) => ({
        taken: b.taken,
        takenAt: b.takenAt,
        durationMinutes: b.durationMinutes,
        startTime: b.startTime,
      }))
    );

    return NextResponse.json({
      today: todayPerformance,
      weekly: weeklyPerformance,
      insights,
      routeEfficiency,
      breakStats,
      hasAssistant,
      defaultHasAssistant: groomer.defaultHasAssistant,
    });
  } catch (error) {
    console.error("Performance metrics error:", error);
    return NextResponse.json(
      { error: "Failed to get performance metrics" },
      { status: 500 }
    );
  }
}
