import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/breaks
 * Get breaks for today
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

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

    // Get date (default to today)
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Fetch breaks for the day
    const breaks = await prisma.break.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        breakDate: targetDate,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Calculate stats
    const breaksTaken = breaks.filter((b) => b.taken).length;
    const totalBreakMinutes = breaks
      .filter((b) => b.taken)
      .reduce((sum, b) => sum + (b.durationMinutes || 0), 0);

    return NextResponse.json({
      breaks,
      stats: {
        breaksTaken,
        totalBreakMinutes,
        scheduledBreaks: breaks.length,
      },
    });
  } catch (error) {
    console.error("Get breaks error:", error);
    return NextResponse.json(
      { error: "Failed to get breaks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/breaks
 * Schedule a new break
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { breakType, startTime, endTime, date } = body;

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

    // Get date (default to today)
    const breakDate = date ? new Date(date) : new Date();
    breakDate.setHours(0, 0, 0, 0);

    // Create the break
    const newBreak = await prisma.break.create({
      data: {
        accountId,
        groomerId: groomer.id,
        breakDate,
        breakType: breakType || "LUNCH",
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        taken: false,
      },
    });

    return NextResponse.json({
      success: true,
      break: newBreak,
    });
  } catch (error) {
    console.error("Create break error:", error);
    return NextResponse.json(
      { error: "Failed to create break" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/breaks
 * Delete a scheduled break
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const breakId = searchParams.get("id");

    if (!breakId) {
      return NextResponse.json(
        { error: "Break ID is required" },
        { status: 400 }
      );
    }

    // Delete the break (only if it belongs to this account)
    await prisma.break.deleteMany({
      where: {
        id: breakId,
        accountId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete break error:", error);
    return NextResponse.json(
      { error: "Failed to delete break" },
      { status: 500 }
    );
  }
}
