import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { logAdminEvent } from "@/lib/admin-events";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = await request.json();

    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: {
        stripeSubscriptionId: true,
        currentPeriodEnd: true,
        subscriptionPlan: true,
        name: true,
      },
    });

    if (!account?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(account.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Mark the interview as resulting in cancellation
    if (interviewId) {
      await prisma.cancellationInterview.update({
        where: { id: interviewId },
        data: { canceledAt: new Date() },
      });
    }

    await logAdminEvent({
      type: "cancellation_requested",
      accountId: session.user.accountId,
      accountName: account.name,
      userEmail: session.user.email,
      description: `Cancellation requested for "${account.name}" (active until ${account.currentPeriodEnd?.toLocaleDateString()})`,
      metadata: {
        plan: account.subscriptionPlan,
        interviewId,
      },
    });

    return NextResponse.json({
      success: true,
      activeUntil: account.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Cancel confirm error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
