import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/area-date-overrides
 * Get all date overrides for a month
 * Query params:
 * - month: YYYY-MM format (required)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "month parameter is required in YYYY-MM format" },
        { status: 400 }
      );
    }

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
    });

    if (!groomer) {
      return NextResponse.json({ error: "No groomer found" }, { status: 400 });
    }

    // Parse month to get date range
    const [year, monthNum] = month.split("-").map(Number);
    const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, monthNum, 0)); // Last day of month

    // Get all overrides for the month
    const overrides = await prisma.areaDateOverride.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Format for response
    const formattedOverrides = overrides.map((o) => ({
      id: o.id,
      date: o.date.toISOString().split("T")[0],
      areaId: o.areaId,
      areaName: o.area?.name ?? null,
      areaColor: o.area?.color ?? null,
    }));

    return NextResponse.json({
      month,
      overrides: formattedOverrides,
    });
  } catch (error) {
    console.error("Get area date overrides error:", error);
    return NextResponse.json(
      { error: "Failed to fetch area date overrides" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/area-date-overrides
 * Create or update an override for a specific date
 * Body: { date: "YYYY-MM-DD", areaId: string | null }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { date, areaId } = body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date is required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
    });

    if (!groomer) {
      return NextResponse.json({ error: "No groomer found" }, { status: 400 });
    }

    // Validate areaId if provided
    if (areaId) {
      const area = await prisma.serviceArea.findFirst({
        where: { id: areaId, accountId },
      });
      if (!area) {
        return NextResponse.json({ error: "Area not found" }, { status: 400 });
      }
    }

    // Parse date
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));

    // Upsert the override
    const override = await prisma.areaDateOverride.upsert({
      where: {
        groomerId_date: {
          groomerId: groomer.id,
          date: dateObj,
        },
      },
      update: {
        areaId: areaId ?? null,
      },
      create: {
        accountId,
        groomerId: groomer.id,
        date: dateObj,
        areaId: areaId ?? null,
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      override: {
        id: override.id,
        date: override.date.toISOString().split("T")[0],
        areaId: override.areaId,
        areaName: override.area?.name ?? null,
        areaColor: override.area?.color ?? null,
      },
    });
  } catch (error) {
    console.error("Create/update area date override error:", error);
    return NextResponse.json(
      { error: "Failed to save area date override" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/area-date-overrides
 * Remove an override (reverts to default pattern)
 * Body: { date: "YYYY-MM-DD" }
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { date } = body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date is required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
    });

    if (!groomer) {
      return NextResponse.json({ error: "No groomer found" }, { status: 400 });
    }

    // Parse date
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));

    // Delete the override if it exists
    await prisma.areaDateOverride.deleteMany({
      where: {
        groomerId: groomer.id,
        date: dateObj,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete area date override error:", error);
    return NextResponse.json(
      { error: "Failed to delete area date override" },
      { status: 500 }
    );
  }
}
