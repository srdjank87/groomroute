import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toZonedTime } from "date-fns-tz";

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

    // Get groomer profile for contact methods and account for timezone
    const groomer = await prisma.groomer.findFirst({
      where: {
        accountId,
        isActive: true,
      },
      select: {
        contactMethods: true,
        account: {
          select: {
            timezone: true,
          },
        },
      },
    });

    // Get the account's timezone (default to America/New_York)
    const timezone = groomer?.account?.timezone || "America/New_York";

    // Get today's date range based on the ACCOUNT'S LOCAL timezone
    // Appointments are stored with UTC timestamps that represent local display times
    // (e.g., 9 AM local is stored as T09:00:00.000Z)
    // So we query using local date boundaries in UTC format
    const now = new Date();
    // Convert current time to account's timezone to get local date
    const localNow = toZonedTime(now, timezone);
    // Use the local date components to build UTC query boundaries
    const today = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 0, 0, 0, 0));
    const tomorrow = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate() + 1, 0, 0, 0, 0));

    // Fetch ALL today's appointments (including completed, cancelled, no-show) for status tracking
    const allTodayAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
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

    // Filter for active appointments (not completed, cancelled, or no-show) for next appointment
    const activeAppointments = allTodayAppointments.filter(
      (apt) => !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(apt.status)
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
    const cancelledCount = allTodayAppointments.filter(
      (apt) => apt.status === "CANCELLED"
    ).length;
    const noShowCount = allTodayAppointments.filter(
      (apt) => apt.status === "NO_SHOW"
    ).length;

    // Total scheduled appointments (excluding cancelled/no-show for "hasData" purposes)
    const scheduledAppointments = allTodayAppointments.filter(
      (apt) => !["CANCELLED", "NO_SHOW"].includes(apt.status)
    );
    const totalAppointments = scheduledAppointments.length;
    const totalScheduledToday = allTodayAppointments.length; // Including cancelled/no-show
    const hasData = totalScheduledToday > 0;

    // Check if this is sample data (we'll mark sample customers with a special tag)
    const showSampleData =
      hasData &&
      scheduledAppointments.some((apt) =>
        apt.customer.notes?.includes("[SAMPLE_DATA]")
      );

    // Get today's route to check if optimized and workday started
    const route = hasData
      ? await prisma.route.findFirst({
          where: {
            accountId,
            routeDate: today,
          },
          select: {
            id: true,
            workdayStarted: true,
          },
        })
      : null;

    const hasRoute = !!route;
    const workdayStarted = route?.workdayStarted ?? false;

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
      cancelledCount,
      noShowCount,
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
      workdayStarted,
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
