import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPWAInstallReminderEmail } from "@/lib/email";

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === "development";
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find users who:
    // 1. Signed up more than 5 days ago
    // 2. Haven't installed the PWA
    // 3. Have an active subscription (not expired/canceled)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    // Get accounts that need reminders
    // Only get accounts created between 5-6 days ago to send once
    const accounts = await prisma.account.findMany({
      where: {
        createdAt: {
          gte: sixDaysAgo,
          lte: fiveDaysAgo,
        },
        pwaInstalledAt: null,
        subscriptionStatus: {
          in: ["TRIAL", "ACTIVE"],
        },
      },
      include: {
        users: {
          where: {
            role: "ADMIN", // Only email account admins
          },
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const account of accounts) {
      for (const user of account.users) {
        if (!user.email) continue;

        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(account.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        try {
          const result = await sendPWAInstallReminderEmail(
            user.email,
            user.name || "there",
            daysSinceSignup
          );

          if (result) {
            emailsSent++;
            console.log(`PWA reminder sent to: ${user.email}`);
          }
        } catch (error) {
          const errorMessage = `Failed to send to ${user.email}: ${error}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      }
    }

    return NextResponse.json({
      success: true,
      accountsFound: accounts.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("PWA reminders cron error:", error);
    return NextResponse.json(
      { error: "Failed to process PWA reminders" },
      { status: 500 }
    );
  }
}
