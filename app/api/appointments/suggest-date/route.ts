import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getGroomerAreaDays,
  findNextAreaDayDate,
  DAY_NAMES,
} from "@/lib/area-matcher";

// GET - Get suggested booking date based on customer's area and groomer's schedule
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const groomerId = searchParams.get("groomerId");

    if (!customerId || !groomerId) {
      return NextResponse.json(
        { error: "customerId and groomerId are required" },
        { status: 400 }
      );
    }

    // Get customer with their service area
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId: session.user.accountId,
      },
      include: {
        serviceArea: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Verify groomer belongs to account
    const groomer = await prisma.groomer.findFirst({
      where: {
        id: groomerId,
        accountId: session.user.accountId,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "Groomer not found" },
        { status: 404 }
      );
    }

    // If customer has no service area, return null suggestions
    if (!customer.serviceArea) {
      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          serviceAreaId: null,
          serviceAreaName: null,
          serviceAreaColor: null,
        },
        suggestedDays: [],
        nextSuggestedDate: null,
        reason: null,
      });
    }

    // Get the days this groomer works in this customer's area
    const suggestedDays = await getGroomerAreaDays(
      groomerId,
      customer.serviceArea.id
    );

    // Find the next date that falls on one of those days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextSuggestedDate = await findNextAreaDayDate(
      groomerId,
      customer.serviceArea.id,
      tomorrow
    );

    // Build reason text
    let reason: string | null = null;
    if (suggestedDays.length > 0) {
      const dayNames = suggestedDays.map((d) => DAY_NAMES[d]).join(", ");
      reason = `${groomer.name} works in ${customer.serviceArea.name} on ${dayNames}`;
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        serviceAreaId: customer.serviceArea.id,
        serviceAreaName: customer.serviceArea.name,
        serviceAreaColor: customer.serviceArea.color,
      },
      suggestedDays,
      nextSuggestedDate: nextSuggestedDate?.toISOString().split("T")[0] || null,
      reason,
    });
  } catch (error) {
    console.error("Error getting suggested date:", error);
    return NextResponse.json(
      { error: "Failed to get suggested date" },
      { status: 500 }
    );
  }
}
