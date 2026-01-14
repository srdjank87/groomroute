"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, Suspense } from "react";

// Declare fbq on window
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// PageView tracker component (needs to be wrapped in Suspense)
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // Track pageview on route change
    window.fbq?.("track", "PageView");
  }, [pathname, searchParams]);

  return null;
}

export function FacebookPixel() {
  // Don't render anything if pixel ID is not configured
  if (!FB_PIXEL_ID) {
    return null;
  }

  return (
    <>
      {/* Facebook Pixel Base Code */}
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* NoScript fallback - using img tag as required by Facebook Pixel */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Track page views on route change */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

// Helper functions for tracking standard events
// These can be called from anywhere in the app

/**
 * Track Lead event - when a user signs up
 */
export function fbTrackLead(email?: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "signup",
      ...(email && { em: email }),
    });
  }
}

/**
 * Track StartTrial event - when trial begins
 */
export function fbTrackStartTrial(value?: number, currency = "USD") {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "StartTrial", {
      value: value || 0,
      currency,
      content_name: "trial_start",
    });
  }
}

/**
 * Track Subscribe event - when user pays
 */
export function fbTrackSubscribe(
  value: number,
  currency = "USD",
  planName?: string
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Subscribe", {
      value,
      currency,
      content_name: planName || "subscription",
    });
  }
}

/**
 * Track ViewContent event - when viewing important pages
 */
export function fbTrackViewContent(contentName: string, contentId?: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: contentName,
      content_ids: contentId ? [contentId] : undefined,
    });
  }
}

/**
 * Track custom event
 */
export function fbTrackCustom(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
}

/**
 * Generate a unique event ID for deduplication with CAPI
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
