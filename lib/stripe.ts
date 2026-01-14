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
        // Pro base price (includes 1 admin seat)
        priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
        amount: 14900, // $149.00 base price
        // Additional seat prices
        additionalAdminPriceId: process.env.STRIPE_PRO_ADMIN_MONTHLY_PRICE_ID || "",
        groomerPriceId: process.env.STRIPE_PRO_GROOMER_MONTHLY_PRICE_ID || "",
        additionalAdminAmount: 4900, // $49.00 per extra admin seat
        groomerAmount: 2900, // $29.00 per groomer seat
      },
      yearly: {
        priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
        amount: 148800, // $1,488.00/year ($124/mo)
        additionalAdminPriceId: process.env.STRIPE_PRO_ADMIN_YEARLY_PRICE_ID || "",
        groomerPriceId: process.env.STRIPE_PRO_GROOMER_YEARLY_PRICE_ID || "",
        additionalAdminAmount: 49200, // $492.00/year ($41/mo) per extra admin
        groomerAmount: 30000, // $300.00/year ($25/mo) per groomer seat
      },
    },
  } as const;
}

// For backwards compatibility, export as constant too
export const STRIPE_PLANS = getStripePlans();

export type PlanType = keyof typeof STRIPE_PLANS;
export type BillingType = "monthly" | "yearly";
