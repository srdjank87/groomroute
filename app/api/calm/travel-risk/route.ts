import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format, addMinutes } from "date-fns";

interface TravelRiskSegment {
  id: string;
  fromCustomer: string;
  fromAddress: string;
  fromEndTime: string;
  toCustomer: string;
  toAddress: string;
  toStartTime: string;
  gapMinutes: number;
  estimatedTravelMinutes: number;
  riskLevel: "tight" | "risky" | "impossible";
  suggestion: string;
}

/**
 * GET /api/calm/travel-risk
 * Analyze today's route for travel time risks
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get account to check subscription plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true, timezone: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user can access Calm Control
    if (!canAccessCalmControl(account)) {
      return NextResponse.json(
        {
          error: "This feature requires the Growth or Pro plan.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
        },
        { status: 403 }
      );
    }

    const timezone = account.timezone || "America/New_York";

    // Get today's date based on account's timezone
    const now = new Date();
    const localNow = toZonedTime(now, timezone);
    const today = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const tomorrow = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate() + 1,
        0,
        0,
        0,
        0
      )
    );

    // Get today's active appointments sorted by time
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
        pet: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    if (appointments.length < 2) {
      return NextResponse.json({
        hasRisks: false,
        segments: [],
        summary: {
          totalSegments: 0,
          riskySegments: 0,
          message: "Not enough appointments to analyze travel risk.",
        },
      });
    }

    // Analyze gaps between appointments
    const riskSegments: TravelRiskSegment[] = [];

    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];

      const currentEnd = addMinutes(current.startAt, current.serviceMinutes);
      const gapMinutes = Math.round(
        (next.startAt.getTime() - currentEnd.getTime()) / (1000 * 60)
      );

      // Format addresses
      const currentAddress = [
        current.customer.address,
        current.customer.city,
        current.customer.state,
      ]
        .filter(Boolean)
        .join(", ");

      const nextAddress = [
        next.customer.address,
        next.customer.city,
        next.customer.state,
      ]
        .filter(Boolean)
        .join(", ");

      // Estimate travel time (rough estimate: 15 min average for mobile grooming)
      // In a real app, this would use Google Maps API
      const estimatedTravelMinutes = 15;

      // Determine risk level
      let riskLevel: "tight" | "risky" | "impossible";
      let suggestion: string;

      if (gapMinutes < 5) {
        riskLevel = "impossible";
        suggestion = `Only ${gapMinutes} min gap - impossible to make it. Consider rescheduling.`;
      } else if (gapMinutes < 10) {
        riskLevel = "risky";
        suggestion = `Very tight ${gapMinutes} min gap. High risk of being late.`;
      } else if (gapMinutes < 15) {
        riskLevel = "tight";
        suggestion = `${gapMinutes} min gap is cutting it close for travel time.`;
      } else {
        // Skip segments with adequate time
        continue;
      }

      riskSegments.push({
        id: `${current.id}-${next.id}`,
        fromCustomer: current.customer.name,
        fromAddress: currentAddress || "Address not available",
        fromEndTime: format(currentEnd, "h:mm a"),
        toCustomer: next.customer.name,
        toAddress: nextAddress || "Address not available",
        toStartTime: format(next.startAt, "h:mm a"),
        gapMinutes,
        estimatedTravelMinutes,
        riskLevel,
        suggestion,
      });
    }

    // Calculate summary
    const impossibleCount = riskSegments.filter(
      (s) => s.riskLevel === "impossible"
    ).length;
    const riskyCount = riskSegments.filter(
      (s) => s.riskLevel === "risky"
    ).length;
    const tightCount = riskSegments.filter(
      (s) => s.riskLevel === "tight"
    ).length;

    let summaryMessage: string;
    if (impossibleCount > 0) {
      summaryMessage = `${impossibleCount} impossible gap${impossibleCount > 1 ? "s" : ""} detected! You'll need to reschedule.`;
    } else if (riskyCount > 0) {
      summaryMessage = `${riskyCount} risky segment${riskyCount > 1 ? "s" : ""} found. Consider adding buffer time.`;
    } else if (tightCount > 0) {
      summaryMessage = `${tightCount} tight segment${tightCount > 1 ? "s" : ""}. Keep an eye on traffic.`;
    } else {
      summaryMessage = "Your route looks good!";
    }

    return NextResponse.json({
      hasRisks: riskSegments.length > 0,
      segments: riskSegments,
      summary: {
        totalSegments: appointments.length - 1,
        riskySegments: riskSegments.length,
        impossibleCount,
        riskyCount,
        tightCount,
        message: summaryMessage,
      },
      recommendations: [
        riskSegments.length > 0 && {
          id: "add-buffer",
          title: "Add Buffer Time",
          description: "Automatically add buffer time between appointments",
          action: "add_buffer",
        },
        impossibleCount > 0 && {
          id: "optimize-route",
          title: "Optimize Route Order",
          description: "Reorder stops to minimize travel time",
          action: "optimize_route",
        },
        riskSegments.length > 0 && {
          id: "view-map",
          title: "View Full Route",
          description: "Open Google Maps with all stops",
          action: "view_map",
        },
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("Travel Risk GET error:", error);
    return NextResponse.json(
      { error: "Failed to analyze travel risk" },
      { status: 500 }
    );
  }
}
