import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getBreakSuggestionFromAppointments,
  calculateBreakStats,
} from "@/lib/break-calculator";

/**
 * GET /api/breaks/suggest
 * Get a smart break suggestion based on current state
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

    // Fetch today's appointments with pet data
    const appointments = await prisma.appointment.findMany({
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

    // Fetch today's breaks
    const breaks = await prisma.break.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        breakDate: today,
      },
    });

    // Calculate break stats
    const breakStats = calculateBreakStats(
      breaks.map((b) => ({
        taken: b.taken,
        takenAt: b.takenAt,
        durationMinutes: b.durationMinutes,
        startTime: b.startTime,
      }))
    );

    // Format appointments for break calculator
    const appointmentsForCalc = appointments.map((apt) => ({
      id: apt.id,
      status: apt.status,
      startAt: apt.startAt,
      serviceMinutes: apt.serviceMinutes,
      pet: apt.pet,
    }));

    // Get break suggestion
    const suggestion = getBreakSuggestionFromAppointments(
      appointmentsForCalc,
      breakStats.lastBreakTime
    );

    return NextResponse.json({
      suggestion,
      stats: breakStats,
    });
  } catch (error) {
    console.error("Break suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to get break suggestion" },
      { status: 500 }
    );
  }
}
