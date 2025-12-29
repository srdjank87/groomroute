import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
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
