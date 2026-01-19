import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Session Replay - capture 10% of sessions, 100% on errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  environment: process.env.NODE_ENV,

  // Filter out common non-actionable errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random plugins/extensions
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.teletrader.com",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    "http://loading.retry.widdit.com/",
    "atomicFindClose",
    // Facebook browser issues
    "fb_xd_fragment",
    // ISP "optimization"
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    // Network errors
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // Cancelled requests
    "AbortError",
    "The operation was aborted",
  ],

  // Don't send errors from localhost
  beforeSend(event) {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return null;
    }
    return event;
  },
});
