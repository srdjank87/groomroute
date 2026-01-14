import Stripe from "stripe";

// Allow build without Stripe key (will fail at runtime if used without key)
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Stripe pricing configuration - using a function to ensure env vars are read at runtime
export function getStripePlans() {
  return {
    starter: {
      monthly: {
        priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
        amount: 3900, // $39.00
      },
      yearly: {
        priceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
        amount: 38400, // $384.00 ($32/mo)
      },
    },
    growth: {
      monthly: {
        priceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || "",
        amount: 7900, // $79.00
      },
      yearly: {
        priceId: process.env.STRIPE_GROWTH_YEARLY_PRICE_ID || "",
        amount: 79200, // $792.00 ($66/mo)
      },
    },
    pro: {
      monthly: {
        // For Pro, we use separate admin and groomer seat prices
        adminPriceId: process.env.STRIPE_PRO_ADMIN_MONTHLY_PRICE_ID || "",
        groomerPriceId: process.env.STRIPE_PRO_GROOMER_MONTHLY_PRICE_ID || "",
        adminAmount: 4900, // $49.00 per admin seat
        groomerAmount: 2900, // $29.00 per groomer seat
        // Legacy single price for backwards compatibility
        priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
        amount: 4900,
      },
      yearly: {
        adminPriceId: process.env.STRIPE_PRO_ADMIN_YEARLY_PRICE_ID || "",
        groomerPriceId: process.env.STRIPE_PRO_GROOMER_YEARLY_PRICE_ID || "",
        adminAmount: 49200, // $492.00/year ($41/mo) per admin seat
        groomerAmount: 30000, // $300.00/year ($25/mo) per groomer seat
        // Legacy single price for backwards compatibility
        priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
        amount: 49200,
      },
    },
  } as const;
}

// For backwards compatibility, export as constant too
export const STRIPE_PLANS = getStripePlans();

export type PlanType = keyof typeof STRIPE_PLANS;
export type BillingType = "monthly" | "yearly";
