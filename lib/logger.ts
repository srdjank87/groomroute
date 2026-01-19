import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

/**
 * Production-safe logger that:
 * - In development: logs to console
 * - In production: adds Sentry breadcrumbs for context (errors still use console.error)
 */
export const logger = {
  /**
   * Debug-level logging (dev only)
   */
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  },

  /**
   * Info-level logging
   */
  info: (message: string, data?: Record<string, unknown>) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, data || "");
    } else {
      // Add as Sentry breadcrumb for context if an error occurs later
      Sentry.addBreadcrumb({
        category: "info",
        message,
        data,
        level: "info",
      });
    }
  },

  /**
   * Warning-level logging
   */
  warn: (message: string, data?: Record<string, unknown>) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data || "");
    } else {
      Sentry.addBreadcrumb({
        category: "warning",
        message,
        data,
        level: "warning",
      });
    }
  },

  /**
   * Error-level logging (always logs to console.error, also reports to Sentry)
   */
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error || "", data || "");

    if (!isDev && error instanceof Error) {
      Sentry.captureException(error, {
        extra: { ...data, message },
      });
    }
  },

  /**
   * Webhook-specific logging for Stripe events
   */
  webhook: (eventType: string, message: string, data?: Record<string, unknown>) => {
    const fullMessage = `[Stripe:${eventType}] ${message}`;

    if (isDev) {
      console.log(fullMessage, data || "");
    } else {
      Sentry.addBreadcrumb({
        category: "webhook.stripe",
        message: fullMessage,
        data,
        level: "info",
      });
    }
  },
};
