import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getStripePlans, PlanType, BillingType } from "@/lib/stripe";
import { z } from "zod";

const changePlanSchema = z.object({
  plan: z.enum(["starter", "growth", "pro"]),
  billing: z.enum(["monthly", "yearly"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billing } = changePlanSchema.parse(body);

    // Get the account with subscription info
    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionPlan: true,
        billingCycle: true,
        subscriptionStatus: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (!account.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Use existing billing cycle if not specified
    const targetBilling = billing || (account.billingCycle?.toLowerCase() as BillingType) || "monthly";
    const targetPlan = plan as PlanType;

    // Check if it's the same plan and billing
    if (
      account.subscriptionPlan === targetPlan.toUpperCase() &&
      account.billingCycle === targetBilling.toUpperCase()
    ) {
      return NextResponse.json(
        { error: "You are already on this plan" },
        { status: 400 }
      );
    }

    // Get the new price ID
    const STRIPE_PLANS = getStripePlans();
    const newPriceId = STRIPE_PLANS[targetPlan][targetBilling].priceId;

    if (!newPriceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan" },
        { status: 500 }
      );
    }

    // Retrieve the current subscription
    const subscription = await stripe.subscriptions.retrieve(
      account.stripeSubscriptionId
    );

    if (!subscription || subscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription not found or canceled" },
        { status: 400 }
      );
    }

    // Get the current subscription item (main plan)
    // Filter to only the base plan item (not addon seats)
    const subscriptionItem = subscription.items.data.find((item) => {
      // The main plan item - check if it's one of our base plan prices
      const starterMonthly = STRIPE_PLANS.starter.monthly.priceId;
      const starterYearly = STRIPE_PLANS.starter.yearly.priceId;
      const growthMonthly = STRIPE_PLANS.growth.monthly.priceId;
      const growthYearly = STRIPE_PLANS.growth.yearly.priceId;
      const proMonthly = STRIPE_PLANS.pro.monthly.priceId;
      const proYearly = STRIPE_PLANS.pro.yearly.priceId;

      const basePrices = [
        starterMonthly,
        starterYearly,
        growthMonthly,
        growthYearly,
        proMonthly,
        proYearly,
      ].filter(Boolean);

      return basePrices.includes(item.price.id);
    });

    if (!subscriptionItem) {
      // If we can't find the base plan item, just use the first item
      // This handles edge cases where plan configuration changed
      const firstItem = subscription.items.data[0];
      if (!firstItem) {
        return NextResponse.json(
          { error: "No subscription items found" },
          { status: 400 }
        );
      }
    }

    const itemToUpdate = subscriptionItem || subscription.items.data[0];

    // Update the subscription with the new price
    // Stripe handles proration automatically
    const updatedSubscription = await stripe.subscriptions.update(
      account.stripeSubscriptionId,
      {
        items: [
          {
            id: itemToUpdate.id,
            price: newPriceId,
          },
        ],
        metadata: {
          ...subscription.metadata,
          plan: targetPlan.toUpperCase(),
          billing: targetBilling.toUpperCase(),
        },
        proration_behavior: "create_prorations",
      }
    );

    // Update our database
    await prisma.account.update({
      where: { id: account.id },
      data: {
        subscriptionPlan: targetPlan.toUpperCase() as "STARTER" | "GROWTH" | "PRO",
        billingCycle: targetBilling.toUpperCase() as "MONTHLY" | "YEARLY",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully changed to ${targetPlan} plan`,
      subscription: {
        plan: targetPlan.toUpperCase(),
        billing: targetBilling.toUpperCase(),
        status: updatedSubscription.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Change plan error:", error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
