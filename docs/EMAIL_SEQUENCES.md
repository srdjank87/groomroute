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
| `booking_enabled` | Groomer enables online booking | No |
| `booking_received` | New booking from public booking page | No |

---

## Sequence 0: Abandoned Checkout

Trigger: signed_up event
Exit Condition: hasCompletedCheckout = true (Audience Filter)
Goal: Get users who signed up but didn't complete Stripe checkout to start their trial

### Email 1: 1 Hour After Signup

Subject: You're almost there, {{firstName}}!

Body:

Hi {{firstName}},

You started signing up for GroomRoute but didn't quite finish. No worries - your spot is saved!

**Your free trial is just one click away.**

Complete your signup now and get:
• 14 days of full access — no charge today, you won't be billed until your trial ends
• Route optimization to save hours every week
• Client management that actually makes sense
• The calm, organized days you deserve

[Complete Your Free Trial →]

It takes less than 60 seconds to finish.

See you inside!
The GroomRoute Team

P.S. Have questions before signing up? Just reply to this email - we're happy to help.


### Email 2: Day 1 (24 hours after signup)

Subject: Still thinking about it?

Body:

Hi {{firstName}},

We noticed you started signing up for GroomRoute yesterday but haven't finished yet.

**Here's what other mobile groomers are saying:**

"I used to spend 45 minutes every morning figuring out my route. Now it takes me 30 seconds." - Sarah M.

"I finally have time to eat lunch between appointments." - Mike T.

"My clients love that I'm never late anymore." - Jennifer K.

Your trial is completely free for 14 days. No tricks, no hassle.

[Start My Free Trial →]

If something's holding you back, just reply to this email. I'd love to help.

The GroomRoute Team


### Email 3: Day 3 (72 hours after signup) - Founder Email

Subject: Quick question from Srdjan

Body:

Hi {{firstName}},

I'm Srdjan, one of the founders of GroomRoute.

I noticed you signed up a few days ago but haven't started your trial yet. I wanted to reach out personally and ask:

**Is there anything I can help with?**

Sometimes the timing isn't right, and that's okay. But if you have questions about:
• How GroomRoute works
• Whether it's right for your business
• Pricing or the trial

...just hit reply. I read every email personally.

We built GroomRoute specifically for mobile groomers because we saw how chaotic and exhausting the job can be. If there's a way I can help you have calmer days, I want to do that.

No pressure either way.

Srdjan
GroomRoute Co-Founder


### Email 4: Day 7 (Final reminder)

Subject: Last check-in about your GroomRoute trial

Body:

Hi {{firstName}},

This is my last email about your GroomRoute signup.

I won't keep filling your inbox, but I wanted to reach out one more time in case you're still on the fence.

**Before you go, here's what you'd be getting:**

✓ Routes optimized in seconds, not hours
✓ All your clients and pets in one place
✓ Less driving, less stress, more energy
✓ 14 days completely free to try it out

[Complete My Signup →]

If mobile grooming is working great for you without any route planning help, that's awesome! But if you ever feel like you're driving too much or running behind, we'll be here.

All the best,
The GroomRoute Team

---

## Sequence 0.5: Trial Ending Reminder

Trigger: checkout_completed event + 10 day delay
Exit Condition: trial_converted event (user already paid)
Goal: Transparent billing reminder that builds trust and reduces disputes

This single email goes out ~10-12 days into the trial, before auto-billing. It reduces support tickets, charge disputes, and angry cancellations while actually helping conversion through transparency.

### Email 1: Day 10 of Trial

Subject: Quick heads up about your trial

Body:

Hi {{firstName}},

Just a quick heads up: your GroomRoute trial ends in a few days.

**Here's what happens next:**

• Your trial ends on {{trialEndDate}}
• You'll be charged {{planPrice}}/month for the {{planName}} plan
• Your card ending in {{cardLast4}} will be billed automatically

**Before you decide, try this one thing:**

If you haven't yet, open your schedule and tap "Optimize Route" on a day with 2+ appointments. Watch it find the fastest order in seconds. That's the time savings you'll get every single day.

[Optimize a Route →]

**Want to make changes?**

No hard feelings if now isn't the right time. You can update your plan or cancel anytime from your account settings.

[Manage Subscription →]

Questions? Just reply to this email.

The GroomRoute Team

P.S. If GroomRoute has been saving you time, you don't need to do anything — your subscription will start automatically.

---

## Sequence 1: Onboarding - No Clients Added

Trigger: checkout_completed event
Exit Condition: hasAddedClient = false (Audience Filter)
Goal: Get users to add their first client

### Email 1: Day 1 (24 hours after checkout)

Subject: Ready to add your first client?

Body:

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


### Email 2: Day 3 (72 hours after checkout)

Subject: Your client list is waiting

Body:

Hi {{firstName}},

Just checking in! We noticed you haven't added any clients yet.

Here's what you're missing out on:
• One-tap access to client addresses for navigation
• Complete pet profiles with grooming notes
• Appointment history at your fingertips
• Smart scheduling based on location

Most groomers start by adding just 5-10 of their regular clients. It takes about 10 minutes and makes a huge difference.

[Add Clients Now →]

Questions? Just reply to this email!

The GroomRoute Team


### Email 3: Day 5 (120 hours after checkout)

Subject: Let's get you started (personal offer)

Body:

Hi {{firstName}},

I wanted to reach out personally. I'm Srdjan, one of the founders of GroomRoute.

I noticed you signed up but haven't added any clients yet. I want to make sure there's nothing blocking you from getting value from GroomRoute.

Is there something we can help with?
• Need help importing your client list?
• Not sure how to get started?
• Having technical issues?

Just reply to this email and let me know. I read every response personally.

If you're just busy (we get it - grooming is demanding!), here's a quick way to get started: add just ONE client today. That's it. One client, one pet. Takes 60 seconds.

[Add One Client →]

Looking forward to hearing from you,

Srdjan
GroomRoute Co-founder

---

## Sequence 2: Onboarding - No Appointments Scheduled

Trigger: customer_added event (first customer)
Exit Condition: appointment_created event received
Goal: Get users to schedule their first appointment

### Email 1: Day 1 (24 hours after first customer added)

Subject: Time to schedule your first appointment

Body:

Hi {{firstName}},

Great job adding your first client! Now let's put them on the calendar.

Scheduling in GroomRoute is simple:
1. Go to Dashboard → Appointments
2. Click "Add Appointment"
3. Select your client and pick a time
4. Done!

[Schedule Your First Appointment →]

Once you have a few appointments scheduled, you can use route optimization to find the best order - saving you time and gas money.

Happy grooming!
The GroomRoute Team


### Email 2: Day 3

Subject: Your route is ready to optimize

Body:

Hi {{firstName}},

You've got clients in the system - now let's put them to work!

Here's how most successful groomers use GroomRoute:

Morning Routine:
1. Open the app
2. View today's appointments
3. Tap "Optimize Route"
4. Follow the suggested order

That's it. No more figuring out which client to visit first or backtracking across town.

But first, you need appointments on the calendar.

[Add Your First Appointment →]

Already have appointments in another calendar? You can view them side-by-side and move them over as you go.

The GroomRoute Team


---

## Sequence 3: First Route Optimization Nudge

Trigger: appointment_created event (when they have 2+ appointments on same day)
Exit Condition: route_optimized event
Goal: Get users to experience the core value - route optimization

### Email 1: Same day or next day

Subject: Ready to optimize your route?

Body:

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


---

## Sequence 4: PWA Installation Reminder

Trigger: checkout_completed event + 5 days delay (configure in Loops)
Exit Condition: pwa_installed event
Goal: Get users to install the mobile app

### Email 1: 5 Days After Checkout

Subject: Quick tip: Add GroomRoute to your home screen

Body:

Hi {{firstName}},

You've been using GroomRoute for a few days now - we hope it's making your grooming days smoother! Here's a quick tip to make things even easier:

Add GroomRoute to Your Home Screen

Install GroomRoute as an app on your phone for instant access - no searching through bookmarks or typing URLs. It works just like a native app!

How to Install (30 seconds)

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


---

## Sequence 5: Re-engagement (Inactive Users)

Trigger: No login for 7 days (track via lastActiveAt in database)
Exit Condition: User logs in (send user_active event)
Goal: Bring back inactive users

### Email 1: 7 Days Inactive

Subject: We miss you at GroomRoute

Body:

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


### Email 2: 14 Days Inactive

Subject: Is GroomRoute working for you?

Body:

Hi {{firstName}},

We noticed you haven't used GroomRoute in a couple weeks.

I wanted to personally check in and see if there's anything we can help with. Sometimes a quick 5-minute call can make all the difference in getting set up.

Would you be open to a quick chat? Just reply with a good time and I'll send you a calendar link.

Or if you're just taking a break from the app, no worries! Your data is safe and waiting whenever you're ready.

[Get Back to GroomRoute →]

Best,
Sandra
GroomRoute Co-Founder


---

## Sequence 6: Winback (Canceled Customers)

Trigger: subscription_canceled event + 60 day delay
Exit Condition: resubscribed event
Goal: Win back churned customers

*Note: This is already configured in the Loops integration.*

### Email 1: 60 Days After Cancellation

Subject: A lot has changed at GroomRoute

Body:

Hi {{firstName}},

It's been a couple months since you left GroomRoute. We've been busy making things better:

What's New:
• [List 2-3 recent feature updates]
• Improved route optimization
• Faster mobile experience

We'd love to have you back. As a returning customer, here's a special offer:

Get 50% off your first month back

Use code: WELCOMEBACK50

[Reactivate Your Account →]

No pressure - but if you're still doing mobile grooming, we think you'll love the improvements we've made.

The GroomRoute Team


### Email 2: 90 Days After Cancellation

Subject: One more thing...

Body:

Hi {{firstName}},

Last email, I promise!

If GroomRoute wasn't the right fit before, I understand. But I'm curious - what could we have done better?

Just hit reply and let me know. Your feedback helps us build a better product for mobile groomers everywhere.

And if you ever want to give us another try, the door is always open.

[Check Out GroomRoute →]

Thanks for being part of our journey,
The GroomRoute Team


---

## Sequence 7: Payment Failed

Trigger: payment_failed event (add to Stripe webhook)
Exit Condition: payment_succeeded event
Goal: Recover failed payments

### Email 1: Immediately

Subject: Action needed: Payment failed

Body:

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


### Email 2: 2 Days After Failed Payment

Subject: Your GroomRoute access expires tomorrow

Body:

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


---

## Sequence 8: NPS/Feedback Request

Trigger: 30 days after trial_converted
Exit Condition: Survey completed (track via link click or webhook)
Goal: Gather feedback and identify promoters

### Email 1: 30 Days After First Payment

Subject: Quick question (30 seconds)

Body:

Hi {{firstName}},

You've been using GroomRoute for a month now. We'd love to know how it's going!

How likely are you to recommend GroomRoute to a fellow mobile groomer?

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
Not likely                          Very likely

Just click a number above - that's it! (Optional: add a comment on the next page)

Your feedback helps us build a better product.

Thanks!
The GroomRoute Team


---

## Sequence 9: Paying Member Nurture

Trigger: trial_converted event
Exit Condition: None (ongoing nurture sequence)
Goal: Engage paying customers, provide value, build loyalty, and encourage referrals

This is a long-term nurture sequence that starts when a trial converts to a paid subscription. It provides ongoing value through tips, education, and community building.

### Email 1: Day 0 (Immediately after trial converts)

Subject: Welcome to the GroomRoute family!

Body:

Hi {{firstName}},

Congratulations! You're officially a GroomRoute member.

Thank you for trusting us with your mobile grooming business. We're honored to be part of your daily routine.

**Here's what you can expect from us:**

• Regular tips to help you get the most out of GroomRoute
• Business insights from other successful mobile groomers
• First access to new features
• Priority support whenever you need it

**Your Quick Stats:**
You're joining a community of mobile groomers who collectively save over 500 hours per week on route planning. That's more time with family, more energy for clients, and less stress on the road.

If you ever need anything, just reply to this email. We read and respond to every message.

Here's to calmer grooming days ahead!

The GroomRoute Team


### Email 2: Day 3 (Power User Tips)

Subject: 3 features you might have missed

Body:

Hi {{firstName}},

Now that you're all set up, here are 3 power-user features that can save you even more time:

**1. Quick Reschedule**
Drag and drop appointments on your calendar to reschedule instantly. No need to delete and recreate.

**2. Pet Notes**
Add grooming notes to each pet's profile (temperament, preferred cuts, special instructions). They'll show up automatically on appointment day.

**3. Navigation Integration**
After optimizing your route, tap the "start driving" button to open driving directions in your preferred maps app. One-tap navigation to every stop.

[Open GroomRoute →]

Which feature will you try first?

The GroomRoute Team


### Email 3: Day 7 (Micro-feedback)

Subject: Quick question (one-liner reply)

Body:

Hi {{firstName}},

You've been using GroomRoute for a week now. One quick question:

**What's one thing you wish was easier?**

Just hit reply with whatever comes to mind — even a one-liner helps. I read every response.

The GroomRoute Team


### Email 4: Day 10 (Business Insight - Scheduling Strategies)

Subject: How top groomers plan their week

Body:

Hi {{firstName}},

After talking with hundreds of mobile groomers, we've noticed a pattern among the most successful ones:

**They plan their week on Sunday night.**

Here's the simple routine that works:

1. Sunday evening: Open GroomRoute and review the upcoming week
2. Look for scheduling gaps you can fill with recurring clients
3. Check for back-to-back appointments that might need buffer time
4. Optimize each day's route so you're ready to go

This 15-minute habit can save hours of stress during the week.

**Pro tip:** Block out lunch breaks and personal time as "appointments" so you don't accidentally overbook yourself.

[Plan Your Week →]

How do you plan your schedule? Reply and let us know - we love learning from our groomers.

The GroomRoute Team


### Email 5: Day 14 (Feature Spotlight - Route Optimization Deep Dive)

Subject: Getting the most out of route optimization

Body:

Hi {{firstName}},

Route optimization is the heart of GroomRoute. Here's how to squeeze every minute of saved time out of it:

**The Basics:**
• Works best with 3+ appointments per day
• Considers drive time between each stop
• Updates in real-time when you add or remove appointments

**Advanced Tips:**

**Set realistic appointment durations**
If you typically spend 90 minutes on a full groom, don't schedule 60. Accurate durations = accurate route times.

**Use time windows wisely**
If a client says "anytime after 10am," set that as their earliest time. GroomRoute will respect it while optimizing around it.

**Re-optimize after changes**
Added a last-minute appointment? Tap optimize again. The best route may have changed.

**Check time saved**
After optimizing, compare the original vs. optimized drive time. That difference? That's free time back in your day.

[Try It Now →]

Questions about optimization? Just reply - we're happy to help.

The GroomRoute Team


### Email 6: Day 21 (Customer Success Story) - Founder Email

Subject: How Maria cut her drive time in half

Body:

Hi {{firstName}},

I wanted to share a quick story from one of our groomers.

Maria runs a mobile grooming business in Phoenix. She was spending almost 2 hours a day just driving between clients - that's 10 hours a week.

After using GroomRoute for a month, she reorganized how she groups her clients by neighborhood. Now she clusters appointments by area and uses route optimization to connect the dots.

Her drive time dropped to under an hour a day.

That extra hour each day? She uses it for an additional appointment - which brings in an extra $3,000+ per month.

I love hearing stories like this. If GroomRoute is making a difference in your business, I'd love to hear about it.

Just hit reply - I read every message.

Srdjan
Co-Founder, GroomRoute


### Email 7: Day 30 (Referral Ask)

Subject: Know another groomer who'd love this?

Body:

Hi {{firstName}},

You've been with us for a month now, and we hope GroomRoute is making your days calmer and more organized.

Here's something you might not know: **Most of our groomers found us through a recommendation from another groomer.**

If GroomRoute has helped you, would you consider sharing it with a fellow mobile groomer?

**Why refer a friend:**
• They get a 14-day free trial to try it out
• You'll be helping them discover the same time savings you're enjoying
• Good karma for helping a fellow groomer!

[Share GroomRoute →]

No pressure at all. We just know that mobile groomers trust recommendations from other groomers more than anything we could say.

Thanks for being part of our community!

The GroomRoute Team


### Email 8: Day 45 (Advanced Tips - Busy Season Planning)

Subject: Preparing for your busy season

Body:

Hi {{firstName}},

Whether it's holiday season, summer, or spring shedding - every groomer has their busy periods. Here's how to handle the rush without burning out:

**1. Set Maximum Daily Appointments**
Know your limit. If 6 appointments is your max, don't book 8 just because clients are asking.

**2. Build in Buffer Days**
Leave one day per week lighter than usual for overflow, emergencies, or catch-up.

**3. Prioritize by Location**
During busy times, it's okay to be picky about new clients. Prioritize ones that fit your existing routes.

**4. Use Wait Lists**
Fully booked? Add clients to a mental (or actual) wait list for cancellations. GroomRoute makes it easy to slot them in.

**5. Batch Similar Appointments**
If you have several small dogs, group them together. You'll get into a rhythm and work more efficiently.

The goal isn't to do more appointments - it's to do the right appointments without exhausting yourself.

[Open Your Schedule →]

How do you handle busy season? We'd love to hear your tips.

The GroomRoute Team


### Email 9: Day 60 (Community Check-in) - Founder Email

Subject: How's it going?

Body:

Hi {{firstName}},

It's been 2 months since you joined GroomRoute. I wanted to personally check in.

How's everything going? Is GroomRoute helping you the way you hoped?

I'd genuinely love to know:
• What's working well for you?
• What could be better?
• Any features you wish we had?

Your feedback directly shapes what we build next. Many of our best features came from suggestions just like this.

Just hit reply and share your thoughts. I read every email personally.

Thanks for being part of the GroomRoute community.

Srdjan
Co-Founder, GroomRoute


### Email 10: Day 90 (Milestone Celebration)

Subject: 3 months together!

Body:

Hi {{firstName}},

You've been a GroomRoute member for 3 months!

We don't take that for granted. In a world of endless apps and subscriptions, you've chosen to make GroomRoute part of your daily routine. That means a lot to us.

**By now, you've probably:**
• Saved hours of route planning
• Never forgotten a client's pet notes
• Arrived at appointments calmer and more prepared

**What's next:**
We're always working on making GroomRoute better. Keep an eye on your inbox for updates, and remember - your feedback shapes our roadmap.

**One small ask:**
If you have a minute, a quick review on the App Store or Google Play helps other groomers find us. [Leave a Review →]

Here's to the next 3 months!

With gratitude,
The GroomRoute Team


### Email 11: Day 120 (Feature Request)

Subject: What would make GroomRoute better for you?

Body:

Hi {{firstName}},

Quick question: If you could add one feature to GroomRoute, what would it be?

We're always planning our next improvements, and your input matters more than you might think. Some ideas:

• Client reminders/notifications?
• Payment tracking?
• Team scheduling for multiple groomers?
• Something else entirely?

Just reply with your #1 wishlist item. Even a quick one-liner helps.

Thanks for helping us build the best tool for mobile groomers.

The GroomRoute Team


### Email 12: Day 180 (6-Month Anniversary)

Subject: Half a year with GroomRoute

Body:

Hi {{firstName}},

6 months! You're officially a GroomRoute veteran.

Thank you for sticking with us. Building a business is hard, and we're proud to be a small part of your journey.

**A request:** If GroomRoute has made a difference in your work, would you consider recommending us to one other mobile groomer? Your word-of-mouth is how we grow.

**A promise:** We'll keep working to make GroomRoute better, simpler, and more helpful. If you ever need anything, we're just an email away.

Here's to the next 6 months!

The GroomRoute Team


### Email 13: Day 365 (1-Year Anniversary)

Subject: Happy Anniversary!

Body:

Hi {{firstName}},

One year ago, you joined GroomRoute.

That's 365 days of organized schedules, optimized routes, and (hopefully) calmer grooming days.

Thank you for being with us for this entire journey. Seriously - it means the world.

We've grown a lot this year, and so much of that is because groomers like you believed in what we're building. Your feedback, your patience, and your word-of-mouth have shaped GroomRoute into what it is today.

**Here's to year two!**

If there's anything we can do to make your next year even better, just reply and let us know.

With deep appreciation,

The GroomRoute Team

---

## Sequence 10: Online Booking Enabled

Trigger: booking_enabled event
Exit Condition: None (single email)
Goal: Congratulate user on enabling online booking, teach them how to share their booking link

### Email 1: Immediately after enabling

Subject: Your booking page is live!

Body:

Hi {{firstName}},

Great news - your online booking page is now live! Clients can book appointments with you 24/7.

**Your booking link:**
{{bookingUrl}}

**Here's how it works:**

1. **Share your link** - Text it to clients, add it to your email signature, or post it on social media
2. **Clients enter their address** - We check if they're in your service area and suggest the best days
3. **They pick a time** - Based on your availability and working hours
4. **Booking appears on your calendar** - No back-and-forth texting needed

**Pro tips for sharing your link:**

• Add it to your Instagram bio or Facebook page
• Include it in appointment confirmation texts
• Put it on your business cards
• Add a "Book Now" button to your website

**Calm-first booking:**

Your booking page respects your service areas and workload limits. Clients in areas you serve on specific days will see those days recommended first - keeping your routes tight and your energy protected.

[View Your Booking Page →]

Questions about online booking? Just reply to this email.

The GroomRoute Team

P.S. You can customize your booking URL and turn it off anytime from Settings → Online Booking.


---

## Sequence 11: First Booking Received

Trigger: booking_received event (first time only)
Exit Condition: None (single celebration email)
Goal: Celebrate first online booking, reinforce the value

### Email 1: Immediately after first booking

Subject: You just got your first online booking!

Body:

Hi {{firstName}},

Congratulations - you just received your first booking through your online booking page!

**What just happened:**

A client visited your booking link, entered their address, picked a date and time, and booked an appointment - all without you having to answer a text, call, or email.

That's the magic of 24/7 booking. While you were grooming (or sleeping, or eating lunch), your business was still accepting appointments.

**What's next:**

• The appointment is already on your calendar
• The client's address is saved
• You'll see them on your route when that day comes

**Want more bookings?**

The more you share your link, the more bookings you'll get. Try:

• Texting it to your regular clients who always text to rebook
• Adding it to your "thank you" message after appointments
• Posting it on social media with "Book your next groom!"

[Share Your Booking Link →]

Here's to many more hands-free bookings!

The GroomRoute Team


---

## Sequence 12: Online Booking Nudge (For users who haven't enabled it)

Trigger: trial_converted event + 14 day delay
Exit Condition: hasEnabledBooking = true (Audience Filter)
Goal: Encourage users to try online booking

### Email 1: 14 Days After Converting to Paid

Subject: Let clients book while you groom

Body:

Hi {{firstName}},

Quick question: How much time do you spend each week scheduling appointments?

Between text messages, phone calls, and back-and-forth about availability, it adds up. Many groomers tell us it's 30-60 minutes a day.

**What if clients could book themselves?**

GroomRoute now has online booking - your own personal booking page where clients can:

• See your availability in real-time
• Pick a date and time that works for them
• Book instantly without waiting for a response

**The best part?**

It respects your service areas and workload limits. Clients only see days you're available in their area, so your routes stay tight and you don't overbook.

**Setting it up takes 60 seconds:**

1. Go to Settings → Online Booking
2. Toggle it on
3. Copy your personal booking link
4. Share it with clients

[Set Up Online Booking →]

Imagine finishing a groom and seeing a new booking already on your calendar - without touching your phone. That's what online booking does.

The GroomRoute Team


### Email 2: 21 Days After Converting (if still not enabled)

Subject: "I wish I'd done this sooner"

Body:

Hi {{firstName}},

That's what groomers tell us after setting up online booking.

The back-and-forth to schedule appointments is one of the most draining parts of running a mobile grooming business. Every text, every call, every "what time works for you?" takes energy.

**Here's what online booking gives you:**

✓ **24/7 availability** - Clients book while you're grooming, sleeping, or on vacation
✓ **Zero back-and-forth** - They see your openings and pick one
✓ **Smarter scheduling** - Bookings respect your service areas and days
✓ **Protected energy** - Your workload limits prevent overbooking

**One groomer's experience:**

"I used to spend my lunch break returning calls about scheduling. Now I actually eat lunch. Clients love that they can book anytime, and I love that I don't have to think about it." - Michelle R.

[Turn On Online Booking →]

Takes 60 seconds. Try it for a week and see what you think.

The GroomRoute Team

---

## SMS Sequences (Using Phone from Stripe)

Since we now collect phone numbers at checkout, consider these SMS sequences:

### SMS 1: Welcome (Day 0)

Welcome to GroomRoute! 🐕 Download the app to your home screen for quick access: groomroute.com/dashboard

### SMS: First Customer Nudge (Day 2 - if no customers added)

Trigger: 48 hours after checkout_completed, exit on customer_added

{{firstName}}, ready to try GroomRoute? Add your first client in 30 seconds: groomroute.com/customers/new


### SMS: Route Optimization Nudge (EVERY DAY with 2+ appointments)

Trigger: Morning of day with 2+ appointments, exit on route_optimized

You've got {{count}} appointments today! Tap "Optimize" to find the fastest route: groomroute.com/dashboard


---

### Payment Recovery SMS Sequence

### SMS: Payment Failed - Immediate

Trigger: payment_failed event

⚠️ Your GroomRoute payment didn't go through. Update your card to keep access: groomroute.com/dashboard

#### SMS: Payment Failed - Day 2 (URGENT)

Trigger: 48 hours after payment_failed, exit on payment_succeeded

URGENT: Your account expires tomorrow. Fix payment in 30 seconds: groomroute.com/dashboard

---

### Re-engagement SMS Sequence

#### SMS: 7 Days Inactive

Trigger: 7 days since last user_active event

Hey {{firstName}}, we miss you! Open GroomRoute and check your schedule: groomroute.com/dashboard


#### SMS: 14 Days Inactive (Personal)

Trigger: 14 days since last user_active event

{{firstName}}, stuck on something? Reply to this text and I'll help you out! - The GroomRoute Team

---

### Winback SMS Sequence

#### SMS: 60 Days After Cancellation

Trigger: 60 days after subscription_canceled, exit on resubscribed
{{firstName}}, a lot has changed at GroomRoute! Come back with 50% off: groomroute.com/comeback (code: WELCOMEBACK50)


---

### Milestone & Celebration SMS

#### SMS: First Route Optimized

Trigger: route_optimized event (first time only)

🎉 You just optimized your first route! That's the GroomRoute magic. Keep it up: groomroute.com/dashboard

#### SMS: 7 Days Active

Trigger: 7 days of consecutive activity

You've been using GroomRoute for a week! How's it going? Reply with any feedback - we read everything.

#### SMS: 30 Days Paid (NPS)

Trigger: 30 days after trial_converted

{{firstName}}, you've been with us a month! Quick question: How likely are you to recommend GroomRoute? Reply 1-10

---


## Loops Custom Properties Needed

Make sure these properties are set up in Loops:

### Basic Contact Properties

| Property | Type | Description |
|----------|------|-------------|
| firstName | String | User's first name |
| lastName | String | User's last name |
| phone | String | Phone number for SMS |
| plan | String | Current subscription plan |
| planPrice | String | Monthly price display (e.g., "$79") |
| businessName | String | Their business name |
| accountId | String | For tracking/support |
| userGroup | String | signups, trial, paying, churned |
| cancelDate | String | ISO date when subscription was canceled |
| lastActiveAt | String | ISO date of last activity |
| trialEndDate | String | Formatted trial end date (e.g., "Friday, February 7") |
| cardLast4 | String | Last 4 digits of payment card (e.g., "4242") |
| bookingUrl | String | User's online booking page URL (e.g., "https://groomroute.com/book/johns-grooming") |
| bookingSlug | String | User's booking slug (e.g., "johns-grooming") |

### Audience Filter Properties (Boolean)

These properties are used for **Audience Filters** to exit users from sequences:

| Property | Type | Used By Sequence | Filter Condition |
|----------|------|------------------|------------------|
| hasCompletedCheckout | Boolean | Abandoned Checkout | `= false` to stay in sequence |
| hasAddedClient | Boolean | No Clients Added | `= false` to stay in sequence |
| hasCreatedAppointment | Boolean | No Appointments | `= false` to stay in sequence |
| hasOptimizedRoute | Boolean | Route Optimization Nudge | `= false` to stay in sequence |
| hasInstalledPwa | Boolean | PWA Reminder | `= false` to stay in sequence |
| isActive | Boolean | Re-engagement | `= false` to stay in sequence |
| hasPaymentFailed | Boolean | Payment Failed | `= true` to stay in sequence |
| hasResubscribed | Boolean | Winback | `= false` to stay in sequence |
| hasEnabledBooking | Boolean | Online Booking Nudge | `= false` to stay in sequence |
| hasReceivedBooking | Boolean | First Booking Celebration | `= false` to trigger celebration |

*Note: Loops has a built-in createdAt property, so no need for a custom signupDate.*

---

## How Exit Conditions Work (Using Audience Filters)

Loops doesn't have traditional "exit conditions". Instead, use **Audience Filters** with the "All following nodes" option:

### Setup for Each Sequence:

1. **Add an Audience Filter** right after the trigger
2. **Set the condition** based on the boolean property
3. **Choose "All following nodes"** so it's checked at every step
4. When the property changes, the contact is removed at the next node

### Example: No Clients Added Sequence

```
Flow:
├── Trigger: checkout_completed event
├── Audience Filter: hasAddedClient = false  ← "All following nodes"
├── Timer: 24 hours
├── Email 1
├── Timer: 48 hours
├── Email 2
└── ...
```

When the user adds their first client, `hasAddedClient` is set to `true` by our API. At the next node (timer or email), the contact no longer matches the filter and exits the sequence.

---

## Sequence Configuration Summary

| Sequence | Trigger Event | Audience Filter | Filter Value |
|----------|---------------|-----------------|--------------|
| Abandoned Checkout | `signed_up` | hasCompletedCheckout | `= false` |
| Trial Ending Reminder | `checkout_completed` + 10 day delay | userGroup | `= trial` |
| No Clients Added | `checkout_completed` | hasAddedClient | `= false` |
| No Appointments | `customer_added` | hasCreatedAppointment | `= false` |
| Route Optimization | `appointment_created` | hasOptimizedRoute | `= false` |
| PWA Reminder | `checkout_completed` + 5 day delay | hasInstalledPwa | `= false` |
| Re-engagement | Cron/scheduled (isActive = false) | isActive | `= false` |
| Payment Failed | `payment_failed` | hasPaymentFailed | `= true` |
| Winback | `subscription_canceled` + 60 day delay | hasResubscribed | `= false` |
| Paying Member Nurture | `trial_converted` | None (ongoing) | N/A |
| Online Booking Enabled | `booking_enabled` | None (single email) | N/A |
| First Booking Received | `booking_received` | hasReceivedBooking | `= false` (first time only) |
| Online Booking Nudge | `trial_converted` + 14 day delay | hasEnabledBooking | `= false` |

---

## Implementation Checklist

### In Loops Dashboard:
- [ ] Create all custom properties listed above (both basic and boolean)
- [ ] Set up each sequence with the trigger event
- [ ] Add Audience Filter after each trigger with "All following nodes" selected
- [ ] Configure the filter condition per the table above
- [ ] Enable SMS for sequences that use it
- [ ] Set up the winback discount code in Stripe (WELCOMEBACK50)

### In GroomRoute App (Code Changes):
- [x] Send signed_up event + set hasCompletedCheckout=false ✓ Implemented
- [x] Send checkout_completed event + set hasCompletedCheckout=true + initialize all boolean props ✓ Implemented
- [x] Send customer_added event + set hasAddedClient=true ✓ Implemented
- [x] Send appointment_created event + set hasCreatedAppointment=true ✓ Implemented
- [x] Send route_optimized event + set hasOptimizedRoute=true ✓ Implemented
- [x] Send pwa_installed event + set hasInstalledPwa=true ✓ Implemented
- [x] Send user_active event + set isActive=true on login ✓ Implemented
- [x] Send payment_failed event + set hasPaymentFailed=true ✓ Implemented
- [x] Send payment_succeeded event + set hasPaymentFailed=false ✓ Implemented
- [x] Send subscription_canceled event + set hasResubscribed=false ✓ Implemented
- [x] Send resubscribed event + set hasResubscribed=true ✓ Implemented
- [x] Create cron job to set isActive=false for users inactive 7+ days ✓ Implemented
- [ ] Send booking_enabled event + set hasEnabledBooking=true + set bookingUrl when groomer enables online booking
- [ ] Send booking_received event + set hasReceivedBooking=true when first booking is received from public page

### Environment Variables:

```
LOOPS_API_KEY=your_loops_api_key
CRON_SECRET=your_cron_secret  # Optional: for securing cron endpoints
```

---

## Notes

1. **Personalization:** Use {{firstName}} for personalization in Loops
2. **Links:** Replace [Button Text →] with actual Loops button/link syntax
3. **Timing:** Adjust delays based on your user behavior data
4. **A/B Testing:** Consider testing subject lines for key emails
5. **Unsubscribe:** Loops handles unsubscribe automatically
6. **SMS Consent:** Ensure you have SMS consent during checkout (Stripe collects this with phone)
7. **Re-engagement:** Requires a cron job to periodically set `isActive=false` for users who haven't logged in for 7+ days, which triggers them into the re-engagement sequence


