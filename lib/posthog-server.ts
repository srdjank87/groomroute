import { PostHog } from "posthog-node";
import { prisma } from "@/lib/prisma";

// Server-side PostHog client
// Use this in API routes and server components

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!process.env.POSTHOG_API_KEY) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1, // Flush immediately in serverless environment
      flushInterval: 0,
    });
  }

  return posthogClient;
}

// Track server-side event
export async function trackServerEvent(
  distinctId: string,
  eventName: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogServer();
  if (!client) return;

  client.capture({
    distinctId,
    event: eventName,
    properties: {
      $lib: "posthog-node",
      source: "server",
      ...properties,
    },
  });

  // Flush immediately for serverless
  await client.flush();
}

// Identify user server-side
export async function identifyUser(
  distinctId: string,
  properties: Record<string, unknown>
) {
  const client = getPostHogServer();
  if (!client) return;

  client.identify({
    distinctId,
    properties,
  });

  await client.flush();
}

// Track account creation
export async function trackAccountCreated(
  accountId: string,
  email: string,
  properties?: {
    signupSource?: string;
    planSelected?: string;
  }
) {
  await trackServerEvent(accountId, "account_created", {
    email,
    signup_source: properties?.signupSource || "direct",
    plan_selected: properties?.planSelected || "trial",
    timestamp: new Date().toISOString(),
  });
}

// Track first meaningful action
export async function trackFirstAction(
  accountId: string,
  actionType: string,
  minutesSinceSignup: number
) {
  await trackServerEvent(accountId, "first_action_completed", {
    action_type: actionType,
    minutes_since_signup: minutesSinceSignup,
    timestamp: new Date().toISOString(),
  });
}

// Helper to check and track first action if not already tracked
// Returns true if this was the first action
export async function checkAndTrackFirstAction(
  accountId: string,
  actionType: "appointment_created" | "customer_created" | "route_optimized"
): Promise<boolean> {
  // Check if first action already tracked
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { firstActionAt: true, createdAt: true },
  });

  if (!account || account.firstActionAt) {
    // Already tracked or account not found
    return false;
  }

  // Calculate minutes since signup
  const now = new Date();
  const minutesSinceSignup = Math.round(
    (now.getTime() - account.createdAt.getTime()) / (1000 * 60)
  );

  // Update account with first action info
  await prisma.account.update({
    where: { id: accountId },
    data: {
      firstActionAt: now,
      firstActionType: actionType,
    },
  });

  // Track in PostHog
  await trackFirstAction(accountId, actionType, minutesSinceSignup);

  return true;
}

// Track route optimization
export async function trackRouteOptimized(
  accountId: string,
  properties: {
    numberOfStops: number;
    estimatedTimeSaved?: number;
    estimatedDistanceSaved?: number;
    dayOfWeek: number;
  }
) {
  await trackServerEvent(accountId, "route_optimized", {
    number_of_stops: properties.numberOfStops,
    estimated_time_saved: properties.estimatedTimeSaved,
    estimated_distance_saved: properties.estimatedDistanceSaved,
    day_of_week: properties.dayOfWeek,
    timestamp: new Date().toISOString(),
  });
}

// Track appointment created
export async function trackAppointmentCreated(
  accountId: string,
  properties: {
    appointmentType: string;
    serviceMinutes: number;
    hasCustomer: boolean;
  }
) {
  await trackServerEvent(accountId, "appointment_created", {
    appointment_type: properties.appointmentType,
    service_minutes: properties.serviceMinutes,
    has_customer: properties.hasCustomer,
    timestamp: new Date().toISOString(),
  });
}

// Track customer created
export async function trackCustomerCreated(
  accountId: string,
  properties?: {
    hasArea?: boolean;
    hasPets?: boolean;
  }
) {
  await trackServerEvent(accountId, "customer_created", {
    has_area: properties?.hasArea || false,
    has_pets: properties?.hasPets || false,
    timestamp: new Date().toISOString(),
  });
}

// Track trial conversion
export async function trackTrialConverted(
  accountId: string,
  properties: {
    plan: string;
    daysInTrial: number;
    totalRoutesOptimized?: number;
    daysActive?: number;
  }
) {
  await trackServerEvent(accountId, "trial_converted", {
    plan: properties.plan,
    days_in_trial: properties.daysInTrial,
    total_routes_optimized: properties.totalRoutesOptimized || 0,
    days_active: properties.daysActive || 0,
    timestamp: new Date().toISOString(),
  });
}

// Track day viewed (dashboard load)
export async function trackDayViewed(
  accountId: string,
  properties: {
    appointmentsToday: number;
    hasRoute: boolean;
    dayOfWeek: number;
  }
) {
  await trackServerEvent(accountId, "day_viewed", {
    appointments_today: properties.appointmentsToday,
    has_route: properties.hasRoute,
    day_of_week: properties.dayOfWeek,
    timestamp: new Date().toISOString(),
  });
}

// Track trial expired without conversion
export async function trackTrialExpired(
  accountId: string,
  properties: {
    totalSessions?: number;
    routesOptimized?: number;
    daysActive?: number;
  }
) {
  await trackServerEvent(accountId, "trial_expired_without_conversion", {
    total_sessions: properties.totalSessions || 0,
    routes_optimized: properties.routesOptimized || 0,
    days_active: properties.daysActive || 0,
    timestamp: new Date().toISOString(),
  });
}

// Shutdown client (call on server shutdown if needed)
export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
