import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { syncAppointmentToCalendar, deleteCalendarEvent } from "@/lib/google-calendar";

const updateAppointmentSchema = z.object({
  status: z.enum(["BOOKED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  startAt: z.string().optional(),
  serviceMinutes: z.number().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
});

// GET single appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: appointmentId } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        accountId,
      },
      include: {
        customer: true,
        pet: true,
        groomer: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: appointmentId } = await params;
    const body = await req.json();
    const validatedData = updateAppointmentSchema.parse(body);

    // Verify appointment belongs to this account
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        accountId,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status as AppointmentStatus;

      // When confirming, also set customerConfirmed and confirmedAt
      if (validatedData.status === "CONFIRMED") {
        updateData.customerConfirmed = true;
        updateData.confirmedAt = new Date();
      }

      // When starting an appointment (IN_PROGRESS), auto-complete any existing IN_PROGRESS appointment
      if (validatedData.status === "IN_PROGRESS") {
        await prisma.appointment.updateMany({
          where: {
            accountId,
            groomerId: existingAppointment.groomerId,
            status: "IN_PROGRESS",
            id: { not: appointmentId },
          },
          data: {
            status: "COMPLETED",
          },
        });
      }
    }

    if (validatedData.startAt !== undefined) {
      updateData.startAt = new Date(validatedData.startAt);
    }

    if (validatedData.serviceMinutes !== undefined) {
      updateData.serviceMinutes = validatedData.serviceMinutes;
    }

    if (validatedData.price !== undefined) {
      updateData.price = validatedData.price;
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes || null;
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        customer: true,
        pet: true,
        groomer: true,
      },
    });

    // Sync to Google Calendar if connected (async, don't wait)
    // For cancelled/no-show, delete from calendar; otherwise update
    if (validatedData.status === "CANCELLED" || validatedData.status === "NO_SHOW") {
      if (appointment.googleCalendarEventId) {
        deleteCalendarEvent(accountId, appointment.googleCalendarEventId).catch((err) =>
          console.error("Calendar delete failed:", err)
        );
      }
    } else {
      syncAppointmentToCalendar(accountId, {
        id: appointment.id,
        startAt: appointment.startAt,
        serviceMinutes: appointment.serviceMinutes,
        appointmentType: appointment.appointmentType,
        notes: appointment.notes,
        googleCalendarEventId: appointment.googleCalendarEventId,
        customer: {
          name: appointment.customer.name,
          phone: appointment.customer.phone,
          address: appointment.customer.address,
        },
        pet: appointment.pet,
        groomer: { name: appointment.groomer.name },
      }).catch((err) => console.error("Calendar sync failed:", err));
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { id: appointmentId } = await params;

    // Verify appointment belongs to this account
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        accountId,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Delete from Google Calendar if synced
    if (existingAppointment.googleCalendarEventId) {
      deleteCalendarEvent(accountId, existingAppointment.googleCalendarEventId).catch((err) =>
        console.error("Calendar delete failed:", err)
      );
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
