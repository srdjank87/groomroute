import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, STRIPE_PLANS, PlanType, BillingType } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billing } = body as { plan: PlanType; billing: BillingType };

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

    const priceId = STRIPE_PLANS[plan][billing].priceId;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID not configured for this plan" },
        { status: 500 }
      );
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          accountId: account.id,
          plan: plan.toUpperCase(),
          billing: billing.toUpperCase(),
        },
      },
      metadata: {
        accountId: account.id,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?payment=canceled`,
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
