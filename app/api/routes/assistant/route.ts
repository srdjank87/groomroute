import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserGroomerId } from "@/lib/get-user-groomer";

/**
 * GET /api/routes/assistant
 * Get current assistant status for today's route
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Get groomer defaults
    const groomer = await prisma.groomer.findUnique({
      where: { id: groomerId },
      select: { defaultHasAssistant: true },
    });

    // Get today's route (use UTC date to match how routes are stored)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    const route = await prisma.route.findFirst({
      where: {
        accountId,
        groomerId,
        routeDate: today,
      },
    });

    // If route exists, use its setting; otherwise use groomer default
    const hasAssistant = route?.hasAssistant ?? groomer?.defaultHasAssistant ?? false;

    return NextResponse.json({
      hasAssistant,
      defaultHasAssistant: groomer?.defaultHasAssistant ?? false,
      hasRouteForToday: !!route,
    });
  } catch (error) {
    console.error("Get assistant status error:", error);
    return NextResponse.json(
      { error: "Failed to get assistant status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routes/assistant
 * Toggle assistant status for today
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const { hasAssistant, setAsDefault } = body;

    if (typeof hasAssistant !== "boolean") {
      return NextResponse.json(
        { error: "hasAssistant must be a boolean" },
        { status: 400 }
      );
    }

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 400 }
      );
    }

    // Get today's date (use UTC to match how routes are stored)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    // Update or create today's route with the assistant setting
    const route = await prisma.route.upsert({
      where: {
        groomerId_routeDate: {
          groomerId,
          routeDate: today,
        },
      },
      update: {
        hasAssistant,
      },
      create: {
        accountId,
        groomerId,
        routeDate: today,
        hasAssistant,
        status: "DRAFT",
        provider: "LOCAL",
      },
    });

    // Optionally update the groomer's default setting
    if (setAsDefault === true) {
      await prisma.groomer.update({
        where: { id: groomerId },
        data: { defaultHasAssistant: hasAssistant },
      });
    }

    return NextResponse.json({
      success: true,
      hasAssistant: route.hasAssistant,
      message: hasAssistant
        ? "Working with assistant today"
        : "Working solo today",
    });
  } catch (error) {
    console.error("Set assistant status error:", error);
    return NextResponse.json(
      { error: "Failed to set assistant status" },
      { status: 500 }
    );
  }
}
