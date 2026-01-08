import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/appointments/check-conflict
 * Check if a proposed appointment time conflicts with existing appointments
 *
 * Query params:
 * - date: YYYY-MM-DD format
 * - time: HH:MM format (24-hour)
 * - duration: number of minutes for the appointment
 * - excludeId: (optional) appointment ID to exclude from conflict check (for edits)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const durationStr = searchParams.get("duration");
    const excludeId = searchParams.get("excludeId");

    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr || "90");

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

    // Parse the proposed appointment time
    const [hours, minutes] = time.split(":").map(Number);
    const proposedStart = new Date(`${date}T${time}:00`);
    const proposedEnd = new Date(proposedStart.getTime() + duration * 60 * 1000);

    // Get all appointments for this date
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        pet: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Check for conflicts
    const conflicts: Array<{
      id: string;
      customerName: string;
      petName: string;
      startTime: string;
      endTime: string;
    }> = [];

    for (const apt of existingAppointments) {
      const existingStart = new Date(apt.startAt);
      const existingEnd = new Date(existingStart.getTime() + apt.serviceMinutes * 60 * 1000);

      // Check if times overlap
      // Conflict exists if: proposedStart < existingEnd AND proposedEnd > existingStart
      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        conflicts.push({
          id: apt.id,
          customerName: apt.customer?.name || "Unknown",
          petName: apt.pet?.name || "Unknown",
          startTime: formatTime(existingStart),
          endTime: formatTime(existingEnd),
        });
      }
    }

    const hasConflict = conflicts.length > 0;

    return NextResponse.json({
      hasConflict,
      conflicts,
      proposedStart: formatTime(proposedStart),
      proposedEnd: formatTime(proposedEnd),
      date,
      time,
      duration,
    });
  } catch (error) {
    console.error("Check conflict error:", error);
    return NextResponse.json(
      { error: "Failed to check conflicts" },
      { status: 500 }
    );
  }
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
