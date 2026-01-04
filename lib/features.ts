/**
 * Feature Gating System for GroomRoute
 *
 * This module defines which features are available for each subscription tier
 * and provides utility functions to check feature access.
 */

import { SubscriptionPlan } from "@prisma/client";

export type Feature =
  // Core Routing & Navigation
  | "route_optimization"
  | "one_tap_navigation"
  | "area_days"
  | "skip_stop"

  // Customer & Appointment Management
  | "unlimited_customers"
  | "unlimited_appointments"
  | "calendar_import"
  | "calendar_two_way_sync"
  | "appointment_conflict_detection"

  // Workload Intelligence
  | "dog_size_tracking"
  | "energy_cost_ratings"
  | "danger_day_warnings"
  | "assistant_mode"
  | "workload_distribution"

  // Communication & Messaging
  | "sms_messaging"
  | "shared_sms_number"
  | "dedicated_sms_number"
  | "email_messaging"
  | "message_templates"
  | "running_late_automation"
  | "bulk_notifications"
  | "calm_inbox"
  | "auto_reply_classification"

  // Calm Control Center
  | "calm_control_access"
  | "rescue_my_day"
  | "smart_skip_stop"
  | "day_triage"

  // Revenue Protection
  | "cancellation_gap_fill"
  | "waitlist_management"
  | "revenue_tracking"

  // Analytics & Reporting
  | "basic_analytics"
  | "advanced_analytics"
  | "end_of_day_summary"
  | "roi_calculator"
  | "time_savings_tracking"

  // Team & Scale Features
  | "multi_groomer"
  | "team_calendar"
  | "groomer_performance_analytics"
  | "equipment_logging"

  // Support
  | "email_support"
  | "priority_support"
  | "phone_support"
  | "dedicated_account_manager";

/**
 * Feature matrix defining which features are available for each plan
 */
const FEATURE_MATRIX: Record<SubscriptionPlan, Set<Feature>> = {
  TRIAL: new Set([
    // Core features (same as STARTER for trial period)
    "route_optimization",
    "one_tap_navigation",
    "skip_stop",
    "appointment_conflict_detection",
    "calendar_import",

    // Limited messaging (shared number)
    "sms_messaging",
    "shared_sms_number",
    "email_messaging",
    "calm_inbox",
    "auto_reply_classification",

    // Basic support
    "email_support",
  ]),

  STARTER: new Set([
    // Core Routing & Navigation
    "route_optimization",
    "one_tap_navigation",
    "skip_stop",

    // Customer & Appointment Management (LIMITED)
    "appointment_conflict_detection",
    "calendar_import",
    // NOT INCLUDED: unlimited_customers, unlimited_appointments, calendar_two_way_sync

    // Communication (SHARED NUMBER ONLY)
    "sms_messaging",
    "shared_sms_number",
    "email_messaging",
    "calm_inbox",
    "auto_reply_classification",

    // Basic Analytics
    "basic_analytics",

    // Support
    "email_support",
  ]),

  GROWTH: new Set([
    // Everything from STARTER
    "route_optimization",
    "one_tap_navigation",
    "area_days",
    "skip_stop",

    // UNLIMITED Customer & Appointment Management
    "unlimited_customers",
    "unlimited_appointments",
    "calendar_import",
    "calendar_two_way_sync",
    "appointment_conflict_detection",

    // FULL Workload Intelligence
    "dog_size_tracking",
    "energy_cost_ratings",
    "danger_day_warnings",
    "assistant_mode",
    "workload_distribution",

    // DEDICATED Communication
    "sms_messaging",
    "dedicated_sms_number", // Key upgrade from STARTER
    "email_messaging",
    "message_templates",
    "running_late_automation",
    "bulk_notifications",
    "calm_inbox",
    "auto_reply_classification",

    // FULL Calm Control
    "calm_control_access",
    "rescue_my_day",
    "smart_skip_stop",
    "day_triage",

    // Revenue Protection
    "cancellation_gap_fill",
    "waitlist_management",
    "revenue_tracking",

    // Advanced Analytics
    "advanced_analytics",
    "end_of_day_summary",
    "roi_calculator",
    "time_savings_tracking",

    // Support
    "email_support",
    "priority_support",
  ]),

  PRO: new Set([
    // Everything from GROWTH
    "route_optimization",
    "one_tap_navigation",
    "area_days",
    "skip_stop",

    "unlimited_customers",
    "unlimited_appointments",
    "calendar_import",
    "calendar_two_way_sync",
    "appointment_conflict_detection",

    "dog_size_tracking",
    "energy_cost_ratings",
    "danger_day_warnings",
    "assistant_mode",
    "workload_distribution",

    "sms_messaging",
    "dedicated_sms_number",
    "email_messaging",
    "message_templates",
    "running_late_automation",
    "bulk_notifications",
    "calm_inbox",
    "auto_reply_classification",

    "calm_control_access",
    "rescue_my_day",
    "smart_skip_stop",
    "day_triage",

    "cancellation_gap_fill",
    "waitlist_management",
    "revenue_tracking",

    "advanced_analytics",
    "end_of_day_summary",
    "roi_calculator",
    "time_savings_tracking",

    // PRO-EXCLUSIVE: Multi-groomer & Team Features
    "multi_groomer",
    "team_calendar",
    "groomer_performance_analytics",
    "equipment_logging",

    // PRO-EXCLUSIVE: Premium Support
    "email_support",
    "priority_support",
    "phone_support",
    "dedicated_account_manager",
  ]),
};

/**
 * Usage limits for each plan
 */
export const PLAN_LIMITS = {
  TRIAL: {
    maxCustomers: 50,
    maxAppointmentsPerMonth: 100,
    maxGroomers: 1,
    smsMessagesPerMonth: 500,
  },
  STARTER: {
    maxCustomers: 50,
    maxAppointmentsPerMonth: 100,
    maxGroomers: 1,
    smsMessagesPerMonth: 500,
  },
  GROWTH: {
    maxCustomers: Infinity,
    maxAppointmentsPerMonth: Infinity,
    maxGroomers: 1,
    smsMessagesPerMonth: 2000,
  },
  PRO: {
    maxCustomers: Infinity,
    maxAppointmentsPerMonth: Infinity,
    maxGroomers: Infinity,
    smsMessagesPerMonth: 10000,
  },
} as const;

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeature(plan: SubscriptionPlan, feature: Feature): boolean {
  return FEATURE_MATRIX[plan]?.has(feature) ?? false;
}

/**
 * Check if a plan has access to any of the specified features
 */
export function hasAnyFeature(plan: SubscriptionPlan, features: Feature[]): boolean {
  return features.some(feature => hasFeature(plan, feature));
}

/**
 * Check if a plan has access to all of the specified features
 */
export function hasAllFeatures(plan: SubscriptionPlan, features: Feature[]): boolean {
  return features.every(feature => hasFeature(plan, feature));
}

/**
 * Get all features available for a plan
 */
export function getPlanFeatures(plan: SubscriptionPlan): Feature[] {
  return Array.from(FEATURE_MATRIX[plan] ?? []);
}

/**
 * Get plan limits
 */
export function getPlanLimits(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan];
}

/**
 * Check if account has reached a specific limit
 */
export function hasReachedLimit(
  plan: SubscriptionPlan,
  limitType: keyof typeof PLAN_LIMITS.TRIAL,
  currentUsage: number
): boolean {
  const limit = PLAN_LIMITS[plan][limitType];
  return currentUsage >= limit;
}

/**
 * Feature descriptions for UI display
 */
export const FEATURE_DESCRIPTIONS: Record<Feature, string> = {
  // Core
  route_optimization: "One-tap route optimization",
  one_tap_navigation: "Launch navigation with one tap",
  area_days: "Dedicated area days support",
  skip_stop: "Skip appointment and auto-rebuild route",

  // Customer Management
  unlimited_customers: "Unlimited customer profiles",
  unlimited_appointments: "Unlimited appointments",
  calendar_import: "Import from Google Calendar / ICS",
  calendar_two_way_sync: "Two-way calendar sync",
  appointment_conflict_detection: "Automatic conflict detection",

  // Workload
  dog_size_tracking: "Dog size & breed tracking",
  energy_cost_ratings: "Energy cost per appointment",
  danger_day_warnings: "Danger day warnings",
  assistant_mode: "Assistant mode (workload adjustment)",
  workload_distribution: "Smart workload distribution",

  // Messaging
  sms_messaging: "SMS messaging",
  shared_sms_number: "Shared SMS number",
  dedicated_sms_number: "Dedicated business SMS number",
  email_messaging: "Email messaging",
  message_templates: "Professional message templates",
  running_late_automation: "Running late automation",
  bulk_notifications: "Bulk notifications",
  calm_inbox: "Calm Inbox (intelligent reply sorting)",
  auto_reply_classification: "Auto-classify customer replies",

  // Calm Control
  calm_control_access: "Calm Control Center access",
  rescue_my_day: "Rescue My Day feature",
  smart_skip_stop: "Smart skip stop with auto-notifications",
  day_triage: "Day triage & rescue plans",

  // Revenue
  cancellation_gap_fill: "Automatic cancellation gap fill",
  waitlist_management: "Waitlist management",
  revenue_tracking: "Revenue recovery tracking",

  // Analytics
  basic_analytics: "Basic time & route analytics",
  advanced_analytics: "Advanced analytics dashboard",
  end_of_day_summary: "End-of-day summary",
  roi_calculator: "ROI calculator",
  time_savings_tracking: "Time savings tracking",

  // Team
  multi_groomer: "Multi-groomer support",
  team_calendar: "Team calendar view",
  groomer_performance_analytics: "Per-groomer analytics",
  equipment_logging: "Equipment & van issue logging",

  // Support
  email_support: "Email support",
  priority_support: "Priority support",
  phone_support: "Phone support",
  dedicated_account_manager: "Dedicated account manager",
};

/**
 * Get user-friendly feature description
 */
export function getFeatureDescription(feature: Feature): string {
  return FEATURE_DESCRIPTIONS[feature] ?? feature;
}

/**
 * Helper to check messaging tier capabilities
 */
export function getMessagingTier(plan: SubscriptionPlan): "shared" | "dedicated" | "none" {
  if (hasFeature(plan, "dedicated_sms_number")) return "dedicated";
  if (hasFeature(plan, "shared_sms_number")) return "shared";
  return "none";
}

/**
 * Pricing information
 */
export const PLAN_PRICING = {
  TRIAL: { monthly: 0, yearly: 0 },
  STARTER: { monthly: 89, yearly: 890 }, // ~2 months free
  GROWTH: { monthly: 179, yearly: 1790 }, // ~2 months free
  PRO: { monthly: 329, yearly: 3290 }, // ~2 months free
} as const;

/**
 * Plan display names
 */
export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  TRIAL: "Trial",
  STARTER: "Starter",
  GROWTH: "Growth",
  PRO: "Pro",
};

/**
 * Plan taglines
 */
export const PLAN_TAGLINES: Record<SubscriptionPlan, string> = {
  TRIAL: "14-day free trial",
  STARTER: "Solo groomer getting started",
  GROWTH: "Professional groomer scaling up",
  PRO: "Multi-van operation",
};
