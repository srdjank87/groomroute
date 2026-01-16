# Loops Email Marketing Setup Guide

This document explains how to set up Loops for GroomRoute's automated email sequences.

## Prerequisites

1. Sign up at [loops.so](https://loops.so)
2. Get your API key from Settings > API
3. Add `LOOPS_API_KEY` to your environment variables

## Events Sent to Loops

Your app sends these events to Loops automatically:

| Event | Trigger | Purpose |
|-------|---------|---------|
| `signed_up` | User creates account | Start abandoned checkout sequence |
| `checkout_completed` | User completes Stripe checkout | Exit abandoned checkout sequence |
| `trial_converted` | First payment after trial | Update contact status |
| `subscription_canceled` | Subscription ends | Start winback sequence (after delay) |
| `resubscribed` | Previously canceled user resubscribes | Exit winback sequence |

## Contact Properties

Each contact has these custom properties:

- `accountId` - GroomRoute account ID
- `businessName` - Their grooming business name
- `plan` - Selected plan (starter/growth/pro)
- `signupDate` - When they signed up
- `cancelDate` - When they canceled (if applicable)
- `userGroup` - Current status: `signups`, `trial`, `paying`, `churned`

---

## Sequence 1: Abandoned Checkout

**Goal:** Recover users who signed up but didn't complete Stripe checkout

### Trigger
- Event: `signed_up`
- Exit condition: `checkout_completed` event received

### Emails

#### Email 1: 1 day after signup
**Subject:** "Still thinking about {businessName}?"

Hi {firstName},

You started setting up GroomRoute for {businessName} yesterday but didn't finish.

We get it - there's a lot to consider when choosing software for your grooming business. But here's what you're missing:

- **Optimized routes** that save 30-60 minutes per day
- **One-tap navigation** to your next appointment
- **Automatic "On My Way" texts** to your clients

Your 14-day free trial is waiting. No credit card required to try.

[Complete Your Setup →]

Questions? Just reply to this email.

---

#### Email 2: 3 days after signup
**Subject:** "Quick question, {firstName}"

Hi {firstName},

I noticed you started signing up for GroomRoute but didn't finish. Did something come up, or do you have questions I can help with?

Common questions we get:
- "Will my clients' data be safe?" → Yes, bank-level encryption
- "Can I import my existing schedule?" → Yes, from spreadsheets or other apps
- "What if I don't like it?" → Cancel anytime, no strings attached

If you're still interested, your account is ready to go:
[Continue Setup →]

Or just reply and let me know what's holding you back.

---

#### Email 3: 5 days after signup
**Subject:** "Before I close your spot..."

Hi {firstName},

I'm reaching out one last time about your GroomRoute account.

If now's not the right time, totally understand. Running a mobile grooming business is hectic.

But if you're still dealing with:
- Spending 30+ minutes planning routes each morning
- Clients asking "When will you be here?"
- Feeling exhausted from inefficient days

GroomRoute was built specifically to solve these problems for mobile groomers like you.

[Start Your Free Trial →]

This will be my last email about this. If you ever want to try it in the future, just visit groomroute.com.

---

#### Email 4: 7 days after signup (Final)
**Subject:** "Closing your account"

Hi {firstName},

Since you didn't complete your GroomRoute setup, I'm closing your pending account.

No worries at all - maybe the timing wasn't right.

If you ever want to try GroomRoute in the future, you can always sign up fresh at groomroute.com.

Wishing you and {businessName} all the best!

---

## Sequence 2: Customer Winback

**Goal:** Win back customers who canceled their subscription

### Trigger
- Event: `subscription_canceled`
- **Delay:** 60 days after event
- Exit condition: `resubscribed` event received

### Emails

#### Email 1: 60 days after cancellation
**Subject:** "We miss you at GroomRoute, {firstName}"

Hi {firstName},

It's been a couple months since {businessName} left GroomRoute. Hope you're doing well!

I wanted to check in and see how things are going. Have you found another solution that's working for you?

If you've been managing routes manually again, I thought you'd want to know about some updates we've made:
- [New Feature 1]
- [New Feature 2]
- [Improved Feature]

If you'd like to give us another try, use code COMEBACK20 for 20% off your first 3 months.

[Reactivate Your Account →]

No pressure - just wanted to reach out.

---

#### Email 2: 67 days after cancellation
**Subject:** "Quick question about {businessName}"

Hi {firstName},

I'm curious - what made you decide to leave GroomRoute?

Understanding what didn't work helps us improve. Whether it was:
- Missing features you needed
- Pricing concerns
- Technical issues
- Something else entirely

I'd genuinely appreciate knowing. Just hit reply - I read every response.

And if there's anything we can do to earn your business back, I'm all ears.

---

#### Email 3: 75 days after cancellation
**Subject:** "One more thing..."

Hi {firstName},

Last time I'll reach out about this.

If GroomRoute wasn't the right fit for {businessName}, I understand. Every grooming business is different.

But if you left because of something we could have done better, or if circumstances have changed, the door is always open.

Your data is still safe with us if you ever want to come back.

[Reactivate Account →]

Take care, and best of luck with your grooming business!

---

## Setup Instructions in Loops

### 1. Create Custom Properties

Go to **Settings > Custom Properties** and add:
- `accountId` (text)
- `businessName` (text)
- `plan` (text)
- `signupDate` (date)
- `cancelDate` (date)

### 2. Create User Groups

Go to **Audience > Groups** and create:
- `signups` - Users who signed up but haven't completed checkout
- `trial` - Users in their trial period
- `paying` - Active paying customers
- `churned` - Canceled customers

### 3. Create the Loops

**Abandoned Checkout Loop:**
1. Go to **Loops > Create Loop**
2. Trigger: Event `signed_up`
3. Add emails with delays (1 day, 3 days, 5 days, 7 days)
4. Exit condition: Event `checkout_completed`

**Winback Loop:**
1. Go to **Loops > Create Loop**
2. Trigger: Event `subscription_canceled`
3. Add 60-day delay first
4. Add emails with delays (0 days, 7 days, 15 days from trigger)
5. Exit condition: Event `resubscribed`

### 4. Test Before Going Live

Use Loops' test mode to send test emails to yourself:
1. Create a test contact with your email
2. Trigger events manually via their UI
3. Verify emails look correct

---

## Environment Variable

Add to your `.env`:

```
LOOPS_API_KEY=your_api_key_here
```

Get this from Loops dashboard: **Settings > API > Generate API Key**
