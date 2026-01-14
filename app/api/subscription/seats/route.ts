import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getStripePlans } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// GET - Retrieve current seat information
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        subscriptionPlan: true,
        billingCycle: true,
        stripeSubscriptionId: true,
        adminSeats: true,
        groomerSeats: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (account.subscriptionPlan !== "PRO") {
      return NextResponse.json(
        { error: "Seat management is only available for Pro plans" },
        { status: 400 }
      );
    }

    // Get current pricing
    const STRIPE_PLANS = getStripePlans();
    const billing = account.billingCycle?.toLowerCase() as "monthly" | "yearly" || "monthly";
    const proPricing = STRIPE_PLANS.pro[billing];

    return NextResponse.json({
      adminSeats: account.adminSeats,
      groomerSeats: account.groomerSeats,
      pricing: {
        additionalAdminAmount: proPricing.additionalAdminAmount / 100,
        groomerAmount: proPricing.groomerAmount / 100,
        billing: billing,
      },
    });
  } catch (error) {
    console.error("Get seats error:", error);
    return NextResponse.json({ error: "Failed to get seats" }, { status: 500 });
  }
}

// PATCH - Update seat quantities
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { adminSeats, groomerSeats } = body as {
      adminSeats?: number;
      groomerSeats?: number;
    };

    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        id: true,
        subscriptionPlan: true,
        billingCycle: true,
        stripeSubscriptionId: true,
        adminSeats: true,
        groomerSeats: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (account.subscriptionPlan !== "PRO") {
      return NextResponse.json(
        { error: "Seat management is only available for Pro plans" },
        { status: 400 }
      );
    }

    if (!account.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Validate seat counts
    const newAdminSeats = adminSeats !== undefined ? Math.max(1, adminSeats) : account.adminSeats;
    const newGroomerSeats = groomerSeats !== undefined ? Math.max(0, groomerSeats) : account.groomerSeats;

    // Get current pricing
    const STRIPE_PLANS = getStripePlans();
    const billing = account.billingCycle?.toLowerCase() as "monthly" | "yearly" || "monthly";
    const proPricing = STRIPE_PLANS.pro[billing];

    // Retrieve the current subscription
    const subscription = await stripe.subscriptions.retrieve(account.stripeSubscriptionId);

    if (!subscription || subscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription is not active" },
        { status: 400 }
      );
    }

    // Find the line item IDs for each seat type
    let basePriceItemId: string | null = null;
    let adminSeatItemId: string | null = null;
    let groomerSeatItemId: string | null = null;

    for (const item of subscription.items.data) {
      const priceId = typeof item.price === "string" ? item.price : item.price.id;

      if (priceId === proPricing.priceId) {
        basePriceItemId = item.id;
      } else if (priceId === proPricing.additionalAdminPriceId) {
        adminSeatItemId = item.id;
      } else if (priceId === proPricing.groomerPriceId) {
        groomerSeatItemId = item.id;
      }
    }

    // Calculate additional admin seats (Pro base includes 1 admin seat)
    const additionalAdminSeats = Math.max(0, newAdminSeats - 1);

    // Build the items array for subscription update
    type SubscriptionItemUpdate = {
      id?: string;
      price?: string;
      quantity?: number;
      deleted?: boolean;
    };
    const items: SubscriptionItemUpdate[] = [];

    // Handle additional admin seats
    if (additionalAdminSeats > 0) {
      if (adminSeatItemId) {
        // Update existing admin seat line item
        items.push({
          id: adminSeatItemId,
          quantity: additionalAdminSeats,
        });
      } else {
        // Add new admin seat line item
        items.push({
          price: proPricing.additionalAdminPriceId,
          quantity: additionalAdminSeats,
        });
      }
    } else if (adminSeatItemId) {
      // Remove admin seat line item if no additional seats needed
      items.push({
        id: adminSeatItemId,
        deleted: true,
      });
    }

    // Handle groomer seats
    if (newGroomerSeats > 0) {
      if (groomerSeatItemId) {
        // Update existing groomer seat line item
        items.push({
          id: groomerSeatItemId,
          quantity: newGroomerSeats,
        });
      } else {
        // Add new groomer seat line item
        items.push({
          price: proPricing.groomerPriceId,
          quantity: newGroomerSeats,
        });
      }
    } else if (groomerSeatItemId) {
      // Remove groomer seat line item if no seats needed
      items.push({
        id: groomerSeatItemId,
        deleted: true,
      });
    }

    // Update the subscription if there are changes
    if (items.length > 0) {
      await stripe.subscriptions.update(account.stripeSubscriptionId, {
        items,
        proration_behavior: "create_prorations",
        metadata: {
          ...subscription.metadata,
          additionalAdminSeats: additionalAdminSeats.toString(),
          groomerSeats: newGroomerSeats.toString(),
          totalSeats: (newAdminSeats + newGroomerSeats).toString(),
        },
      });
    }

    // Update the account with new seat counts
    await prisma.account.update({
      where: { id: account.id },
      data: {
        adminSeats: newAdminSeats,
        groomerSeats: newGroomerSeats,
      },
    });

    return NextResponse.json({
      success: true,
      adminSeats: newAdminSeats,
      groomerSeats: newGroomerSeats,
    });
  } catch (error) {
    console.error("Update seats error:", error);
    return NextResponse.json(
      { error: "Failed to update seats" },
      { status: 500 }
    );
  }
}
