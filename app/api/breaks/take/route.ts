import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/breaks/take
 * Mark a break as taken (either scheduled or ad-hoc)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { breakId, breakType, durationMinutes } = body;

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

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updatedBreak;

    if (breakId) {
      // Update existing scheduled break
      updatedBreak = await prisma.break.update({
        where: { id: breakId },
        data: {
          taken: true,
          takenAt: now,
          durationMinutes: durationMinutes || 15,
        },
      });
    } else {
      // Create ad-hoc break
      updatedBreak = await prisma.break.create({
        data: {
          accountId,
          groomerId: groomer.id,
          breakDate: today,
          breakType: breakType || "SHORT_BREAK",
          taken: true,
          takenAt: now,
          durationMinutes: durationMinutes || 15,
        },
      });
    }

    // Get updated stats for today
    const todaysBreaks = await prisma.break.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        breakDate: today,
        taken: true,
      },
    });

    const breaksTaken = todaysBreaks.length;
    const totalBreakMinutes = todaysBreaks.reduce(
      (sum, b) => sum + (b.durationMinutes || 0),
      0
    );

    // Generate encouraging message
    let message = "Break logged!";
    if (breaksTaken === 1) {
      message = "First break of the day - great start!";
    } else if (breaksTaken === 2) {
      message = "Two breaks today - protecting your energy!";
    } else if (breaksTaken >= 3) {
      message = "You're taking care of yourself - keep it up!";
    }

    return NextResponse.json({
      success: true,
      break: updatedBreak,
      stats: {
        breaksTaken,
        totalBreakMinutes,
      },
      message,
    });
  } catch (error) {
    console.error("Take break error:", error);
    return NextResponse.json(
      { error: "Failed to record break" },
      { status: 500 }
    );
  }
}
