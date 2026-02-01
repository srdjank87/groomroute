import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  loopsOnSignup,
  loopsOnCheckoutCompleted,
  loopsOnTrialConverted,
  loopsOnSubscriptionCanceled,
  loopsOnResubscribed,
  loopsOnFirstCustomerAdded,
  loopsOnFirstAppointmentCreated,
  loopsOnFirstRouteOptimized,
  loopsOnPWAInstalled,
  loopsOnUserActive,
  loopsOnPaymentFailed,
  loopsOnPaymentSucceeded,
  loopsOnBookingEnabled,
  loopsOnBookingReceived,
} from "@/lib/loops";

export async function POST(req: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventName, params } = await req.json();

    switch (eventName) {
      case "loopsOnSignup":
        await loopsOnSignup(params.email, params.name, params.businessName, params.plan, params.accountId);
        break;
      case "loopsOnCheckoutCompleted":
        await loopsOnCheckoutCompleted(params.email, params.plan, params.accountId, {
          phone: params.phone || undefined,
          planPrice: params.planPrice || undefined,
          trialEndDate: params.trialEndDate ? new Date(params.trialEndDate) : undefined,
          cardLast4: params.cardLast4 || undefined,
        });
        break;
      case "loopsOnTrialConverted":
        await loopsOnTrialConverted(params.email, params.plan, params.accountId);
        break;
      case "loopsOnSubscriptionCanceled":
        await loopsOnSubscriptionCanceled(params.email, params.previousPlan, params.accountId);
        break;
      case "loopsOnResubscribed":
        await loopsOnResubscribed(params.email, params.plan, params.accountId, params.phone || undefined);
        break;
      case "loopsOnFirstCustomerAdded":
        await loopsOnFirstCustomerAdded(params.email, params.accountId);
        break;
      case "loopsOnFirstAppointmentCreated":
        await loopsOnFirstAppointmentCreated(params.email, params.accountId);
        break;
      case "loopsOnFirstRouteOptimized":
        await loopsOnFirstRouteOptimized(params.email, params.accountId, parseInt(params.stops) || 5);
        break;
      case "loopsOnPWAInstalled":
        await loopsOnPWAInstalled(params.email, params.accountId);
        break;
      case "loopsOnUserActive":
        await loopsOnUserActive(params.email, params.accountId);
        break;
      case "loopsOnPaymentFailed":
        await loopsOnPaymentFailed(params.email, params.accountId, parseFloat(params.amount) || 29);
        break;
      case "loopsOnPaymentSucceeded":
        await loopsOnPaymentSucceeded(params.email, params.accountId);
        break;
      case "loopsOnBookingEnabled":
        await loopsOnBookingEnabled(params.email, params.accountId, params.bookingSlug || undefined);
        break;
      case "loopsOnBookingReceived":
        await loopsOnBookingReceived(params.email, params.accountId, params.clientName);
        break;
      default:
        return NextResponse.json({ error: `Unknown event: ${eventName}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, eventName });
  } catch (error) {
    console.error("Loops test error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send event" },
      { status: 500 }
    );
  }
}
