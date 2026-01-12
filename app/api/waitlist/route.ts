import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const waitlistSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  preferredDays: z.array(z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"])),
  preferredTimes: z.array(z.enum(["MORNING", "AFTERNOON", "EVENING"])),
  flexibleTiming: z.boolean().default(true),
  maxDistance: z.number().nullable().optional(),
  notifyViaSMS: z.boolean().default(true),
  notifyViaEmail: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET - List all waitlist entries for the account
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const activeOnly = searchParams.get("active") !== "false";

    const waitlistEntries = await prisma.customerWaitlist.findMany({
      where: {
        accountId,
        ...(customerId && { customerId }),
        ...(activeOnly && { isActive: true }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            lat: true,
            lng: true,
            serviceArea: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            pets: {
              select: {
                id: true,
                name: true,
                breed: true,
                weight: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ waitlist: waitlistEntries });
  } catch (error) {
    console.error("Get waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    );
  }
}

// POST - Add customer to waitlist
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const validatedData = waitlistSchema.parse(body);

    // Verify customer belongs to this account
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        accountId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if customer is already on the waitlist
    const existingEntry = await prisma.customerWaitlist.findFirst({
      where: {
        customerId: validatedData.customerId,
        isActive: true,
      },
    });

    if (existingEntry) {
      // Update existing entry instead of creating a new one
      const updated = await prisma.customerWaitlist.update({
        where: { id: existingEntry.id },
        data: {
          preferredDays: validatedData.preferredDays,
          preferredTimes: validatedData.preferredTimes,
          flexibleTiming: validatedData.flexibleTiming,
          maxDistance: validatedData.maxDistance ?? null,
          notifyViaSMS: validatedData.notifyViaSMS,
          notifyViaEmail: validatedData.notifyViaEmail,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        entry: updated,
        message: "Waitlist preferences updated",
      });
    }

    // Create new waitlist entry
    const entry = await prisma.customerWaitlist.create({
      data: {
        accountId,
        customerId: validatedData.customerId,
        preferredDays: validatedData.preferredDays,
        preferredTimes: validatedData.preferredTimes,
        flexibleTiming: validatedData.flexibleTiming,
        maxDistance: validatedData.maxDistance ?? null,
        notifyViaSMS: validatedData.notifyViaSMS,
        notifyViaEmail: validatedData.notifyViaEmail,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      entry,
      message: "Client added to waitlist",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create waitlist entry error:", error);
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    );
  }
}

// DELETE - Remove customer from waitlist (soft delete)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get("id");
    const customerId = searchParams.get("customerId");

    if (!entryId && !customerId) {
      return NextResponse.json(
        { error: "Entry ID or Customer ID is required" },
        { status: 400 }
      );
    }

    // Find the entry
    const entry = await prisma.customerWaitlist.findFirst({
      where: {
        accountId,
        ...(entryId && { id: entryId }),
        ...(customerId && { customerId, isActive: true }),
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.customerWaitlist.update({
      where: { id: entry.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from waitlist",
    });
  } catch (error) {
    console.error("Delete waitlist entry error:", error);
    return NextResponse.json(
      { error: "Failed to remove from waitlist" },
      { status: 500 }
    );
  }
}
