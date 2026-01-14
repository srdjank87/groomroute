/**
 * Feature Gating Helper Functions
 *
 * Use these helpers throughout the app to check feature access
 * based on the user's subscription plan.
 */

import { SubscriptionPlan, UserRole } from "@prisma/client";
import { hasFeature, hasReachedLimit, getPlanLimits, getMessagingTier } from "./features";

/**
 * Role-Based Access Control for Pro Plan Seat Types
 *
 * Admin seats have full access to all features.
 * Groomer seats have limited access to:
 * - Their own daily schedule and route
 * - Calm Control Center
 * - Customer/pet details for their appointments
 * - Basic appointment actions (complete, skip, running late)
 *
 * Groomer seats do NOT have access to:
 * - Analytics/revenue reports
 * - Team management
 * - Billing/subscription management
 * - Creating/editing other groomers
 * - All customer management (create, edit, delete)
 * - All appointment scheduling (create, edit appointments)
 * - Settings pages (except their own profile)
 */

// Features restricted to Admin role only
const ADMIN_ONLY_FEATURES = [
  "analytics",
  "revenue_reports",
  "team_management",
  "billing",
  "subscription",
  "groomer_management",
  "customer_management",
  "appointment_scheduling",
  "service_areas",
  "message_templates",
  "settings",
] as const;

type AdminOnlyFeature = typeof ADMIN_ONLY_FEATURES[number];

/**
 * Check if user's role allows access to a specific feature
 */
export function canAccessByRole(
  user: { role: UserRole },
  feature: AdminOnlyFeature
): boolean {
  // Admin role has full access
  if (user.role === "ADMIN") {
    return true;
  }

  // Groomer role is restricted from admin-only features
  if (user.role === "GROOMER") {
    return !ADMIN_ONLY_FEATURES.includes(feature);
  }

  // Viewer role (if used) would have even more restrictions
  return false;
}

/**
 * Check if user can access analytics pages
 */
export function canAccessAnalytics(user: { role: UserRole }): boolean {
  return canAccessByRole(user, "analytics");
}

/**
 * Check if user can manage customers (create, edit, delete)
 */
export function canManageCustomers(user: { role: UserRole }): boolean {
  return canAccessByRole(user, "customer_management");
}

/**
 * Check if user can schedule appointments (create, edit, delete)
 */
export function canScheduleAppointments(user: { role: UserRole }): boolean {
  return canAccessByRole(user, "appointment_scheduling");
}

/**
 * Check if user can access billing/subscription management
 */
export function canAccessBilling(user: { role: UserRole }): boolean {
  return canAccessByRole(user, "billing");
}

/**
 * Check if user can manage groomers (add, edit, remove team members)
 */
export function canManageGroomers(user: { role: UserRole }): boolean {
  return canAccessByRole(user, "groomer_management");
}

/**
 * Check if user can access settings (except own profile)
 */
export function canAccessSettings(user: { role: UserRole }): boolean {
  return canAccessByRole(user, "settings");
}

/**
 * Get list of features available to a user based on their role
 */
export function getRoleBasedFeatures(user: { role: UserRole }): {
  canViewOwnSchedule: boolean;
  canViewOwnRoute: boolean;
  canAccessCalmCenter: boolean;
  canCompleteAppointments: boolean;
  canSkipAppointments: boolean;
  canSendRunningLate: boolean;
  canViewCustomerDetails: boolean;
  canCreateCustomers: boolean;
  canEditCustomers: boolean;
  canCreateAppointments: boolean;
  canEditAppointments: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
  canAccessBilling: boolean;
  canAccessSettings: boolean;
} {
  const isAdmin = user.role === "ADMIN";

  return {
    // Everyone can do these
    canViewOwnSchedule: true,
    canViewOwnRoute: true,
    canAccessCalmCenter: true,
    canCompleteAppointments: true,
    canSkipAppointments: true,
    canSendRunningLate: true,
    canViewCustomerDetails: true,

    // Admin only
    canCreateCustomers: isAdmin,
    canEditCustomers: isAdmin,
    canCreateAppointments: isAdmin,
    canEditAppointments: isAdmin,
    canViewAnalytics: isAdmin,
    canManageTeam: isAdmin,
    canAccessBilling: isAdmin,
    canAccessSettings: isAdmin,
  };
}

/**
 * Check if user role is allowed to perform admin-only actions
 * Use this in API routes to enforce role-based access
 */
export function isAdminRole(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}

/**
 * Returns an error response if user is not an admin
 * Use this in API routes for quick role enforcement
 */
export function requireAdminRole(role: UserRole | undefined): { error: string; status: 403 } | null {
  if (role !== "ADMIN") {
    return {
      error: "This action requires admin access",
      status: 403,
    };
  }
  return null;
}

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
