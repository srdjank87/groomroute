# Stripe Integration Setup Guide

This guide walks you through setting up Stripe for GroomRoute's subscription billing system.

---

## Overview

GroomRoute uses Stripe for:
- 14-day free trial with card capture
- Subscription billing (monthly/yearly)
- Automatic payment processing
- Webhook events for subscription lifecycle

---

## Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete business verification (required for live mode)
3. For testing, we'll use **Test Mode** (toggle in top-right)

---

## Step 2: Get API Keys

### Development (Test Mode)

1. In Stripe Dashboard, click "Developers" → "API keys"
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

### Production (Live Mode)

1. Toggle to "Live mode" in dashboard
2. Get live keys (start with `pk_live_` and `sk_live_`)
3. Update production `.env` with live keys

---

## Step 3: Create Products and Prices

### Via Stripe Dashboard

1. Go to **Products** → **Add Product**

2. Create 6 products total (3 plans × 2 billing cycles):

#### Starter - Monthly
- **Name**: GroomRoute Starter (Monthly)
- **Price**: $79.00 USD
- **Billing**: Recurring - Monthly
- **Copy Price ID**: `price_...` → Add to `.env` as `STRIPE_STARTER_MONTHLY_PRICE_ID`

#### Starter - Yearly
- **Name**: GroomRoute Starter (Yearly)
- **Price**: $790.00 USD
- **Billing**: Recurring - Yearly
- **Copy Price ID** → Add to `.env` as `STRIPE_STARTER_YEARLY_PRICE_ID`

#### Growth - Monthly
- **Name**: GroomRoute Growth (Monthly)
- **Price**: $179.00 USD
- **Billing**: Recurring - Monthly
- **Copy Price ID** → `STRIPE_GROWTH_MONTHLY_PRICE_ID`

#### Growth - Yearly
- **Name**: GroomRoute Growth (Yearly)
- **Price**: $1,700.00 USD
- **Billing**: Recurring - Yearly
- **Copy Price ID** → `STRIPE_GROWTH_YEARLY_PRICE_ID`

#### Pro - Monthly
- **Name**: GroomRoute Pro (Monthly)
- **Price**: $279.00 USD
- **Billing**: Recurring - Monthly
- **Copy Price ID** → `STRIPE_PRO_MONTHLY_PRICE_ID`

#### Pro - Yearly
- **Name**: GroomRoute Pro (Yearly)
- **Price**: $2,650.00 USD
- **Billing**: Recurring - Yearly
- **Copy Price ID** → `STRIPE_PRO_YEARLY_PRICE_ID`

3. Update `.env`:
   ```env
   # Stripe Price IDs
   STRIPE_STARTER_MONTHLY_PRICE_ID="price_..."
   STRIPE_STARTER_YEARLY_PRICE_ID="price_..."
   STRIPE_GROWTH_MONTHLY_PRICE_ID="price_..."
   STRIPE_GROWTH_YEARLY_PRICE_ID="price_..."
   STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
   STRIPE_PRO_YEARLY_PRICE_ID="price_..."
   ```

---

## Step 4: Set Up Webhooks

Webhooks notify your app when subscription events happen (payment succeeded, subscription canceled, etc.).

### For Local Development (using Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases/latest
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

5. Keep the `stripe listen` command running while developing

### For Production

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Signing secret** and add to production `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

---

## Step 5: Test the Integration

### Test Cards

Stripe provides test cards for development:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Payment fails |

Use any future expiration date, any 3-digit CVC, and any billing ZIP.

### Test Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Start Stripe webhook listener (in another terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Go to landing page: `http://localhost:3000`

4. Click a pricing plan (e.g., "Growth - Monthly")

5. Complete signup form

6. Complete onboarding

7. You should be redirected to payment/checkout (to be implemented)

8. Use test card `4242 4242 4242 4242`

9. Check:
   - Stripe Dashboard → Customers (new customer created)
   - Stripe Dashboard → Subscriptions (subscription in trial)
   - Database: `Account` record has `stripeCustomerId` and `stripeSubscriptionId`

---

## Step 6: Environment Variables Summary

Your `.env` should have:

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
STRIPE_STARTER_MONTHLY_PRICE_ID="price_..."
STRIPE_STARTER_YEARLY_PRICE_ID="price_..."
STRIPE_GROWTH_MONTHLY_PRICE_ID="price_..."
STRIPE_GROWTH_YEARLY_PRICE_ID="price_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_YEARLY_PRICE_ID="price_..."
```

---

## Step 7: Trial Period Configuration

The trial period is set in `/app/api/create-checkout-session/route.ts`:

```typescript
subscription_data: {
  trial_period_days: 14,  // Change this to adjust trial length
  metadata: { ... }
}
```

---

## Subscription Lifecycle

### Trial Phase (Days 1-14)
- Status: `TRIAL`
- Customer has full access
- No charges
- Card is on file

### Trial → Active (Day 15)
- Stripe charges the first invoice
- Webhook: `invoice.payment_succeeded`
- Status updates to `ACTIVE`

### Payment Failed
- Webhook: `invoice.payment_failed`
- Status updates to `PAST_DUE`
- Stripe retries payment automatically

### Cancellation
- User cancels via billing page
- Webhook: `customer.subscription.deleted`
- Status updates to `CANCELED`
- Access continues until period end

---

## Troubleshooting

### "Stripe price ID not configured for this plan"
- Make sure all 6 price IDs are in `.env`
- Restart dev server after updating `.env`

### Webhook signature verification failed
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Make sure Stripe CLI is running (`stripe listen`)
- Check webhook URL matches exactly

### Payment not updating database
- Check Stripe Dashboard → Developers → Webhooks for errors
- Check server logs for webhook handler errors
- Verify webhook events are enabled

---

## Security Notes

### For Production

1. **NEVER** commit `.env` to git (it's in `.gitignore`)
2. Use environment variables in deployment (Vercel, Railway, etc.)
3. Enable Stripe Radar for fraud protection
4. Set up email notifications for failed payments
5. Use HTTPS only (Stripe requires it)
6. Rotate API keys if exposed

---

## Next Steps

After Stripe setup is complete:

1. ✅ Stripe SDK installed
2. ✅ API keys configured
3. ✅ Products & prices created
4. ✅ Webhooks configured
5. ⬜ Update onboarding to include payment step
6. ⬜ Build billing management page
7. ⬜ Implement trial expiration handling
8. ⬜ Add payment method update flow

---

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
