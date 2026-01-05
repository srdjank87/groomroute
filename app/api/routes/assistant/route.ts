import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get today's route
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const route = await prisma.route.findFirst({
      where: {
        accountId,
        groomerId: groomer.id,
        routeDate: today,
      },
    });

    // If route exists, use its setting; otherwise use groomer default
    const hasAssistant = route?.hasAssistant ?? groomer.defaultHasAssistant;

    return NextResponse.json({
      hasAssistant,
      defaultHasAssistant: groomer.defaultHasAssistant,
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

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update or create today's route with the assistant setting
    const route = await prisma.route.upsert({
      where: {
        groomerId_routeDate: {
          groomerId: groomer.id,
          routeDate: today,
        },
      },
      update: {
        hasAssistant,
      },
      create: {
        accountId,
        groomerId: groomer.id,
        routeDate: today,
        hasAssistant,
        status: "DRAFT",
        provider: "LOCAL",
      },
    });

    // Optionally update the groomer's default setting
    if (setAsDefault === true) {
      await prisma.groomer.update({
        where: { id: groomer.id },
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
