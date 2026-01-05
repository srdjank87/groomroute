import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/groomer/settings
 * Get groomer settings
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
      select: {
        id: true,
        name: true,
        largeDogDailyLimit: true,
        defaultHasAssistant: true,
        workingHoursStart: true,
        workingHoursEnd: true,
      },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ groomer });
  } catch (error) {
    console.error("Get groomer settings error:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groomer/settings
 * Update groomer settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();

    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
    });

    if (!groomer) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (body.largeDogDailyLimit !== undefined) {
      // Validate: must be null or a positive integer 1-10
      if (body.largeDogDailyLimit !== null) {
        const limit = parseInt(body.largeDogDailyLimit);
        if (isNaN(limit) || limit < 1 || limit > 10) {
          return NextResponse.json(
            { error: "Large dog limit must be between 1 and 10" },
            { status: 400 }
          );
        }
        updateData.largeDogDailyLimit = limit;
      } else {
        updateData.largeDogDailyLimit = null;
      }
    }

    if (body.defaultHasAssistant !== undefined) {
      updateData.defaultHasAssistant = Boolean(body.defaultHasAssistant);
    }

    const updatedGroomer = await prisma.groomer.update({
      where: { id: groomer.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        largeDogDailyLimit: true,
        defaultHasAssistant: true,
      },
    });

    return NextResponse.json({
      success: true,
      groomer: updatedGroomer,
    });
  } catch (error) {
    console.error("Update groomer settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
