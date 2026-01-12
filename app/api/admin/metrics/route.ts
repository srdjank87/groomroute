import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/metrics
 * Get key business metrics
 */
export async function GET() {
  // Check admin authentication
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Date ranges
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total accounts
    const totalAccounts = await prisma.account.count();

    // Accounts by status
    const accountsByStatus = await prisma.account.groupBy({
      by: ["subscriptionStatus"],
      _count: true,
    });

    // Accounts by plan
    const accountsByPlan = await prisma.account.groupBy({
      by: ["subscriptionPlan"],
      _count: true,
    });

    // Signups this week
    const signupsThisWeek = await prisma.account.count({
      where: { createdAt: { gte: startOfWeek } },
    });

    // Signups this month
    const signupsThisMonth = await prisma.account.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Signups last month (for comparison)
    const signupsLastMonth = await prisma.account.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // Active trials (not expired)
    const activeTrials = await prisma.account.count({
      where: {
        subscriptionStatus: "TRIAL",
        trialEndsAt: { gt: now },
      },
    });

    // Paid accounts
    const paidAccounts = await prisma.account.count({
      where: { subscriptionStatus: "ACTIVE" },
    });

    // Expired trials (for conversion rate)
    const expiredTrials = await prisma.account.count({
      where: {
        subscriptionStatus: { in: ["EXPIRED", "CANCELED"] },
      },
    });

    // Conversion rate
    const totalFinishedTrials = paidAccounts + expiredTrials;
    const conversionRate = totalFinishedTrials > 0
      ? (paidAccounts / totalFinishedTrials) * 100
      : 0;

    // Total customers (across all accounts)
    const totalCustomers = await prisma.customer.count();

    // Total appointments
    const totalAppointments = await prisma.appointment.count();

    // Appointments this week
    const appointmentsThisWeek = await prisma.appointment.count({
      where: { createdAt: { gte: startOfWeek } },
    });

    // Appointments this month
    const appointmentsThisMonth = await prisma.appointment.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    return NextResponse.json({
      overview: {
        totalAccounts,
        activeTrials,
        paidAccounts,
        conversionRate: conversionRate.toFixed(1),
      },
      signups: {
        thisWeek: signupsThisWeek,
        thisMonth: signupsThisMonth,
        lastMonth: signupsLastMonth,
        monthOverMonthChange: signupsLastMonth > 0
          ? (((signupsThisMonth - signupsLastMonth) / signupsLastMonth) * 100).toFixed(1)
          : "N/A",
      },
      usage: {
        totalCustomers,
        totalAppointments,
        appointmentsThisWeek,
        appointmentsThisMonth,
      },
      breakdown: {
        byStatus: accountsByStatus.reduce((acc, item) => {
          acc[item.subscriptionStatus] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byPlan: accountsByPlan.reduce((acc, item) => {
          acc[item.subscriptionPlan] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
