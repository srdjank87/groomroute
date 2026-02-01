import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/admin/sync-subscriptions
 * Sync subscription statuses from Stripe for all accounts with a stripeSubscriptionId
 */
export async function POST() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { stripeSubscriptionId: { not: null } },
      select: { id: true, stripeSubscriptionId: true, subscriptionStatus: true },
    });

    const results: { id: string; before: string; after: string }[] = [];

    for (const account of accounts) {
      if (!account.stripeSubscriptionId) continue;

      try {
        const sub = await stripe.subscriptions.retrieve(account.stripeSubscriptionId);

        let status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "EXPIRED";
        if (sub.status === "trialing") status = "TRIAL";
        else if (sub.status === "active") status = "ACTIVE";
        else if (sub.status === "past_due") status = "PAST_DUE";
        else if (sub.status === "canceled") status = "CANCELED";
        else if (sub.status === "incomplete") status = "INCOMPLETE";
        else status = "EXPIRED";

        if (status !== account.subscriptionStatus) {
          await prisma.account.update({
            where: { id: account.id },
            data: { subscriptionStatus: status },
          });
          results.push({ id: account.id, before: account.subscriptionStatus, after: status });
        }
      } catch (err) {
        console.error(`Failed to sync account ${account.id}:`, err);
      }
    }

    return NextResponse.json({
      synced: results.length,
      total: accounts.length,
      changes: results,
    });
  } catch (error) {
    console.error("Sync subscriptions error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
