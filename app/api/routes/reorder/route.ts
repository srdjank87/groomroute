import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/routes/reorder
 * Reorder appointments by swapping time slots - appointments take the time of their new position
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { date, appointmentIds } = body;

    if (!date || !appointmentIds || !Array.isArray(appointmentIds)) {
      return NextResponse.json(
        { error: "Date and appointmentIds array are required" },
        { status: 400 }
      );
    }

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

    // Ensure we're only reordering today's route (use UTC date)
    const now = new Date();
    const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
    if (date !== today) {
      return NextResponse.json(
        { error: "Can only reorder today's route" },
        { status: 400 }
      );
    }

    // Fetch all appointments by their IDs
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        id: { in: appointmentIds },
        groomerId: groomer.id,
        status: {
          notIn: ["CANCELLED", "NO_SHOW", "COMPLETED"],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        pet: {
          select: {
            name: true,
          },
        },
      },
    });

    // Verify all requested appointments were found
    if (appointments.length !== appointmentIds.length) {
      return NextResponse.json(
        { error: "Some appointments not found or already completed" },
        { status: 400 }
      );
    }

    // Sort appointments by the provided order
    const orderedAppointments = appointmentIds.map((id) =>
      appointments.find((apt) => apt.id === id)!
    );

    // Get the original time slots sorted by start time
    // Each appointment in the new order will take the time slot of that position
    const originalTimeSlots = [...appointments]
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .map((apt) => apt.startAt);

    // Calculate new times by swapping - each position keeps its time slot
    const timeChanges: {
      id: string;
      customerName: string;
      petName: string;
      customerPhone: string | null;
      oldStartAt: string;
      newStartAt: string;
      timeChanged: boolean;
    }[] = [];

    for (let i = 0; i < orderedAppointments.length; i++) {
      const appointment = orderedAppointments[i];
      const oldStartAt = new Date(appointment.startAt);
      const newStartAt = new Date(originalTimeSlots[i]);
      const timeChanged = oldStartAt.getTime() !== newStartAt.getTime();

      timeChanges.push({
        id: appointment.id,
        customerName: appointment.customer.name,
        petName: appointment.pet?.name || "Pet",
        customerPhone: appointment.customer.phone,
        oldStartAt: oldStartAt.toISOString(),
        newStartAt: newStartAt.toISOString(),
        timeChanged,
      });
    }

    // Update all appointments in the database
    await Promise.all(
      timeChanges.map(async (change) => {
        await prisma.appointment.update({
          where: { id: change.id },
          data: { startAt: new Date(change.newStartAt) },
        });
      })
    );

    // Return the changes (including which times changed)
    const affectedAppointments = timeChanges.filter((change) => change.timeChanged);

    return NextResponse.json({
      success: true,
      message:
        affectedAppointments.length > 0
          ? `Route reordered. ${affectedAppointments.length} appointment${affectedAppointments.length === 1 ? "" : "s"} updated.`
          : "Route order confirmed (no time changes needed).",
      appointments: timeChanges,
      affectedCount: affectedAppointments.length,
    });
  } catch (error) {
    console.error("Route reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder route" },
      { status: 500 }
    );
  }
}
