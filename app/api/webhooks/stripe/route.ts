import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { fbCapiStartTrial, fbCapiSubscribe } from "@/lib/facebook-capi";
import { trackTrialConverted, trackServerEvent } from "@/lib/posthog-server";
import { onboardNewUser } from "@/lib/email";
import { logAdminEvent } from "@/lib/admin-events";
import {
  loopsOnCheckoutCompleted,
  loopsOnTrialConverted,
  loopsOnSubscriptionCanceled,
  loopsOnResubscribed,
  loopsOnPaymentFailed,
  loopsOnPaymentSucceeded,
} from "@/lib/loops";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not defined");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const accountId = session.metadata?.accountId;
  const subscriptionId = session.subscription as string;

  if (!accountId || !subscriptionId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Extract the period end date with type assertion
  const currentPeriodEnd = (subscription as any).current_period_end;
  const periodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000)
    : null;

  // Calculate trial end date (14 days from now)
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // Extract seat counts from subscription metadata (for Pro plan)
  const additionalAdminSeats = parseInt(subscription.metadata?.additionalAdminSeats || "0", 10);
  const groomerSeats = parseInt(subscription.metadata?.groomerSeats || "0", 10);
  // Pro plan includes 1 admin seat in base price
  const totalAdminSeats = subscription.metadata?.plan === "PRO" ? 1 + additionalAdminSeats : 1;

  // Get account details for tracking (check if returning customer)
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      users: {
        take: 1,
        select: { email: true, name: true },
      },
    },
  });

  // Check if this is a resubscription (previously canceled)
  const isResubscription = account?.subscriptionStatus === "CANCELED";

  // Extract phone number from checkout session for SMS marketing
  const customerPhone = session.customer_details?.phone || undefined;

  await prisma.account.update({
    where: { id: accountId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "TRIAL",
      currentPeriodEnd: periodEnd,
      trialEndsAt: trialEndsAt,
      // Update seat counts for Pro plan
      adminSeats: totalAdminSeats,
      groomerSeats: groomerSeats,
      // Store phone for SMS marketing
      ...(customerPhone && { phone: customerPhone }),
    },
  });

  // Track StartTrial event for Facebook CAPI
  if (account) {
    const user = account.users[0];

    // Get stored FB tracking data for better event match quality
    const fbData = account.fbTrackingData as {
      fbc?: string | null;
      fbp?: string | null;
      userAgent?: string | null;
      clientIp?: string | null;
    } | null;

    await fbCapiStartTrial(
      {
        email: user?.email,
        firstName: user?.name?.split(" ")[0],
        lastName: user?.name?.split(" ").slice(1).join(" "),
        fbClickId: fbData?.fbc,
        fbBrowserId: fbData?.fbp,
        clientUserAgent: fbData?.userAgent,
        clientIpAddress: fbData?.clientIp,
        externalId: accountId,
      },
      undefined,
      process.env.NEXT_PUBLIC_APP_URL
    );

    // Track in PostHog
    await trackServerEvent(accountId, "trial_started", {
      plan: session.metadata?.plan || "unknown",
    });

    // Send welcome email and add to marketing list
    if (user?.email) {
      const planName = session.metadata?.plan || account.subscriptionPlan || "Growth";
      const planDisplayName = planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
      await onboardNewUser(user.email, user.name || "there", planDisplayName, 14);

      // Notify Loops that checkout completed (exits abandoned checkout sequence)
      // If resubscription, also exits winback sequence
      // Include phone number for SMS marketing
      if (isResubscription) {
        loopsOnResubscribed(
          user.email,
          planName,
          accountId,
          customerPhone
        ).catch((err) => console.error("Loops resubscription event failed:", err));
      } else {
        loopsOnCheckoutCompleted(
          user.email,
          planName,
          accountId,
          customerPhone
        ).catch((err) => console.error("Loops checkout event failed:", err));
      }
    }

    // Log admin event for subscription start
    await logAdminEvent({
      type: "subscription_started",
      accountId,
      accountName: account.name,
      userId: account.users[0]?.email ? undefined : undefined,
      userEmail: account.users[0]?.email,
      description: `Trial started for "${account.name}" on ${session.metadata?.plan || "Growth"} plan`,
      metadata: {
        plan: session.metadata?.plan,
        billing: session.metadata?.billing,
        trialEndsAt: trialEndsAt.toISOString(),
      },
    });
  }

  logger.webhook("checkout.session.completed", `Checkout completed for account ${accountId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const accountId = subscription.metadata?.accountId;

  if (!accountId) {
    console.error("Missing accountId in subscription metadata");
    return;
  }

  const plan = subscription.metadata?.plan as "STARTER" | "GROWTH" | "PRO" | undefined;
  const billing = subscription.metadata?.billing as "MONTHLY" | "YEARLY" | undefined;

  // Determine subscription status
  let status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" = "ACTIVE";

  if (subscription.status === "trialing") {
    status = "TRIAL";
  } else if (subscription.status === "active") {
    status = "ACTIVE";
  } else if (subscription.status === "past_due") {
    status = "PAST_DUE";
  } else if (subscription.status === "canceled") {
    status = "CANCELED";
  } else if (subscription.status === "incomplete") {
    status = "INCOMPLETE";
  }

  // Extract the period end date with type assertion
  const currentPeriodEnd = (subscription as any).current_period_end;
  const periodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000)
    : null;

  // Extract seat counts from subscription metadata (for Pro plan)
  const additionalAdminSeats = parseInt(subscription.metadata?.additionalAdminSeats || "0", 10);
  const groomerSeats = parseInt(subscription.metadata?.groomerSeats || "0", 10);
  // Pro plan includes 1 admin seat in base price
  const totalAdminSeats = plan === "PRO" ? 1 + additionalAdminSeats : 1;

  await prisma.account.update({
    where: { id: accountId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: status,
      subscriptionPlan: plan,
      billingCycle: billing,
      currentPeriodEnd: periodEnd,
      // Sync seat counts for Pro plan
      adminSeats: totalAdminSeats,
      groomerSeats: groomerSeats,
    },
  });

  logger.webhook("customer.subscription.updated", `Subscription updated for account ${accountId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const accountId = subscription.metadata?.accountId;

  if (!accountId) {
    console.error("Missing accountId in subscription metadata");
    return;
  }

  // Get account details before updating
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      users: {
        take: 1,
        select: { email: true },
      },
    },
  });

  await prisma.account.update({
    where: { id: accountId },
    data: {
      subscriptionStatus: "CANCELED",
    },
  });

  // Log admin event for subscription cancellation
  if (account) {
    await logAdminEvent({
      type: "subscription_canceled",
      accountId,
      accountName: account.name,
      userEmail: account.users[0]?.email,
      description: `Subscription canceled for "${account.name}"`,
      metadata: {
        previousPlan: account.subscriptionPlan,
      },
    });

    // Notify Loops for winback sequence (60-day delay configured in Loops)
    if (account.users[0]?.email) {
      loopsOnSubscriptionCanceled(
        account.users[0].email,
        account.subscriptionPlan,
        accountId
      ).catch((err) => console.error("Loops cancellation event failed:", err));
    }
  }

  logger.webhook("customer.subscription.deleted", `Subscription canceled for account ${accountId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const accountId = subscription.metadata?.accountId;

  if (!accountId) {
    return;
  }

  // Get current account to check if this is first payment (trial conversion)
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      users: {
        take: 1,
        select: { email: true, name: true },
      },
    },
  });

  const wasInTrial = account?.subscriptionStatus === "TRIAL";
  const wasPastDue = account?.subscriptionStatus === "PAST_DUE";

  // Extract the period end date with type assertion
  const currentPeriodEnd = (subscription as any).current_period_end;
  const periodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000)
    : null;

  // Update to ACTIVE if payment succeeded after trial
  await prisma.account.update({
    where: { id: accountId },
    data: {
      subscriptionStatus: "ACTIVE",
      currentPeriodEnd: periodEnd,
    },
  });

  // Track Subscribe event if this is first payment (trial conversion)
  if (wasInTrial && account) {
    const user = account.users[0];
    const plan = subscription.metadata?.plan || account.subscriptionPlan;
    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0; // Convert from cents

    // Get stored FB tracking data for better event match quality
    const fbData = account.fbTrackingData as {
      fbc?: string | null;
      fbp?: string | null;
      userAgent?: string | null;
      clientIp?: string | null;
    } | null;

    // Facebook CAPI Subscribe event
    await fbCapiSubscribe(
      {
        email: user?.email,
        firstName: user?.name?.split(" ")[0],
        lastName: user?.name?.split(" ").slice(1).join(" "),
        fbClickId: fbData?.fbc,
        fbBrowserId: fbData?.fbp,
        clientUserAgent: fbData?.userAgent,
        clientIpAddress: fbData?.clientIp,
        externalId: accountId,
      },
      amount,
      plan || "subscription",
      undefined,
      process.env.NEXT_PUBLIC_APP_URL
    );

    // PostHog trial_converted event
    const daysInTrial = account.trialEndsAt && account.createdAt
      ? Math.floor((new Date().getTime() - account.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 14;

    await trackTrialConverted(accountId, {
      plan: plan || "unknown",
      daysInTrial,
    });

    // Log admin event for trial conversion
    await logAdminEvent({
      type: "payment_succeeded",
      accountId,
      accountName: account.name,
      userEmail: user?.email,
      description: `Trial converted to paid for "${account.name}" - $${amount}`,
      metadata: {
        plan,
        amount,
        daysInTrial,
        isTrialConversion: true,
      },
    });

    // Notify Loops of trial conversion
    if (user?.email) {
      loopsOnTrialConverted(
        user.email,
        plan || "unknown",
        accountId
      ).catch((err) => console.error("Loops trial converted event failed:", err));
    }
  } else if (account) {
    // Renewal payment
    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
    await logAdminEvent({
      type: "subscription_renewed",
      accountId,
      accountName: account.name,
      userEmail: account.users[0]?.email,
      description: `Subscription renewed for "${account.name}" - $${amount}`,
      metadata: {
        plan: subscription.metadata?.plan || account.subscriptionPlan,
        amount,
      },
    });

    // If recovering from failed payment, notify Loops to exit payment recovery sequence
    if (wasPastDue && account.users[0]?.email) {
      loopsOnPaymentSucceeded(account.users[0].email, accountId).catch((err) =>
        console.error("Loops payment_succeeded event failed:", err)
      );
    }
  }

  logger.webhook("invoice.payment_succeeded", `Invoice payment succeeded for account ${accountId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const accountId = subscription.metadata?.accountId;

  if (!accountId) {
    return;
  }

  // Get account details
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      users: {
        take: 1,
        select: { email: true },
      },
    },
  });

  await prisma.account.update({
    where: { id: accountId },
    data: {
      subscriptionStatus: "PAST_DUE",
    },
  });

  // Log admin event for payment failure
  if (account) {
    const amount = invoice.amount_due ? invoice.amount_due / 100 : 0;
    await logAdminEvent({
      type: "payment_failed",
      accountId,
      accountName: account.name,
      userEmail: account.users[0]?.email,
      description: `Payment failed for "${account.name}" - $${amount}`,
      metadata: {
        plan: account.subscriptionPlan,
        amount,
      },
    });

    // Notify Loops to trigger payment recovery sequence
    if (account.users[0]?.email) {
      loopsOnPaymentFailed(account.users[0].email, accountId, amount).catch((err) =>
        console.error("Loops payment_failed event failed:", err)
      );
    }
  }

  logger.webhook("invoice.payment_failed", `Invoice payment failed for account ${accountId}`);
}
