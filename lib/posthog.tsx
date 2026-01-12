"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

// Initialize PostHog only on client side
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    // Respect Do Not Track
    respect_dnt: true,
    // Session recording (optional - enable in PostHog dashboard)
    disable_session_recording: false,
  });
}

// Component to identify user when session changes
function PostHogUserIdentifier() {
  const { data: session, status } = useSession();
  const ph = usePostHog();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Identify user with their account info
      ph.identify(session.user.accountId, {
        email: session.user.email,
        name: session.user.name,
        accountId: session.user.accountId,
        subscriptionPlan: session.user.subscriptionPlan,
        subscriptionStatus: session.user.subscriptionStatus,
        role: session.user.role,
      });

      // Set user properties for filtering
      ph.people.set({
        plan: session.user.subscriptionPlan,
        status: session.user.subscriptionStatus,
      });
    } else if (status === "unauthenticated") {
      // Reset on logout
      ph.reset();
    }
  }, [session, status, ph]);

  return null;
}

// PostHog Provider wrapper
export function PostHogProvider({ children }: { children: ReactNode }) {
  // Only render provider if PostHog key is configured
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogUserIdentifier />
      {children}
    </PHProvider>
  );
}

// Re-export useful hooks and functions
export { usePostHog } from "posthog-js/react";
export { posthog };

// Helper to track events with consistent naming
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

// Track feature usage with standard properties
export function trackFeatureUsage(
  feature: string,
  action: string,
  properties?: Record<string, unknown>
) {
  trackEvent(`${feature}_${action}`, {
    feature,
    action,
    timestamp: new Date().toISOString(),
    ...properties,
  });
}
