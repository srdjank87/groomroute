import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get date ranges
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Last 7 days for chart
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Including today = 7 days

    // Last 30 days for monthly stats
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29); // Including today = 30 days

    // Fetch appointments for the last 30 days (completed or in progress)
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          in: ["COMPLETED", "IN_PROGRESS", "BOOKED", "CONFIRMED"],
        },
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

    // Calculate daily revenue for last 7 days
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.startAt);
        return aptDate >= date && aptDate < nextDate;
      });

      const revenue = dayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

      dailyRevenue.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue,
        appointments: dayAppointments.length,
      });
    }

    // Calculate weekly revenue (last 7 days)
    const weeklyRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const weeklyAppointments = dailyRevenue.reduce(
      (sum, day) => sum + day.appointments,
      0
    );

    // Calculate monthly revenue (last 30 days)
    const monthlyRevenue = appointments.reduce(
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

    // Get completed appointments for completion rate
    const completedAppointments = appointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const completionRate =
      monthlyAppointments > 0
        ? (completedAppointments / monthlyAppointments) * 100
        : 0;

    return NextResponse.json({
      dailyRevenue,
      weeklyRevenue,
      weeklyAppointments,
      monthlyRevenue,
      monthlyAppointments,
      avgRevenuePerAppointment,
      avgRevenuePerCustomer,
      uniqueCustomers,
      completionRate,
    });
  } catch (error) {
    console.error("Revenue stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue stats" },
      { status: 500 }
    );
  }
}
