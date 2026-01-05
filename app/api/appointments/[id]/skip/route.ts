import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const skipAppointmentSchema = z.object({
  reason: z.enum(["CANCELLED", "NO_SHOW", "RESCHEDULED", "OTHER"]),
  notes: z.string().optional(),
});

export async function POST(
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
    const validatedData = skipAppointmentSchema.parse(body);

    // Get the appointment with customer info
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        accountId,
      },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Map reason to appointment status
    const statusMap: Record<string, "CANCELLED" | "NO_SHOW"> = {
      CANCELLED: "CANCELLED",
      NO_SHOW: "NO_SHOW",
      RESCHEDULED: "CANCELLED", // Rescheduled is still a cancellation
      OTHER: "CANCELLED",
    };

    const newStatus = statusMap[validatedData.reason];

    // Build notes with reason
    const reasonLabels: Record<string, string> = {
      CANCELLED: "Customer cancelled",
      NO_SHOW: "Customer no-show",
      RESCHEDULED: "Rescheduled to another date",
      OTHER: "Other reason",
    };

    const skipNote = `[SKIPPED] ${reasonLabels[validatedData.reason]}${validatedData.notes ? `: ${validatedData.notes}` : ""}`;
    const updatedNotes = appointment.notes
      ? `${appointment.notes}\n${skipNote}`
      : skipNote;

    // Update appointment status and notes
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: newStatus,
        notes: updatedNotes,
      },
    });

    // Update customer cancellation/no-show counts
    const customerUpdateData: {
      cancellationCount?: { increment: number };
      noShowCount?: { increment: number };
      lastCancellationAt?: Date;
      lastNoShowAt?: Date;
      notes?: string;
    } = {};

    if (validatedData.reason === "NO_SHOW") {
      customerUpdateData.noShowCount = { increment: 1 };
      customerUpdateData.lastNoShowAt = new Date();
    } else if (validatedData.reason === "CANCELLED" || validatedData.reason === "RESCHEDULED") {
      customerUpdateData.cancellationCount = { increment: 1 };
      customerUpdateData.lastCancellationAt = new Date();
    }

    // Add note to customer record
    const customerNote = `[${new Date().toLocaleDateString()}] Appointment ${validatedData.reason.toLowerCase()}: ${validatedData.notes || reasonLabels[validatedData.reason]}`;
    const updatedCustomerNotes = appointment.customer.notes
      ? `${appointment.customer.notes}\n${customerNote}`
      : customerNote;
    customerUpdateData.notes = updatedCustomerNotes;

    await prisma.customer.update({
      where: { id: appointment.customerId },
      data: customerUpdateData,
    });

    // Get updated customer stats for warning
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: appointment.customerId },
      select: {
        name: true,
        cancellationCount: true,
        noShowCount: true,
      },
    });

    const totalIssues = (updatedCustomer?.cancellationCount || 0) + (updatedCustomer?.noShowCount || 0);

    // Build warning message if customer has 3+ issues
    let warning: {
      message: string;
      customerName: string;
      cancellations: number;
      noShows: number;
      suggestions: string[];
    } | null = null;

    if (totalIssues >= 3) {
      warning = {
        message: `${updatedCustomer?.name} has had ${totalIssues} cancellations/no-shows.`,
        customerName: updatedCustomer?.name || "",
        cancellations: updatedCustomer?.cancellationCount || 0,
        noShows: updatedCustomer?.noShowCount || 0,
        suggestions: [
          "Consider requiring an upfront deposit for future bookings",
          "Add a cancellation policy reminder when confirming",
          "Call to confirm 24 hours before appointments",
          "Consider a shorter cancellation window",
        ],
      };
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      warning,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Skip appointment error:", error);
    return NextResponse.json(
      { error: "Failed to skip appointment" },
      { status: 500 }
    );
  }
}
