"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/posthog";

// Scroll depth thresholds to track
const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];

export function LandingPageAnalytics() {
  const trackedThresholds = useRef<Set<number>>(new Set());
  const maxScrollDepth = useRef<number>(0);

  useEffect(() => {
    // Track initial page view with landing page context
    trackEvent("landing_page_view", {
      referrer: document.referrer || "direct",
      url: window.location.href,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });

    // Scroll depth tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Update max scroll depth
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
      }

      // Track threshold crossings
      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackEvent("landing_scroll_depth", {
            depth: threshold,
            depthLabel: `${threshold}%`,
          });
        }
      });
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    // Track max scroll depth when leaving page
    const handleBeforeUnload = () => {
      trackEvent("landing_max_scroll_depth", {
        maxDepth: maxScrollDepth.current,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}

// Helper function to track CTA clicks - call this onClick
export function trackCTAClick(
  ctaName: string,
  location: string,
  destination?: string
) {
  trackEvent("landing_cta_click", {
    cta: ctaName,
    location,
    destination: destination || "signup",
    scrollDepth: Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    ),
  });
}
