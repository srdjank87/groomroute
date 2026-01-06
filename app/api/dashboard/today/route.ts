import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate calm, affirming messages based on day status
function getCalmMessage(
  appointmentCount: number,
  confirmedCount: number,
  completedCount: number,
  hasRoute: boolean
): string {
  const hour = new Date().getHours();
  const isMorning = hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;

  if (appointmentCount === 0) {
    return "Enjoy your day off";
  }

  if (completedCount === appointmentCount) {
    return "Another smooth day in the books";
  }

  if (completedCount > 0) {
    const remaining = appointmentCount - completedCount;
    if (remaining === 1) {
      return "Almost there! One more to go";
    }
    return "Great progress. Keep the momentum going";
  }

  // No appointments completed yet
  if (hasRoute) {
    if (isMorning) {
      return "Your day is organized and ready to go";
    }
    if (isAfternoon) {
      return "Your schedule is set. You've got this";
    }
    return "Your route is planned and ready";
  }

  if (confirmedCount === appointmentCount) {
    return "All appointments confirmed. Smooth sailing ahead";
  }

  if (confirmedCount > 0) {
    return "Your day is coming together nicely";
  }

  return "Your schedule is ready when you are";
}

// Determine day status
function getDayStatus(
  appointmentCount: number,
  completedCount: number,
  inProgressCount: number
): "ready" | "in-progress" | "completed" | "no-appointments" {
  if (appointmentCount === 0) return "no-appointments";
  if (completedCount === appointmentCount) return "completed";
  if (inProgressCount > 0 || completedCount > 0) return "in-progress";
  return "ready";
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get groomer profile for contact methods
    const groomer = await prisma.groomer.findFirst({
      where: {
        accountId,
        isActive: true,
      },
      select: {
        contactMethods: true,
      },
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch ALL today's appointments (including completed) for status tracking
    const allTodayAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
      include: {
        customer: true,
        pet: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Filter for active appointments (not completed) for next appointment
    const activeAppointments = allTodayAppointments.filter(
      (apt) => apt.status !== "COMPLETED"
    );

    // Count by status
    const completedCount = allTodayAppointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const confirmedCount = allTodayAppointments.filter(
      (apt) => apt.status === "CONFIRMED"
    ).length;
    const inProgressCount = allTodayAppointments.filter(
      (apt) => apt.status === "IN_PROGRESS"
    ).length;

    const totalAppointments = allTodayAppointments.length;
    const hasData = totalAppointments > 0;

    // Check if this is sample data (we'll mark sample customers with a special tag)
    const showSampleData =
      hasData &&
      allTodayAppointments.some((apt) =>
        apt.customer.notes?.includes("[SAMPLE_DATA]")
      );

    // Get today's route to check if optimized
    const route = hasData
      ? await prisma.route.findFirst({
          where: {
            accountId,
            routeDate: today,
          },
        })
      : null;

    const hasRoute = !!route;

    // Generate status and calm message
    const dayStatus = getDayStatus(
      totalAppointments,
      completedCount,
      inProgressCount
    );
    const calmMessage = getCalmMessage(
      totalAppointments,
      confirmedCount,
      completedCount,
      hasRoute
    );

    // Get next appointment (first active one)
    const nextAppointment =
      activeAppointments.length > 0 ? activeAppointments[0] : null;

    // Get remaining appointments (after the current one) for "Running Late" notifications
    const remainingAppointments = activeAppointments.slice(1).map((apt) => ({
      customerName: apt.customer.name,
      customerPhone: apt.customer.phone,
      startAt: apt.startAt.toISOString(),
    }));

    const response = {
      appointments: activeAppointments.length,
      totalAppointments,
      confirmedCount,
      completedCount,
      dayStatus,
      calmMessage,
      hasRoute,
      nextAppointment: nextAppointment
        ? {
            customerName: nextAppointment.customer.name,
            address: nextAppointment.customer.address,
            // Return ISO string so client can format in user's local timezone
            startAt: nextAppointment.startAt.toISOString(),
            petName: nextAppointment.pet?.name,
            petBreed: nextAppointment.pet?.breed,
            petWeight: nextAppointment.pet?.weight,
            serviceMinutes: nextAppointment.serviceMinutes,
            serviceType:
              nextAppointment.appointmentType === "FULL_GROOM"
                ? "Full Groom"
                : nextAppointment.appointmentType === "BATH_ONLY"
                  ? "Bath Only"
                  : nextAppointment.appointmentType === "NAIL_TRIM"
                    ? "Nail Trim"
                    : nextAppointment.appointmentType === "FACE_FEET_FANNY"
                      ? "Face, Feet & Fanny"
                      : "Service",
            customerPhone: nextAppointment.customer.phone,
            appointmentId: nextAppointment.id,
            status: nextAppointment.status,
          }
        : undefined,
      hasData,
      showSampleData,
      contactMethods: groomer?.contactMethods || ["call", "sms"],
      remainingAppointments,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
