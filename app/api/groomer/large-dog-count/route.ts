import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Large dog threshold - dogs over this weight (in lbs) are considered large
const LARGE_DOG_WEIGHT_THRESHOLD = 50;

/**
 * GET /api/groomer/large-dog-count
 * Get the count of large dogs scheduled for a specific date
 * Query params:
 *   - date: YYYY-MM-DD format (defaults to today)
 *   - excludeAppointmentId: Optional appointment ID to exclude (for editing)
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
    const excludeAppointmentId = searchParams.get("excludeAppointmentId");

    // Get groomer with their limit
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
      select: {
        id: true,
        largeDogDailyLimit: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 404 }
      );
    }

    // Parse date
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get appointments for the day with pet weights
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: targetDate,
          lt: nextDay,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        ...(excludeAppointmentId && {
          id: { not: excludeAppointmentId },
        }),
      },
      include: {
        pet: {
          select: {
            weight: true,
            name: true,
          },
        },
      },
    });

    // Count large dogs (weight > threshold)
    const largeDogs = appointments.filter(
      (apt) => apt.pet && apt.pet.weight && apt.pet.weight > LARGE_DOG_WEIGHT_THRESHOLD
    );

    const largeDogCount = largeDogs.length;
    const limit = groomer.largeDogDailyLimit;
    const hasLimit = limit !== null;
    const atLimit = hasLimit && largeDogCount >= limit;
    const overLimit = hasLimit && largeDogCount > limit;

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      largeDogCount,
      limit,
      hasLimit,
      atLimit,
      overLimit,
      remainingSlots: hasLimit ? Math.max(0, limit - largeDogCount) : null,
      largeDogs: largeDogs.map((apt) => ({
        petName: apt.pet?.name,
        weight: apt.pet?.weight,
      })),
    });
  } catch (error) {
    console.error("Get large dog count error:", error);
    return NextResponse.json(
      { error: "Failed to get large dog count" },
      { status: 500 }
    );
  }
}
