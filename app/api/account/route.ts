import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/account
 * Get account and user profile information
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.accountId || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const userId = session.user.id;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        name: true,
        timezone: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Get groomer working hours
    const groomer = await prisma.groomer.findFirst({
      where: { accountId, isActive: true },
      select: {
        id: true,
        workingHoursStart: true,
        workingHoursEnd: true,
      },
    });

    if (!account || !user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      account,
      user,
      groomer: groomer ? {
        workingHoursStart: groomer.workingHoursStart || "08:00",
        workingHoursEnd: groomer.workingHoursEnd || "17:00",
      } : null,
    });
  } catch (error) {
    console.error("Account API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch account info" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account
 * Update account and user profile information
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const userId = session.user.id;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update account settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { businessName, userName, timezone, workingHoursStart, workingHoursEnd } = body;

    // Update account if businessName or timezone provided
    if (businessName !== undefined || timezone !== undefined) {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          ...(businessName !== undefined && { name: businessName }),
          ...(timezone !== undefined && { timezone }),
        },
      });
    }

    // Update user if userName provided
    if (userName !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: userName },
      });
    }

    // Update groomer working hours if provided
    if (workingHoursStart !== undefined || workingHoursEnd !== undefined) {
      const groomer = await prisma.groomer.findFirst({
        where: { accountId, isActive: true },
      });

      if (groomer) {
        await prisma.groomer.update({
          where: { id: groomer.id },
          data: {
            ...(workingHoursStart !== undefined && { workingHoursStart }),
            ...(workingHoursEnd !== undefined && { workingHoursEnd }),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}
