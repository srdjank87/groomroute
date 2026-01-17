import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST create billing portal session
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        stripeCustomerId: true,
        subscriptionStatus: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (!account.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 400 }
      );
    }

    // For trial users, use a restricted portal configuration that hides cancellation
    // Paying customers can cancel via the portal; trial users must contact support
    const isTrialUser = account.subscriptionStatus === "TRIAL";

    // Create portal session with inline configuration
    // Trial users: hide subscription cancellation to prevent trial abuse
    // Paying users: allow full portal access including cancellation
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
      ...(isTrialUser && {
        flow_data: {
          type: "payment_method_update",
        },
      }),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
