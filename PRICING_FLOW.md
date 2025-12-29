# Pricing & Subscription Flow

## Overview

GroomRoute uses a **14-day free trial** model with three pricing tiers: Starter, Growth, and Pro. Each can be billed monthly or yearly.

---

## User Journey

### 1. **Landing Page → Signup**

User clicks a pricing tier button on the landing page:
- **Starter** - Monthly ($79) or Yearly ($790)
- **Growth** - Monthly ($179) or Yearly ($1,700)
- **Pro** - Monthly ($279) or Yearly ($2,650)

The button passes URL parameters:
```
/auth/signup?plan=growth&billing=yearly
```

### 2. **Signup Page**

- Displays selected plan and billing cycle
- Shows "14-day free trial" badge
- User can change plan via "Change plan" link
- On submit, creates:
  - **User account**
  - **Account** with:
    - `subscriptionPlan`: STARTER | GROWTH | PRO
    - `billingCycle`: MONTHLY | YEARLY
    - `subscriptionStatus`: TRIAL
    - `trialEndsAt`: 14 days from signup

### 3. **Onboarding**

User completes groomer profile setup (no payment required yet).

### 4. **Dashboard**

User has full access to all features during trial.

---

## Trial Status & Feature Access

### During Trial (Days 1-14)

- **Status**: `TRIAL`
- **Access**: Full access to all features for selected plan
- **Dashboard displays**:
  - Trial days remaining badge
  - "Add payment method" prompt (optional)

### Trial Ending (Day 12-14)

- Email reminders sent
- Dashboard banner: "Trial ends in X days"
- Prompt to add payment method

### Trial Expired (Day 15+)

If no payment method added:
- **Status**: `EXPIRED`
- **Access**: Read-only mode
  - Can view data
  - Cannot create/edit/delete
  - Routes/appointments are locked
- **Dashboard displays**:
  - Large "Trial expired" banner
  - "Add payment to continue" CTA

### After Payment Added

- **Status**: `ACTIVE`
- **Access**: Full access restored
- Billing starts immediately
- `currentPeriodEnd` set to 1 month or 1 year from activation

---

## Database Schema

```prisma
model Account {
  // Subscription fields
  subscriptionPlan     SubscriptionPlan   @default(TRIAL)
  billingCycle         BillingCycle       @default(MONTHLY)
  subscriptionStatus   SubscriptionStatus @default(TRIAL)
  trialEndsAt          DateTime?
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  currentPeriodEnd     DateTime?
}

enum SubscriptionPlan {
  TRIAL
  STARTER
  GROWTH
  PRO
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  TRIAL       // Free 14-day trial
  ACTIVE      // Paid and active
  PAST_DUE    // Payment failed
  CANCELED    // User canceled
  INCOMPLETE  // Stripe setup incomplete
  EXPIRED     // Trial expired without payment
}
```

---

## Implementation Phases

### ✅ Phase 1: Trial & Plan Selection (Current)
- [x] Add subscription fields to schema
- [x] Update signup to capture plan selection
- [x] Set 14-day trial period
- [x] Update landing page buttons with plan params

### 🔲 Phase 2: Trial Status Display (Next Sprint)
- [ ] Dashboard trial badge
- [ ] Days remaining counter
- [ ] Trial expiration banner
- [ ] Email reminders (Day 12, 13, 14)

### 🔲 Phase 3: Payment Integration (Sprint After)
- [ ] Stripe integration
- [ ] Payment method form
- [ ] Subscription creation
- [ ] Webhook handling (payment success/failure)

### 🔲 Phase 4: Feature Gating (After Payment)
- [ ] Middleware to check subscription status
- [ ] Read-only mode for expired trials
- [ ] Plan-based feature limits
- [ ] Upgrade/downgrade flow

---

## Pricing Logic

### Monthly Pricing
- **Starter**: $79/month
- **Growth**: $179/month (Most Popular)
- **Pro**: $279/month

### Yearly Pricing (Save ~20%)
- **Starter**: $790/year ($66/month)
- **Growth**: $1,700/year ($142/month)
- **Pro**: $2,650/year ($221/month)

### Feature Access by Plan

| Feature | Starter | Growth | Pro |
|---------|---------|--------|-----|
| Route optimization | ✅ | ✅ | ✅ |
| Address validation | ✅ | ✅ | ✅ |
| Basic SMS | ✅ | ✅ | ✅ |
| Running late automation | ❌ | ✅ | ✅ |
| Communication automation | ❌ | ✅ | ✅ |
| Gap-fill automation | ❌ | ❌ | ✅ |
| Waitlist management | ❌ | ❌ | ✅ |
| Multi-groomer support | ❌ | ❌ | ✅ |
| Advanced analytics | ❌ | ❌ | ✅ |

---

## Next Steps

1. **Run the migration**:
   ```bash
   npx prisma migrate dev --name add_subscription_fields
   ```

2. **Test the flow**:
   - Go to landing page
   - Click "Growth - Yearly"
   - Verify signup shows correct plan
   - Complete signup
   - Check database has correct subscription data

3. **Build Phase 2** (Trial Status Display):
   - Add trial badge to dashboard
   - Create countdown component
   - Add expiration banner logic
