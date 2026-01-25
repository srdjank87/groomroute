/**
 * Cron job to sync user activity status with Loops
 *
 * This job runs daily and:
 * 1. Sets isActive=false for users who haven't logged in for 7+ days
 *    (This triggers the re-engagement email sequence in Loops)
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/loops-sync",
 *     "schedule": "0 9 * * *"  // 9 AM UTC daily
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertLoopsContact } from "@/lib/loops";

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = {
      inactiveUsersMarked: 0,
      errors: [] as string[],
    };

    // Find users who haven't been active in 7+ days
    // and are currently marked as active (to avoid re-processing)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get accounts with users who are inactive
    const inactiveAccounts = await prisma.account.findMany({
      where: {
        lastActiveAt: {
          lt: sevenDaysAgo,
        },
        // Only process paying or trial users (not churned)
        subscriptionStatus: {
          in: ["ACTIVE", "TRIAL"],
        },
      },
      include: {
        users: {
          where: {
            role: "ADMIN", // Get the admin's email (account owner)
          },
          select: {
            email: true,
          },
        },
      },
    });

    // Update each inactive user in Loops
    for (const account of inactiveAccounts) {
      const ownerEmail = account.users[0]?.email;
      if (!ownerEmail) continue;

      try {
        await upsertLoopsContact({
          email: ownerEmail,
          isActive: false, // This triggers the re-engagement sequence
        });
        results.inactiveUsersMarked++;
      } catch (error) {
        results.errors.push(`Failed to update ${ownerEmail}: ${error}`);
      }
    }

    console.log(
      `[Loops Sync] Marked ${results.inactiveUsersMarked} users as inactive`
    );

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Loops Sync] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
