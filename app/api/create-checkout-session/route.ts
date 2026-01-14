import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getStripePlans, PlanType, BillingType } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billing, resubscribe, adminSeats, groomerSeats } = body as {
      plan: PlanType;
      billing: BillingType;
      resubscribe?: boolean;
      adminSeats?: number;
      groomerSeats?: number;
    };

    // For Pro plan, validate seat counts (minimum 1 admin, 1 groomer)
    const isPro = plan.toLowerCase() === "pro";
    const adminSeatCount = isPro ? Math.max(adminSeats || 1, 1) : 0;
    const groomerSeatCount = isPro ? Math.max(groomerSeats || 1, 1) : 0;

    // Get Stripe plans at runtime to ensure env vars are loaded
    const STRIPE_PLANS = getStripePlans();

    // Validate plan and billing
    if (!STRIPE_PLANS[plan] || !STRIPE_PLANS[plan][billing]) {
      return NextResponse.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
    }

    // Get the account
    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if account already has a Stripe customer
    let customerId = account.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name!,
        metadata: {
          accountId: account.id,
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      // Update account with Stripe customer ID
      await prisma.account.update({
        where: { id: account.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Build line items based on plan type
    type LineItem = { price: string; quantity: number };
    const lineItems: LineItem[] = [];

    if (isPro) {
      // Pro plan: separate admin and groomer seat prices
      const proPricing = STRIPE_PLANS.pro[billing];
      const adminPriceId = proPricing.adminPriceId || proPricing.priceId;
      const groomerPriceId = proPricing.groomerPriceId || proPricing.priceId;

      if (!adminPriceId) {
        return NextResponse.json(
          { error: "Stripe admin price ID not configured for Pro plan" },
          { status: 500 }
        );
      }

      // Add admin seat(s)
      lineItems.push({
        price: adminPriceId,
        quantity: adminSeatCount,
      });

      // Add groomer seat(s) if groomer price is configured
      if (groomerPriceId && groomerSeatCount > 0) {
        lineItems.push({
          price: groomerPriceId,
          quantity: groomerSeatCount,
        });
      }
    } else {
      // Non-Pro plans: single price
      const priceId = STRIPE_PLANS[plan][billing].priceId;

      if (!priceId) {
        return NextResponse.json(
          { error: "Stripe price ID not configured for this plan" },
          { status: 500 }
        );
      }

      lineItems.push({
        price: priceId,
        quantity: 1,
      });
    }

    // Create Checkout Session
    // For resubscriptions, skip trial and redirect to dashboard
    const isResubscription = resubscribe || account.subscriptionStatus === "CANCELED" || account.subscriptionStatus === "PAST_DUE";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      subscription_data: {
        ...(isResubscription ? {} : { trial_period_days: 14 }),
        metadata: {
          accountId: account.id,
          plan: plan.toUpperCase(),
          billing: billing.toUpperCase(),
          ...(isPro && {
            adminSeats: adminSeatCount.toString(),
            groomerSeats: groomerSeatCount.toString(),
          }),
        },
      },
      metadata: {
        accountId: account.id,
        userId: session.user.id,
      },
      success_url: isResubscription
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?resubscribed=true`
        : `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      cancel_url: isResubscription
        ? `${process.env.NEXT_PUBLIC_APP_URL}/subscription/expired?payment=canceled`
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?payment=canceled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
