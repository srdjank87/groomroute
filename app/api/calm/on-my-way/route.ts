import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/calm/on-my-way
 * Generate "On My Way" message for a specific appointment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get account for business name
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { name: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the appointment with customer details
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        accountId,
      },
      include: {
        customer: {
          select: {
            id: true,
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

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (!appointment.customer.phone) {
      return NextResponse.json(
        { error: "Customer has no phone number" },
        { status: 400 }
      );
    }

    const businessName = account.name || "Your Groomer";
    const firstName = appointment.customer.name.split(" ")[0];
    const petName = appointment.pet?.name;

    // Generate personalized message
    const message = petName
      ? `Hi ${firstName}! This is ${businessName}. I'm on my way to groom ${petName} now! See you soon.`
      : `Hi ${firstName}! This is ${businessName}. I'm on my way to you now! See you soon.`;

    return NextResponse.json({
      success: true,
      message,
      customerName: appointment.customer.name,
      customerPhone: appointment.customer.phone,
      petName: appointment.pet?.name,
    });
  } catch (error) {
    console.error("On My Way error:", error);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 }
    );
  }
}
