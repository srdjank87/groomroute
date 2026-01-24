# GroomRoute Email Sequences for Loops

This document contains all email sequences to set up in Loops for automated marketing and onboarding.

---

## Events to Track (Send from App to Loops)

Before setting up sequences, ensure these events are being sent to Loops:

| Event Name | Trigger | Already Implemented |
|------------|---------|---------------------|
| `signed_up` | User creates account | Yes |
| `checkout_completed` | Stripe checkout done | Yes |
| `trial_converted` | First payment made | Yes |
| `subscription_canceled` | Subscription canceled | Yes |
| `resubscribed` | Churned user resubscribes | Yes |
| `customer_added` | First customer created | **Add to app** |
| `appointment_created` | First appointment created | **Add to app** |
| `route_optimized` | First route optimization | **Add to app** |
| `pwa_installed` | PWA installed | **Add to app** |

---

## Sequence 1: Onboarding - No Customers Added

**Trigger:** `checkout_completed` event
**Exit Condition:** `customer_added` event received
**Goal:** Get users to add their first customer

### Email 1: Day 1 (24 hours after checkout)

**Subject:** Ready to add your first customer?

**Body:**
```
Hi {{firstName}},

Welcome to GroomRoute! You've taken the first step toward a more organized grooming business.

The next step? Add your first customer.

It only takes 30 seconds:
1. Go to Customers → Add Customer
2. Enter their name, address, and pet info
3. That's it!

Once you have customers in the system, you can start scheduling appointments and optimizing your routes.

[Add Your First Customer →]

Need to import existing customers? Reply to this email and we'll help you get set up.

Happy grooming!
The GroomRoute Team
```

### Email 2: Day 3 (72 hours after checkout)

**Subject:** Your customer list is waiting

**Body:**
```
Hi {{firstName}},

Just checking in! We noticed you haven't added any customers yet.

Here's what you're missing out on:
• One-tap access to customer addresses for navigation
• Complete pet profiles with grooming notes
• Appointment history at your fingertips
• Smart scheduling based on location

Most groomers start by adding just 5-10 of their regular customers. It takes about 10 minutes and makes a huge difference.

[Add Customers Now →]

Pro tip: You can add customers right from your phone. Just open GroomRoute and tap the + button.

Questions? Just reply to this email!

The GroomRoute Team
```

### Email 3: Day 5 (120 hours after checkout)

**Subject:** Let's get you started (personal offer)

**Body:**
```
Hi {{firstName}},

I wanted to reach out personally. I'm [Name], one of the founders of GroomRoute.

I noticed you signed up but haven't added any customers yet. I want to make sure there's nothing blocking you from getting value from GroomRoute.

Is there something we can help with?
• Need help importing your customer list?
• Not sure how to get started?
• Having technical issues?

Just reply to this email and let me know. I read every response personally.

If you're just busy (we get it - grooming is demanding!), here's a quick way to get started: add just ONE customer today. That's it. One customer, one pet. Takes 60 seconds.

[Add One Customer →]

Looking forward to hearing from you,
[Name]
GroomRoute Co-founder
```

---

## Sequence 2: Onboarding - No Appointments Scheduled

**Trigger:** `customer_added` event (first customer)
**Exit Condition:** `appointment_created` event received
**Goal:** Get users to schedule their first appointment

### Email 1: Day 1 (24 hours after first customer added)

**Subject:** Time to schedule your first appointment

**Body:**
```
Hi {{firstName}},

Great job adding your first customer! Now let's put them on the calendar.

Scheduling in GroomRoute is simple:
1. Go to Dashboard → tap any date
2. Click "Add Appointment"
3. Select your customer and pick a time
4. Done!

[Schedule Your First Appointment →]

Once you have a few appointments scheduled, you can use route optimization to find the best order - saving you time and gas money.

Happy grooming!
The GroomRoute Team
```

### Email 2: Day 3

**Subject:** Your route is ready to optimize

**Body:**
```
Hi {{firstName}},

You've got customers in the system - now let's put them to work!

Here's how most successful groomers use GroomRoute:

**Morning Routine:**
1. Open the app
2. View today's appointments
3. Tap "Optimize Route"
4. Follow the suggested order

That's it. No more figuring out which customer to visit first or backtracking across town.

But first, you need appointments on the calendar.

[Add Your First Appointment →]

Already have appointments in another calendar? You can view them side-by-side and move them over as you go.

The GroomRoute Team
```

---

## Sequence 3: Trial Ending Reminder

**Trigger:** 3 days before trial ends (use Loops delay from `checkout_completed`)
**Exit Condition:** `trial_converted` event
**Goal:** Convert trial to paid subscription

### Email 1: 3 Days Before Trial Ends

**Subject:** Your trial ends in 3 days

**Body:**
```
Hi {{firstName}},

Just a heads up - your GroomRoute trial ends in 3 days.

Here's what you've accomplished so far:
[Dynamic: show stats if possible, or generic encouragement]

To keep using GroomRoute without interruption, make sure your payment method is up to date.

[Update Payment Method →]

Questions about pricing? Here's a quick breakdown:
• Starter: $29/month - Perfect for solo groomers
• Growth: $49/month - For growing businesses
• Pro: $99/month - For teams with multiple groomers

Not sure which plan is right for you? Reply to this email and we'll help you decide.

The GroomRoute Team
```

### Email 2: 1 Day Before Trial Ends

**Subject:** Last day of your free trial

**Body:**
```
Hi {{firstName}},

Your GroomRoute trial ends tomorrow.

If you've been enjoying GroomRoute, now's the time to make sure you don't lose access to:
• Your customer database
• Your appointment history
• Route optimization
• Everything you've set up

[Continue with GroomRoute →]

If GroomRoute isn't the right fit, no hard feelings! Your data will be saved for 30 days in case you change your mind.

But if you're planning to continue, update your payment method today to avoid any interruption.

The GroomRoute Team
```

### Email 3: Trial Expired (Day 0)

**Subject:** Your trial has ended - here's what happens next

**Body:**
```
Hi {{firstName}},

Your GroomRoute trial has ended, but your account and all your data are still here waiting for you.

To pick up right where you left off:

[Reactivate Your Account →]

Your customers, appointments, and settings are all saved. Just add a payment method and you're back in business.

If you have any questions or need more time to decide, just reply to this email. We're here to help.

The GroomRoute Team
```

---

## Sequence 4: First Route Optimization Nudge

**Trigger:** `appointment_created` event (when they have 2+ appointments on same day)
**Exit Condition:** `route_optimized` event
**Goal:** Get users to experience the core value - route optimization

### Email 1: Same day or next day

**Subject:** Ready to optimize your route?

**Body:**
```
Hi {{firstName}},

Nice! You've got multiple appointments scheduled. This is where GroomRoute really shines.

Here's the magic moment:
1. Open your Dashboard
2. Look at a day with 2+ appointments
3. Tap "Optimize Route"
4. Watch GroomRoute find the best order

It considers:
• Driving distance between stops
• Time windows you've set
• Real-time traffic (when navigating)

Most groomers save 30-60 minutes per day just by following the optimized order.

[Try Route Optimization →]

Let us know what you think!

The GroomRoute Team
```

---

## Sequence 5: PWA Installation Reminder

**Trigger:** `checkout_completed` event + 5 days delay (configure in Loops)
**Exit Condition:** `pwa_installed` event
**Goal:** Get users to install the mobile app

### Email 1: 5 Days After Checkout

**Subject:** Quick tip: Add GroomRoute to your home screen

**Body:**
```
Hi {{firstName}},

You've been using GroomRoute for a few days now - we hope it's making your grooming days smoother! Here's a quick tip to make things even easier:

**Add GroomRoute to Your Home Screen**

Install GroomRoute as an app on your phone for instant access - no searching through bookmarks or typing URLs. It works just like a native app!

**How to Install (30 seconds)**

On iPhone (Safari):
1. Open groomroute.com/dashboard in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"

On Android (Chrome):
1. Open groomroute.com/dashboard in Chrome
2. Tap the menu (three dots) at the top right
3. Tap "Install app" or "Add to Home screen"

[Open GroomRoute Now →]

Once installed, you'll have GroomRoute right on your home screen - perfect for checking your route each morning or updating appointments on the go.

Questions or need help? Just reply to this email!

Happy grooming!
The GroomRoute Team
```

---

## Sequence 6: Re-engagement (Inactive Users)

**Trigger:** No login for 7 days (track via `lastActiveAt` in database)
**Exit Condition:** User logs in (send `user_active` event)
**Goal:** Bring back inactive users

### Email 1: 7 Days Inactive

**Subject:** We miss you at GroomRoute

**Body:**
```
Hi {{firstName}},

It's been a week since you've logged into GroomRoute. Everything okay?

We're here if you need help with:
• Setting up your customer list
• Scheduling appointments
• Using route optimization
• Anything else!

[Log Back In →]

If you're swamped with grooming appointments (which is a good problem!), remember that GroomRoute works great on your phone. Quick check-ins between appointments are easy.

Just reply to this email if you have questions.

The GroomRoute Team
```

### Email 2: 14 Days Inactive

**Subject:** Is GroomRoute working for you?

**Body:**
```
Hi {{firstName}},

We noticed you haven't used GroomRoute in a couple weeks.

I wanted to personally check in and see if there's anything we can help with. Sometimes a quick 5-minute call can make all the difference in getting set up.

Would you be open to a quick chat? Just reply with a good time and I'll send you a calendar link.

Or if you're just taking a break from the app, no worries! Your data is safe and waiting whenever you're ready.

[Get Back to GroomRoute →]

Best,
The GroomRoute Team
```

---

## Sequence 7: Winback (Canceled Customers)

**Trigger:** `subscription_canceled` event + 60 day delay
**Exit Condition:** `resubscribed` event
**Goal:** Win back churned customers

*Note: This is already configured in the Loops integration.*

### Email 1: 60 Days After Cancellation

**Subject:** A lot has changed at GroomRoute

**Body:**
```
Hi {{firstName}},

It's been a couple months since you left GroomRoute. We've been busy making things better:

**What's New:**
• [List 2-3 recent feature updates]
• Improved route optimization
• Faster mobile experience

We'd love to have you back. As a returning customer, here's a special offer:

**Get 50% off your first month back**

Use code: WELCOMEBACK50

[Reactivate Your Account →]

No pressure - but if you're still doing mobile grooming, we think you'll love the improvements we've made.

The GroomRoute Team
```

### Email 2: 90 Days After Cancellation

**Subject:** One more thing...

**Body:**
```
Hi {{firstName}},

Last email, I promise!

If GroomRoute wasn't the right fit before, I understand. But I'm curious - what could we have done better?

Just hit reply and let me know. Your feedback helps us build a better product for mobile groomers everywhere.

And if you ever want to give us another try, the door is always open.

[Check Out GroomRoute →]

Thanks for being part of our journey,
The GroomRoute Team
```

---

## Sequence 8: Payment Failed

**Trigger:** `payment_failed` event (add to Stripe webhook)
**Exit Condition:** `payment_succeeded` event
**Goal:** Recover failed payments

### Email 1: Immediately

**Subject:** Action needed: Payment failed

**Body:**
```
Hi {{firstName}},

We tried to process your GroomRoute subscription payment, but it didn't go through.

This usually happens when:
• Card expired
• Insufficient funds
• Bank declined the transaction

To keep your account active, please update your payment method:

[Update Payment Method →]

Your account will remain active for 3 days while you sort this out. After that, you may lose access to your dashboard and customer data.

Need help? Just reply to this email.

The GroomRoute Team
```

### Email 2: 2 Days After Failed Payment

**Subject:** Your GroomRoute access expires tomorrow

**Body:**
```
Hi {{firstName}},

Quick reminder: your payment still hasn't gone through, and your account access expires tomorrow.

Don't lose access to:
• Your customer database
• Upcoming appointments
• Route optimization

It only takes 30 seconds to update your payment method:

[Fix Payment Now →]

If you're having trouble, reply to this email and we'll help.

The GroomRoute Team
```

---

## Sequence 9: NPS/Feedback Request

**Trigger:** 30 days after `trial_converted`
**Exit Condition:** Survey completed (track via link click or webhook)
**Goal:** Gather feedback and identify promoters

### Email 1: 30 Days After First Payment

**Subject:** Quick question (30 seconds)

**Body:**
```
Hi {{firstName}},

You've been using GroomRoute for a month now. We'd love to know how it's going!

**How likely are you to recommend GroomRoute to a fellow mobile groomer?**

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
Not likely                          Very likely

Just click a number above - that's it! (Optional: add a comment on the next page)

Your feedback helps us build a better product.

Thanks!
The GroomRoute Team
```

---

## SMS Sequences (Using Phone from Stripe)

Since we now collect phone numbers at checkout, consider these SMS sequences:

### SMS 1: Welcome (Day 0)
```
Welcome to GroomRoute! 🐕 Download the app to your home screen for quick access: groomroute.com/dashboard
```

### SMS 2: First Week Check-in (Day 3)
```
Hey {{firstName}}! How's GroomRoute going? Reply if you need any help getting started!
```

### SMS 3: Trial Ending (Day 11)
```
Your GroomRoute trial ends in 3 days. Keep your routes optimized: groomroute.com/settings/billing
```

---

## Loops Custom Properties Needed

Make sure these properties are set up in Loops:

| Property | Type | Description |
|----------|------|-------------|
| firstName | String | User's first name |
| lastName | String | User's last name |
| phone | String | Phone number for SMS |
| plan | String | Current subscription plan |
| businessName | String | Their business name |
| accountId | String | For tracking/support |
| signupDate | Date | When they signed up |
| userGroup | String | signups, trial, paying, churned |

---

## Implementation Checklist

### In Loops Dashboard:
- [ ] Create custom properties listed above
- [ ] Set up each sequence with appropriate triggers
- [ ] Configure exit conditions for each sequence
- [ ] Enable SMS for sequences that use it
- [ ] Set up the winback discount code in Stripe

### In GroomRoute App (Code Changes Needed):
- [x] Send `customer_added` event on first customer ✓ Implemented
- [x] Send `appointment_created` event on first appointment ✓ Implemented
- [x] Send `route_optimized` event on first optimization ✓ Implemented
- [x] Send `pwa_installed` event when PWA is installed ✓ Implemented
- [ ] Send `user_active` event on login (for re-engagement exit)
- [ ] Send `payment_failed` event from Stripe webhook

### Environment Variables:
```
LOOPS_API_KEY=your_loops_api_key
```

---

## Notes

1. **Personalization:** Use `{{firstName}}` for personalization in Loops
2. **Links:** Replace `[Button Text →]` with actual Loops button/link syntax
3. **Timing:** Adjust delays based on your user behavior data
4. **A/B Testing:** Consider testing subject lines for key emails
5. **Unsubscribe:** Loops handles unsubscribe automatically
6. **SMS Consent:** Ensure you have SMS consent during checkout (Stripe collects this with phone)
