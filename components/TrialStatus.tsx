"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Clock, CreditCard, CheckCircle } from "lucide-react";

export default function TrialStatus() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) return null;

  const user = session.user as any;
  const subscriptionStatus = user.subscriptionStatus;
  const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const currentPeriodEnd = user.currentPeriodEnd ? new Date(user.currentPeriodEnd) : null;

  // Don't show anything if user has an active paid subscription
  if (subscriptionStatus === "ACTIVE" && currentPeriodEnd) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Active Subscription</h3>
            <p className="text-sm text-green-700 mt-1">
              Your subscription is active until {currentPeriodEnd.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate days remaining in trial
  if (subscriptionStatus === "TRIAL" && trialEndsAt) {
    const daysRemaining = Math.ceil(
      (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only show trial message when 4 days or less remaining
    if (daysRemaining > 4) {
      return null;
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">
              {daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left in your trial`
                : "Trial ending today"}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Your trial ends on {trialEndsAt.toLocaleDateString()}. Your paid plan will start automatically on this date and your card will be charged.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show past due status
  if (subscriptionStatus === "PAST_DUE") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Payment Failed</h3>
            <p className="text-sm text-red-700 mt-1">
              Your last payment failed. Please update your payment method to avoid service interruption.
            </p>
          </div>
          <a
            href="/subscription/expired"
            className="btn btn-sm btn-error"
          >
            Update Payment
          </a>
        </div>
      </div>
    );
  }

  return null;
}
