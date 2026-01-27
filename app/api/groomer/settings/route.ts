import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserGroomerId } from "@/lib/get-user-groomer";

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

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
      return NextResponse.json(
        { error: "No groomer found" },
        { status: 404 }
      );
    }

    const groomer = await prisma.groomer.findUnique({
      where: { id: groomerId },
      select: {
        id: true,
        name: true,
        largeDogDailyLimit: true,
        dailyIntensityLimit: true,
        defaultHasAssistant: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        preferredMessaging: true,
        preferredMaps: true,
        bookingSlug: true,
        bookingEnabled: true,
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

    const body = await req.json();

    // Get the current user's groomer ID
    const groomerId = await getUserGroomerId();

    if (!groomerId) {
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

    if (body.dailyIntensityLimit !== undefined) {
      // Validate: must be a positive integer 4-24 (or null to reset to default)
      if (body.dailyIntensityLimit !== null) {
        const limit = parseInt(body.dailyIntensityLimit);
        if (isNaN(limit) || limit < 4 || limit > 24) {
          return NextResponse.json(
            { error: "Daily intensity limit must be between 4 and 24" },
            { status: 400 }
          );
        }
        updateData.dailyIntensityLimit = limit;
      } else {
        updateData.dailyIntensityLimit = 12; // Reset to default
      }
    }

    if (body.defaultHasAssistant !== undefined) {
      updateData.defaultHasAssistant = Boolean(body.defaultHasAssistant);
    }

    if (body.workingHoursStart !== undefined) {
      // Validate format HH:MM
      if (!/^\d{2}:\d{2}$/.test(body.workingHoursStart)) {
        return NextResponse.json(
          { error: "Working hours start must be in HH:MM format" },
          { status: 400 }
        );
      }
      updateData.workingHoursStart = body.workingHoursStart;
    }

    if (body.workingHoursEnd !== undefined) {
      // Validate format HH:MM
      if (!/^\d{2}:\d{2}$/.test(body.workingHoursEnd)) {
        return NextResponse.json(
          { error: "Working hours end must be in HH:MM format" },
          { status: 400 }
        );
      }
      updateData.workingHoursEnd = body.workingHoursEnd;
    }

    if (body.preferredMessaging !== undefined) {
      if (!["SMS", "WHATSAPP"].includes(body.preferredMessaging)) {
        return NextResponse.json(
          { error: "Preferred messaging must be SMS or WHATSAPP" },
          { status: 400 }
        );
      }
      updateData.preferredMessaging = body.preferredMessaging;
    }

    if (body.preferredMaps !== undefined) {
      if (!["GOOGLE", "APPLE"].includes(body.preferredMaps)) {
        return NextResponse.json(
          { error: "Preferred maps must be GOOGLE or APPLE" },
          { status: 400 }
        );
      }
      updateData.preferredMaps = body.preferredMaps;
    }

    if (body.bookingEnabled !== undefined) {
      updateData.bookingEnabled = Boolean(body.bookingEnabled);
    }

    if (body.bookingSlug !== undefined) {
      if (body.bookingSlug === null || body.bookingSlug === "") {
        updateData.bookingSlug = null;
      } else {
        // Validate slug format (lowercase, alphanumeric, hyphens only)
        const slug = body.bookingSlug.toLowerCase().trim();
        if (!/^[a-z0-9-]+$/.test(slug)) {
          return NextResponse.json(
            { error: "Booking URL can only contain letters, numbers, and hyphens" },
            { status: 400 }
          );
        }
        if (slug.length < 3 || slug.length > 50) {
          return NextResponse.json(
            { error: "Booking URL must be between 3 and 50 characters" },
            { status: 400 }
          );
        }
        // Check if slug is already taken by another groomer
        const existingGroomer = await prisma.groomer.findUnique({
          where: { bookingSlug: slug },
        });
        if (existingGroomer && existingGroomer.id !== groomerId) {
          return NextResponse.json(
            { error: "This booking URL is already taken" },
            { status: 400 }
          );
        }
        updateData.bookingSlug = slug;
      }
    }

    const updatedGroomer = await prisma.groomer.update({
      where: { id: groomerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        largeDogDailyLimit: true,
        dailyIntensityLimit: true,
        defaultHasAssistant: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        preferredMessaging: true,
        preferredMaps: true,
        bookingSlug: true,
        bookingEnabled: true,
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
