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

    // Fetch today's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["BOOKED", "CONFIRMED", "IN_PROGRESS"],
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

    const hasData = appointments.length > 0;

    // Check if this is sample data (we'll mark sample customers with a special tag)
    const showSampleData = hasData && appointments.some(apt =>
      apt.customer.notes?.includes("[SAMPLE_DATA]")
    );

    // Get today's route for stats
    const route = hasData
      ? await prisma.route.findFirst({
          where: {
            accountId,
            routeDate: today,
          },
          include: {
            stops: {
              include: {
                appointment: {
                  include: {
                    customer: true,
                    pet: true,
                  },
                },
              },
              orderBy: {
                sequence: "asc",
              },
            },
          },
        })
      : null;

    // Calculate stats
    let timeSaved = 0;
    let milesSaved = 0;
    let estimatedGasSavings = 0;

    if (route) {
      // Estimate time saved (comparing optimized vs unoptimized)
      // Simple calculation: assume 20% time savings from optimization
      const totalDriveMinutes = route.totalDriveMinutes || 0;
      timeSaved = Math.round(totalDriveMinutes * 0.2);

      // Estimate miles saved
      const totalDistanceMiles = (route.totalDistanceMeters || 0) / 1609.34;
      milesSaved = Math.round(totalDistanceMiles * 0.2);

      // Estimate gas savings ($3.50/gallon, 20 MPG average)
      estimatedGasSavings = (milesSaved / 20) * 3.5;
    }

    // Get next appointment
    const nextAppointment = appointments.length > 0 ? appointments[0] : null;

    const response = {
      appointments: appointments.length,
      nextAppointment: nextAppointment
        ? {
            customerName: nextAppointment.customer.name,
            address: nextAppointment.customer.address,
            // Return ISO string so client can format in user's local timezone
            startAt: nextAppointment.startAt.toISOString(),
            petName: nextAppointment.pet?.name,
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
          }
        : undefined,
      timeSaved,
      milesSaved,
      estimatedGasSavings,
      hasData,
      showSampleData,
      contactMethods: groomer?.contactMethods || ["call", "sms"],
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
