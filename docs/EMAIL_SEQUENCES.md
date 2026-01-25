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
| `customer_added` | First customer created | Yes |
| `appointment_created` | First appointment created | Yes |
| `route_optimized` | First route optimization | Yes |
| `pwa_installed` | PWA installed | Yes |
| `user_active` | User logs in | Yes |
| `payment_failed` | Invoice payment fails | Yes |
| `payment_succeeded` | Payment recovered after failure | Yes |

---

## Sequence 1: Onboarding - No Customers Added

**Trigger:** `checkout_completed` event
**Exit Condition:** `customer_added` event received
**Goal:** Get users to add their first customer

### Email 1: Day 1 (24 hours after checkout)

**Subject:** Ready to add your first client?

**Body:**
```
Hi {{firstName}},

Welcome to GroomRoute! You've taken the first step toward a more organized grooming business.

The next step? Add your first client.

It only takes 30 seconds:
1. Go to Clients → Add Client
2. Enter their name, address, and pet info
3. That's it!

Once you have clients in the system, you can start scheduling appointments and optimizing your routes.

[Add Your First Client →]

Need to import existing clients? Reply to this email and we'll help you get set up.

Happy grooming!
The GroomRoute Team
```

### Email 2: Day 3 (72 hours after checkout)

**Subject:** Your client list is waiting

**Body:**
```
Hi {{firstName}},

Just checking in! We noticed you haven't added any clients yet.

Here's what you're missing out on:
• One-tap access to client addresses for navigation
• Complete pet profiles with grooming notes
• Appointment history at your fingertips
• Smart scheduling based on location

Most groomers start by adding just 5-10 of their regular clients. It takes about 10 minutes and makes a huge difference.

[Add Clients Now →]

Pro tip: You can add clients right from your phone. Just open GroomRoute and tap the + button.

Questions? Just reply to this email!

The GroomRoute Team
```

### Email 3: Day 5 (120 hours after checkout)

**Subject:** Let's get you started (personal offer)

**Body:**
```
Hi {{firstName}},

I wanted to reach out personally. I'm [Name], one of the founders of GroomRoute.

I noticed you signed up but haven't added any clients yet. I want to make sure there's nothing blocking you from getting value from GroomRoute.

Is there something we can help with?
• Need help importing your client list?
• Not sure how to get started?
• Having technical issues?

Just reply to this email and let me know. I read every response personally.

If you're just busy (we get it - grooming is demanding!), here's a quick way to get started: add just ONE client today. That's it. One client, one pet. Takes 60 seconds.

[Add One Client →]

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

Great job adding your first client! Now let's put them on the calendar.

Scheduling in GroomRoute is simple:
1. Go to Dashboard → tap any date
2. Click "Add Appointment"
3. Select your client and pick a time
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

You've got clients in the system - now let's put them to work!

Here's how most successful groomers use GroomRoute:

**Morning Routine:**
1. Open the app
2. View today's appointments
3. Tap "Optimize Route"
4. Follow the suggested order

That's it. No more figuring out which client to visit first or backtracking across town.

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
• Your client database
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

Your clients, appointments, and settings are all saved. Just add a payment method and you're back in business.

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
• Setting up your client list
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

We'd love to have you back. As a returning member, here's a special offer:

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

Your account will remain active for 3 days while you sort this out. After that, you may lose access to your dashboard and client data.

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
• Your client database
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

SMS is powerful for time-sensitive nudges. Keep messages under 160 characters when possible. Use SMS to complement email - don't send both at the same time.

**Best Practices:**
- Send SMS during business hours (8am-8pm local time)
- Limit to 2-3 SMS per sequence max
- Always include a short link to take action
- Use SMS for high-priority or time-sensitive moments
- Include opt-out info in your Loops settings

---

### Onboarding SMS Sequence

#### SMS: Welcome (Immediately after checkout)
```
Welcome to GroomRoute, {{firstName}}! 🐕 Add it to your home screen for quick access each morning: groomroute.com/dashboard

Reply STOP to opt out
```
*Trigger: `checkout_completed` event*

#### SMS: First Client Nudge (Day 2 - if no clients added)
```
{{firstName}}, ready to try GroomRoute? Add your first client in 30 seconds: groomroute.com/clients/new
```
*Trigger: 48 hours after `checkout_completed`, exit on `customer_added`*

#### SMS: First Appointment Nudge (Day 1 after first client)
```
Nice! Now schedule an appointment for that client and see the magic: groomroute.com/dashboard
```
*Trigger: 24 hours after `customer_added`, exit on `appointment_created`*

#### SMS: Route Optimization Nudge (Same day as 2+ appointments)
```
You've got {{count}} appointments today! Tap "Optimize" to find the fastest route: groomroute.com/dashboard
```
*Trigger: Morning of day with 2+ appointments, exit on `route_optimized`*

---

### Payment Recovery SMS Sequence

#### SMS: Payment Failed - Immediate
```
⚠️ Your GroomRoute payment didn't go through. Update your card to keep access: groomroute.com/dashboard
```
*Trigger: `payment_failed` event*

#### SMS: Payment Failed - Day 2 (URGENT)
```
URGENT: Your account expires tomorrow. Fix payment in 30 seconds: groomroute.com/dashboard
```
*Trigger: 48 hours after `payment_failed`, exit on `payment_succeeded`*

---

### Re-engagement SMS Sequence

#### SMS: 7 Days Inactive
```
Hey {{firstName}}, we miss you! Open GroomRoute and check your schedule: groomroute.com/dashboard
```
*Trigger: 7 days since last `user_active` event*

#### SMS: 14 Days Inactive (Personal)
```
{{firstName}}, stuck on something? Reply to this text and I'll help you out! - The GroomRoute Team
```
*Trigger: 14 days since last `user_active` event*

---

### Winback SMS Sequence

#### SMS: 60 Days After Cancellation
```
{{firstName}}, a lot has changed at GroomRoute! Come back with 50% off: groomroute.com/comeback (code: WELCOMEBACK50)
```
*Trigger: 60 days after `subscription_canceled`, exit on `resubscribed`*

---

### Milestone & Celebration SMS

#### SMS: First Route Optimized
```
🎉 You just optimized your first route! That's the GroomRoute magic. Keep it up: groomroute.com/dashboard
```
*Trigger: `route_optimized` event (first time only)*

#### SMS: 7 Days Active
```
You've been using GroomRoute for a week! How's it going? Reply with any feedback - we read everything.
```
*Trigger: 7 days of consecutive activity*

#### SMS: 30 Days Paid (NPS)
```
{{firstName}}, you've been with us a month! Quick question: How likely are you to recommend GroomRoute? Reply 1-10
```
*Trigger: 30 days after `trial_converted`*

---

### Operational SMS (Transactional)

These are not marketing - they're service messages. Consider sending from app, not Loops.

#### SMS: Appointment Reminder (Optional - if enabled by user)
```
Reminder: {{petName}} ({{clientName}}) at {{time}} tomorrow. View route: groomroute.com/dashboard
```
*Trigger: Day before appointment, user must opt-in*

#### SMS: Running Late Confirmation
```
Got it! We've notified your remaining clients that you're running {{delay}} minutes late.
```
*Trigger: User taps "Running Late" in app*

---

### SMS Timing Matrix

| Event | Email | SMS | Notes |
|-------|-------|-----|-------|
| Checkout completed | Immediately | Immediately | Both OK - different purposes |
| No clients (Day 2) | Day 1 | Day 2 | Stagger to avoid fatigue |
| No appointments (Day 2) | Day 1 | Day 2 | SMS if email ignored |
| Trial ending (3 days) | Day 11 | Day 11 AM | Send SMS in morning |
| Trial ending (1 day) | Day 13 | Day 13 AM | High urgency |
| Payment failed | Immediately | Immediately | Both - critical |
| Payment failed (Day 2) | Day 2 | Day 2 | Last warning |
| Inactive (7 days) | Day 7 | Day 7 | Pick one, not both |
| Inactive (14 days) | Day 14 | Day 14 | Personal outreach |
| Winback (60 days) | Day 60 | Day 60 | Special offer |

---

### SMS A/B Test Ideas

1. **With/Without Emoji:** Test if 🐕 improves click rates
2. **Urgency Words:** "URGENT" vs "Quick reminder"
3. **Personalization:** First name vs business name
4. **Time of Day:** 8am vs 10am vs 6pm sends
5. **Short vs Detailed:** One-liner vs two sentences

---

### SMS Character Limits

- **Standard SMS:** 160 characters
- **With special chars/emoji:** 70 characters per segment
- **Loops personalization:** `{{firstName}}` counts as ~10 chars average

**Example character counts:**
```
Welcome to GroomRoute! Add your first client: groomroute.com/clients/new
[74 characters - ✓ Single SMS]

Hey {{firstName}}, your GroomRoute trial ends tomorrow! Update your payment method to keep access to your clients and routes: groomroute.com/billing
[153 characters - ✓ Single SMS, but tight]
```

---

### SMS Consent & Compliance

1. **Collect consent at checkout** - Stripe can capture this with the phone field
2. **Include opt-out** - "Reply STOP to opt out" on first marketing SMS
3. **Honor opt-outs immediately** - Loops handles this automatically
4. **Separate transactional from marketing** - Appointment reminders are transactional, winback is marketing
5. **Keep records** - Loops tracks consent automatically

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
| userGroup | String | signups, trial, paying, churned |

*Note: Loops has a built-in `createdAt` property, so no need for a custom signupDate.*

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
- [x] Send `user_active` event on login (for re-engagement exit) ✓ Implemented
- [x] Send `payment_failed` event from Stripe webhook ✓ Implemented
- [x] Send `payment_succeeded` event from Stripe webhook ✓ Implemented

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
