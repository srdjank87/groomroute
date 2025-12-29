import Stripe from "stripe";

// Allow build without Stripe key (will fail at runtime if used without key)
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Stripe pricing configuration
export const STRIPE_PLANS = {
  starter: {
    monthly: {
      priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
      amount: 7900, // $79.00
    },
    yearly: {
      priceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
      amount: 95000, // $950.00 (updated to match landing page)
    },
  },
  growth: {
    monthly: {
      priceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || "",
      amount: 17900, // $179.00
    },
    yearly: {
      priceId: process.env.STRIPE_GROWTH_YEARLY_PRICE_ID || "",
      amount: 170000, // $1,700.00
    },
  },
  pro: {
    monthly: {
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
      amount: 27900, // $279.00
    },
    yearly: {
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
      amount: 265000, // $2,650.00
    },
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;
export type BillingType = "monthly" | "yearly";
