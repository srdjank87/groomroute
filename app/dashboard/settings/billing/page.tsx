"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Calendar, ExternalLink, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Subscription {
  subscriptionPlan: "TRIAL" | "STARTER" | "GROWTH" | "PRO";
  billingCycle: "MONTHLY" | "YEARLY";
  subscriptionStatus: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "EXPIRED";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

const planInfo = {
  TRIAL: { name: "Free Trial", price: "Free", color: "text-blue-600", bg: "bg-blue-100" },
  STARTER: { name: "Starter", price: "$39/mo", color: "text-emerald-600", bg: "bg-emerald-100" },
  GROWTH: { name: "Growth", price: "$79/mo", color: "text-purple-600", bg: "bg-purple-100" },
  PRO: { name: "Pro", price: "$149/mo", color: "text-amber-600", bg: "bg-amber-100" },
};

const statusInfo = {
  TRIAL: { label: "Trial", color: "text-blue-600", bg: "bg-blue-100", icon: Clock },
  ACTIVE: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle },
  PAST_DUE: { label: "Past Due", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle },
  CANCELED: { label: "Canceled", color: "text-gray-600", bg: "bg-gray-100", icon: AlertTriangle },
  INCOMPLETE: { label: "Incomplete", color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
  EXPIRED: { label: "Expired", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle },
};

export default function BillingSettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const response = await fetch("/api/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      toast.error("Failed to load subscription info");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleManageBilling() {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getDaysRemaining(dateString: string | null) {
    if (!dateString) return null;
    const endDate = new Date(dateString);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  const plan = subscription ? planInfo[subscription.subscriptionPlan] : null;
  const status = subscription ? statusInfo[subscription.subscriptionStatus] : null;
  const StatusIcon = status?.icon || CheckCircle;

  const trialDaysRemaining = subscription?.subscriptionStatus === "TRIAL" && subscription.trialEndsAt
    ? getDaysRemaining(subscription.trialEndsAt)
    : null;

  const periodEndDays = subscription?.currentPeriodEnd
    ? getDaysRemaining(subscription.currentPeriodEnd)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
            <p className="text-gray-600">
              Manage your subscription and payment methods
            </p>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Current Plan</h2>
            <p className="text-sm text-gray-500">Your current subscription details</p>
          </div>
          {status && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Plan Name */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Plan</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${plan?.bg} ${plan?.color}`}>
                {plan?.name}
              </span>
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Billing Cycle</p>
            <p className="font-medium text-gray-900">
              {subscription?.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}
            </p>
          </div>

          {/* Trial/Period End */}
          {subscription?.subscriptionStatus === "TRIAL" && subscription.trialEndsAt ? (
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-1">Trial Ends</p>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {formatDate(subscription.trialEndsAt)}
                </span>
                {trialDaysRemaining !== null && trialDaysRemaining > 0 && (
                  <span className="text-sm text-blue-600">
                    ({trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} remaining)
                  </span>
                )}
                {trialDaysRemaining !== null && trialDaysRemaining <= 0 && (
                  <span className="text-sm text-red-600">(Expired)</span>
                )}
              </div>
            </div>
          ) : subscription?.currentPeriodEnd && subscription.subscriptionStatus === "ACTIVE" ? (
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-1">Next Billing Date</p>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
                {periodEndDays !== null && periodEndDays > 0 && (
                  <span className="text-sm text-gray-500">
                    (in {periodEndDays} day{periodEndDays !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Warning for past due / canceled */}
        {subscription?.subscriptionStatus === "PAST_DUE" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Payment Failed</p>
                <p className="text-sm text-red-700 mt-1">
                  Your last payment was unsuccessful. Please update your payment method to continue using GroomRoute.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription?.subscriptionStatus === "CANCELED" && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Subscription Canceled</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your subscription has been canceled. You can reactivate it at any time to continue using GroomRoute.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trial upgrade prompt */}
        {subscription?.subscriptionStatus === "TRIAL" && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">You&apos;re on a Free Trial</p>
                <p className="text-sm text-blue-700 mt-1">
                  Upgrade to a paid plan anytime to unlock all features and ensure uninterrupted service.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manage Billing */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Manage Billing</h2>
        <p className="text-sm text-gray-500 mb-4">
          Update payment method, view invoices, or change your plan through the billing portal.
        </p>

        {subscription?.stripeCustomerId ? (
          <button
            onClick={handleManageBilling}
            disabled={isPortalLoading}
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-6"
          >
            {isPortalLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Open Billing Portal
          </button>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              You don&apos;t have a payment method on file yet. Subscribe to a plan to access billing management.
            </p>
            <Link
              href="/subscription/expired"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-6"
            >
              <CreditCard className="h-4 w-4" />
              Subscribe Now
            </Link>
          </div>
        )}
      </div>

      {/* Change Plan */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Change Plan</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upgrade or downgrade your subscription anytime. Changes take effect immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Starter Plan */}
          <div className={`p-4 rounded-lg border-2 ${
            subscription?.subscriptionPlan === "STARTER"
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:border-emerald-300"
          }`}>
            <h3 className="font-semibold text-emerald-600 mb-1">Starter</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">$39<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <p className="text-xs text-gray-500 mb-3">Up to 50 clients</p>
            {subscription?.subscriptionPlan === "STARTER" ? (
              <span className="text-xs text-emerald-600 font-medium">Current Plan</span>
            ) : subscription?.stripeCustomerId ? (
              <button
                onClick={handleManageBilling}
                disabled={isPortalLoading}
                className="btn btn-sm w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              >
                {subscription?.subscriptionPlan === "GROWTH" || subscription?.subscriptionPlan === "PRO" ? "Downgrade" : "Select"}
              </button>
            ) : (
              <Link href="/auth/signup?plan=starter" className="btn btn-sm w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                Select
              </Link>
            )}
          </div>

          {/* Growth Plan */}
          <div className={`p-4 rounded-lg border-2 ${
            subscription?.subscriptionPlan === "GROWTH"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-purple-600">Growth</h3>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Popular</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">$79<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <p className="text-xs text-gray-500 mb-3">Unlimited clients + Calm Center</p>
            {subscription?.subscriptionPlan === "GROWTH" ? (
              <span className="text-xs text-purple-600 font-medium">Current Plan</span>
            ) : subscription?.stripeCustomerId ? (
              <button
                onClick={handleManageBilling}
                disabled={isPortalLoading}
                className="btn btn-sm w-full bg-purple-600 hover:bg-purple-700 text-white border-0"
              >
                {subscription?.subscriptionPlan === "PRO" ? "Downgrade" : "Upgrade"}
              </button>
            ) : (
              <Link href="/auth/signup?plan=growth" className="btn btn-sm w-full bg-purple-600 hover:bg-purple-700 text-white border-0">
                Select
              </Link>
            )}
          </div>

          {/* Pro Plan */}
          <div className={`p-4 rounded-lg border-2 ${
            subscription?.subscriptionPlan === "PRO"
              ? "border-amber-500 bg-amber-50"
              : "border-gray-200 hover:border-amber-300"
          }`}>
            <h3 className="font-semibold text-amber-600 mb-1">Pro</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">$149<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <p className="text-xs text-gray-500 mb-3">Team features + Analytics</p>
            {subscription?.subscriptionPlan === "PRO" ? (
              <span className="text-xs text-amber-600 font-medium">Current Plan</span>
            ) : subscription?.stripeCustomerId ? (
              <button
                onClick={handleManageBilling}
                disabled={isPortalLoading}
                className="btn btn-sm w-full bg-amber-600 hover:bg-amber-700 text-white border-0"
              >
                Upgrade
              </button>
            ) : (
              <Link href="/auth/signup?plan=pro" className="btn btn-sm w-full bg-amber-600 hover:bg-amber-700 text-white border-0">
                Select
              </Link>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Save 17% with annual billing. Plan changes are prorated automatically.
        </p>
      </div>
    </div>
  );
}
