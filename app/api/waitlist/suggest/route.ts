import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getWatchlistSuggestions, type WatchlistSuggestion } from "@/lib/watchlist-suggest";

/**
 * GET /api/waitlist/suggest
 *
 * Get smart watchlist suggestions based on multiple factors:
 * - Day/time preference matching
 * - Service area alignment
 * - Proximity to scheduled appointments
 * - Customer value (spending history)
 * - Reliability (cancellation/no-show history)
 *
 * Query params:
 * - date: Target date (optional, defaults to today)
 * - limit: Max number of suggestions (default 10)
 * - minReliability: Filter by minimum reliability tier (excellent|good|fair|poor)
 * - valueTier: Filter by value tier (high|medium|low, comma-separated)
 * - maxDistance: Maximum distance in miles from route
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);

    // Get groomer for this account
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
      include: {
        account: {
          select: { timezone: true },
        },
      },
    });

    if (!groomer) {
      return NextResponse.json({ error: "No groomer found" }, { status: 404 });
    }

    // Get account timezone
    const timezone = groomer.account?.timezone || "America/New_York";

    // Parse date parameter or default to today
    const dateStr = searchParams.get("date");
    let targetDate: Date;

    if (dateStr) {
      targetDate = parseISO(dateStr);
    } else {
      // Use account's local "today"
      const now = new Date();
      const localNow = toZonedTime(now, timezone);
      targetDate = new Date(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate()
      );
    }

    // Parse optional filters
    const limit = parseInt(searchParams.get("limit") || "10");
    const minReliability = searchParams.get("minReliability") as
      | "excellent"
      | "good"
      | "fair"
      | "poor"
      | null;
    const valueTierParam = searchParams.get("valueTier");
    const valueTierFilter = valueTierParam
      ? (valueTierParam.split(",") as ("high" | "medium" | "low")[])
      : undefined;
    const maxDistanceParam = searchParams.get("maxDistance");
    const maxDistanceMiles = maxDistanceParam
      ? parseFloat(maxDistanceParam)
      : undefined;

    // Get suggestions
    const suggestions = await getWatchlistSuggestions({
      accountId,
      groomerId: groomer.id,
      targetDate,
      limit,
      minReliabilityTier: minReliability || undefined,
      valueTierFilter,
      maxDistanceMiles,
    });

    // Get summary stats
    const totalWaitlistCount = await prisma.customerWaitlist.count({
      where: { accountId, isActive: true },
    });

    // Get today's appointment count for context
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const todaysAppointmentCount = await prisma.appointment.count({
      where: {
        accountId,
        groomerId: groomer.id,
        startAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
    });

    // Format response
    return NextResponse.json({
      date: format(targetDate, "yyyy-MM-dd"),
      dayOfWeek: format(targetDate, "EEEE"),
      suggestions: suggestions.map((s) => ({
        ...s,
        lastAppointmentDate: s.lastAppointmentDate
          ? format(s.lastAppointmentDate, "yyyy-MM-dd")
          : null,
      })),
      meta: {
        totalWaitlistCount,
        suggestionsReturned: suggestions.length,
        todaysAppointmentCount,
        filters: {
          limit,
          minReliability: minReliability || null,
          valueTier: valueTierFilter || null,
          maxDistance: maxDistanceMiles || null,
        },
      },
    });
  } catch (error) {
    console.error("Waitlist suggest error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
