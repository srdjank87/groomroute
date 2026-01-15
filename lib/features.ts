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
  | "on_my_way"

  // Customer & Appointment Management
  | "unlimited_customers"
  | "unlimited_appointments"
  | "calendar_import"
  | "calendar_two_way_sync"
  | "appointment_conflict_detection"
  | "basic_customer_notes"
  | "pet_behavior_flags"
  | "cancellation_history"

  // Workload Intelligence
  | "dog_size_tracking"
  | "energy_cost_ratings"
  | "danger_day_warnings"
  | "working_hours_warnings"
  | "workload_protection"
  | "assistant_mode"
  | "workload_distribution"

  // Communication & Messaging
  | "sms_messaging"
  | "shared_sms_number"
  | "dedicated_sms_number"
  | "email_messaging"
  | "message_templates"
  | "running_late_automation"
  | "running_late_notifications"
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
    // Core features (same as GROWTH for trial period to let them experience full features)
    "route_optimization",
    "one_tap_navigation",
    "area_days",
    "skip_stop",
    "on_my_way",

    // Customer & Appointment (GROWTH level for trial)
    "unlimited_customers",
    "appointment_conflict_detection",
    "calendar_import",
    "basic_customer_notes",
    "pet_behavior_flags",
    "cancellation_history",

    // Workload Intelligence (GROWTH level for trial)
    "workload_protection",
    "working_hours_warnings",
    "danger_day_warnings",

    // Messaging (shared number for trial)
    "sms_messaging",
    "shared_sms_number",
    "email_messaging",
    "calm_inbox",
    "auto_reply_classification",
    "running_late_notifications",

    // Basic support
    "email_support",
  ]),

  STARTER: new Set([
    // Core Routing & Navigation (Landing page: Route optimization, Area day scheduling, One-tap navigation)
    "route_optimization",
    "one_tap_navigation",
    "area_days",
    "skip_stop",
    "on_my_way",

    // Customer & Appointment Management (Landing page: Basic customer notes, Up to 50 customers)
    "appointment_conflict_detection",
    "calendar_import",
    "basic_customer_notes",
    // NOT INCLUDED: unlimited_customers, unlimited_appointments, calendar_two_way_sync

    // Communication (SHARED NUMBER ONLY)
    "sms_messaging",
    "shared_sms_number",
    "email_messaging",
    "calm_inbox",
    "auto_reply_classification",

    // Basic Analytics
    "basic_analytics",

    // Support (Landing page: Email support)
    "email_support",
  ]),

  GROWTH: new Set([
    // Core Routing & Navigation (Landing page: all STARTER features plus more)
    "route_optimization",
    "one_tap_navigation",
    "area_days",
    "skip_stop",
    "on_my_way",

    // Customer & Appointment Management (Landing page: Unlimited customers, Pet behavior flags, Cancellation history)
    "unlimited_customers",
    "unlimited_appointments",
    "calendar_import",
    "calendar_two_way_sync",
    "appointment_conflict_detection",
    "basic_customer_notes",
    "pet_behavior_flags",
    "cancellation_history",

    // Workload Intelligence (Landing page: Workload protection limits, Working hours warnings)
    "dog_size_tracking",
    "energy_cost_ratings",
    "danger_day_warnings",
    "working_hours_warnings",
    "workload_protection",
    "assistant_mode",
    "workload_distribution",

    // Communication (Landing page: Running late notifications)
    "sms_messaging",
    "dedicated_sms_number",
    "email_messaging",
    "message_templates",
    "running_late_automation",
    "running_late_notifications",
    "bulk_notifications",
    "calm_inbox",
    "auto_reply_classification",

    // Calm Control
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

    // Support (Landing page: Priority support)
    "email_support",
    "priority_support",
  ]),

  PRO: new Set([
    // Everything from GROWTH plus PRO-exclusive features
    // Core Routing & Navigation
    "route_optimization",
    "one_tap_navigation",
    "area_days",
    "skip_stop",
    "on_my_way",

    // Customer & Appointment Management
    "unlimited_customers",
    "unlimited_appointments",
    "calendar_import",
    "calendar_two_way_sync",
    "appointment_conflict_detection",
    "basic_customer_notes",
    "pet_behavior_flags",
    "cancellation_history",

    // Workload Intelligence
    "dog_size_tracking",
    "energy_cost_ratings",
    "danger_day_warnings",
    "working_hours_warnings",
    "workload_protection",
    "assistant_mode",
    "workload_distribution",

    // Communication
    "sms_messaging",
    "dedicated_sms_number",
    "email_messaging",
    "message_templates",
    "running_late_automation",
    "running_late_notifications",
    "bulk_notifications",
    "calm_inbox",
    "auto_reply_classification",

    // Calm Control
    "calm_control_access",
    "rescue_my_day",
    "smart_skip_stop",
    "day_triage",

    // Revenue Protection
    "cancellation_gap_fill",
    "waitlist_management",
    "revenue_tracking",

    // Analytics
    "advanced_analytics",
    "end_of_day_summary",
    "roi_calculator",
    "time_savings_tracking",

    // PRO-EXCLUSIVE: Multi-groomer & Team Features (Landing page: Multiple groomers/vans, Team calendar view, Per-groomer analytics)
    "multi_groomer",
    "team_calendar",
    "groomer_performance_analytics",
    "equipment_logging",

    // PRO-EXCLUSIVE: Premium Support (Landing page: Phone support, Dedicated account manager)
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
  on_my_way: "One-tap 'On My Way' SMS notification",

  // Customer Management
  unlimited_customers: "Unlimited customer profiles",
  unlimited_appointments: "Unlimited appointments",
  calendar_import: "Import from Google Calendar / ICS",
  calendar_two_way_sync: "Two-way calendar sync",
  appointment_conflict_detection: "Automatic conflict detection",
  basic_customer_notes: "Basic customer notes",
  pet_behavior_flags: "Pet behavior flags & special needs tracking",
  cancellation_history: "Customer cancellation history tracking",

  // Workload
  dog_size_tracking: "Dog size & breed tracking",
  energy_cost_ratings: "Energy cost per appointment",
  danger_day_warnings: "Danger day warnings",
  working_hours_warnings: "Working hours warnings",
  workload_protection: "Workload protection limits",
  assistant_mode: "Assistant mode (workload adjustment)",
  workload_distribution: "Smart workload distribution",

  // Messaging
  sms_messaging: "SMS messaging",
  shared_sms_number: "Shared SMS number",
  dedicated_sms_number: "Dedicated business SMS number",
  email_messaging: "Email messaging",
  message_templates: "Professional message templates",
  running_late_automation: "Running late automation",
  running_late_notifications: "Running late bulk notifications",
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
  STARTER: { monthly: 39, yearly: 384 }, // $32/mo when paid yearly (~17% savings)
  GROWTH: { monthly: 79, yearly: 792 }, // $66/mo when paid yearly (~17% savings)
  PRO: { monthly: 149, yearly: 1488 }, // $124/mo when paid yearly (~17% savings)
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
