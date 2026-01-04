/**
 * Feature Gating Helper Functions
 *
 * Use these helpers throughout the app to check feature access
 * based on the user's subscription plan.
 */

import { SubscriptionPlan } from "@prisma/client";
import { hasFeature, hasReachedLimit, getPlanLimits, getMessagingTier } from "./features";

/**
 * Example usage in API routes or server components
 */

// Check if user can access a feature
export function canAccessFeature(account: { subscriptionPlan: SubscriptionPlan }, featureName: string) {
  return hasFeature(account.subscriptionPlan, featureName as any);
}

// Check if user has reached customer limit
export async function canAddCustomer(
  account: { subscriptionPlan: SubscriptionPlan },
  currentCustomerCount: number
): Promise<{ allowed: boolean; message?: string }> {
  const limits = getPlanLimits(account.subscriptionPlan);

  if (currentCustomerCount >= limits.maxCustomers) {
    return {
      allowed: false,
      message: `You've reached your plan's limit of ${limits.maxCustomers} customers. Upgrade to Growth for unlimited customers.`,
    };
  }

  return { allowed: true };
}

// Check if user can create appointment
export async function canAddAppointment(
  account: { subscriptionPlan: SubscriptionPlan },
  currentMonthAppointments: number
): Promise<{ allowed: boolean; message?: string }> {
  const limits = getPlanLimits(account.subscriptionPlan);

  if (currentMonthAppointments >= limits.maxAppointmentsPerMonth) {
    return {
      allowed: false,
      message: `You've reached your plan's limit of ${limits.maxAppointmentsPerMonth} appointments this month. Upgrade to Growth for unlimited appointments.`,
    };
  }

  return { allowed: true };
}

// Check messaging capabilities
export function getAccountMessagingCapabilities(account: { subscriptionPlan: SubscriptionPlan }) {
  const tier = getMessagingTier(account.subscriptionPlan);
  const limits = getPlanLimits(account.subscriptionPlan);

  return {
    canSendSMS: tier !== "none",
    hasDedicatedNumber: tier === "dedicated",
    hasSharedNumber: tier === "shared",
    monthlyLimit: limits.smsMessagesPerMonth,
    hasTemplates: hasFeature(account.subscriptionPlan, "message_templates"),
    hasRunningLate: hasFeature(account.subscriptionPlan, "running_late_automation"),
    hasBulkNotifications: hasFeature(account.subscriptionPlan, "bulk_notifications"),
  };
}

// Check if user can send SMS
export async function canSendSMS(
  account: { subscriptionPlan: SubscriptionPlan },
  currentMonthSMS: number
): Promise<{ allowed: boolean; message?: string }> {
  const capabilities = getAccountMessagingCapabilities(account);

  if (!capabilities.canSendSMS) {
    return {
      allowed: false,
      message: "SMS messaging is not available on your plan.",
    };
  }

  if (currentMonthSMS >= capabilities.monthlyLimit) {
    return {
      allowed: false,
      message: `You've reached your SMS limit of ${capabilities.monthlyLimit} messages this month. Upgrade to Growth for 2,000 messages/month.`,
    };
  }

  return { allowed: true };
}

// Check Calm Control access
export function canAccessCalmControl(account: { subscriptionPlan: SubscriptionPlan }) {
  return hasFeature(account.subscriptionPlan, "calm_control_access");
}

// Check if can add multiple groomers
export function canAddGroomer(
  account: { subscriptionPlan: SubscriptionPlan },
  currentGroomerCount: number
): { allowed: boolean; message?: string } {
  const limits = getPlanLimits(account.subscriptionPlan);

  if (currentGroomerCount >= limits.maxGroomers) {
    return {
      allowed: false,
      message: "Multi-groomer support requires the Pro plan.",
    };
  }

  return { allowed: true };
}

/**
 * Middleware-style helper to enforce feature access
 */
export function requireFeature(plan: SubscriptionPlan, feature: string) {
  if (!hasFeature(plan, feature as any)) {
    throw new Error(`Feature "${feature}" requires plan upgrade`);
  }
}

/**
 * Get upgrade suggestion based on blocked feature
 */
export function getUpgradeSuggestion(
  currentPlan: SubscriptionPlan,
  blockedFeature: string
): { suggestedPlan: SubscriptionPlan; message: string } {
  // If blocked from multi-groomer, suggest PRO
  if (
    blockedFeature === "multi_groomer" ||
    blockedFeature === "team_calendar" ||
    blockedFeature === "groomer_performance_analytics"
  ) {
    return {
      suggestedPlan: SubscriptionPlan.PRO,
      message: "Upgrade to Pro to add multiple groomers and access team features.",
    };
  }

  // If blocked from automation features, suggest GROWTH
  if (
    blockedFeature === "running_late_automation" ||
    blockedFeature === "dedicated_sms_number" ||
    blockedFeature === "workload_intelligence" ||
    blockedFeature === "cancellation_gap_fill" ||
    blockedFeature === "calm_control_access"
  ) {
    return {
      suggestedPlan: SubscriptionPlan.GROWTH,
      message: "Upgrade to Growth to unlock automation and advanced features.",
    };
  }

  // Default to GROWTH for most features
  return {
    suggestedPlan: SubscriptionPlan.GROWTH,
    message: "Upgrade to unlock this feature.",
  };
}
