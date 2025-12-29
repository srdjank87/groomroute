# GroomRoute – Landing Page, Calm Control, Pricing Trial, & System Expansion Master Update Spec

This document consolidates **all recent strategic decisions** about GroomRoute’s:
- Landing page updates
- Calm Control / Rescue My Day positioning & UX direction
- Card-required free trial onboarding flow
- System feature evolution based on real market behavior
- Product philosophy alignment

Designed for implementation by engineering + design teams + code agent.

---

# 1️⃣ Core Product Evolution Summary

GroomRoute is evolving from:
> “Smart routing + convenience tool”

to:
> **“The intelligent operations + emotional safety platform for mobile groomers.”**

Key pillars now include:
- One-tap optimized routing
- Calendar sync + import
- Cancellation revenue protection
- Calm Control & Rescue My Day
- Workload intelligence (dog size, complexity, burnout)
- Territory / gas & travel efficiency
- Offline resilience
- Premium onboarding experience (card-required free trial)

---

# 2️⃣ Landing Page Update — Content & Story Overhaul

We are NOT redesigning the structure.
We are strengthening messaging, emotional resonance, and professional clarity.

## HERO SECTION — Small Enhancement
Keep comic panel + hero layout.

**Updated Subheadline:**
> The only mobile grooming app built to make your workday calmer, smarter, and more profitable — with one-tap routing, crisis rescue, and a system that actually understands how demanding grooming really is.

**Optional supporting micro-line:**
> Smart enough to know the difference between a chihuahua day and a doodle day.

**Hero Trial Line Change**
Replace:
> “No credit card required”

With:
> **14-day free trial. Cancel anytime. Card required.**

---

## BEFORE / AFTER SECTION
Keep visuals + layout. Update pill content.

### BEFORE Pills — Add:
- Days stacked with too many big dogs
- Driving everywhere, wasting fuel + time
- No-shows destroy your income
- Your body and brain are exhausted

### AFTER Pills — Add:
- Balanced days that protect your body
- Tight, efficient routes
- Automatic cancellation recovery
- Your work finally feels sustainable

---

## FEATURE SECTION — Upgrade Language + Add Workload Card

### Feature: Optimized Routing
**New Title:**
> One-Tap Optimized Routes — Built for the Real World

**Copy:**
> GroomRoute doesn’t just reorder stops — it helps you plan smarter days. Save 45–90 minutes daily, reduce mileage, and stop driving all over town. Supports “area days” so you can work one neighborhood at a time.

---

### Feature: Running Late Automation
Keep core functionality; enhance tone.

> GroomRoute updates clients instantly, professionally, and kindly — without you panic-texting between stops.

---

### NEW FEATURE CARD — Workload Intelligence
**Title:**
> Understands Dog Size, Workload & Your Physical Capacity

**Copy:**
> Big dogs take more time. Doodles are a universe of their own. Some days you have a bather — some days you don’t. GroomRoute actually understands that and helps you plan sustainable days that don’t break your body or brain.

**Bullets:**
- Set comfort limits (max big dogs/day)
- Auto-flag danger days
- Adjust workload if an assistant is helping

---

### Feature: Cancellation Recovery
**Updated Title:**
> Cancellations Happen. GroomRoute Helps You Recover Lost Revenue.

**Copy:**
> When someone bails last-minute, GroomRoute helps turn that loss into opportunity by automatically filling gaps with nearby waitlist clients.

---

# 3️⃣ Calm Control — Landing Page Positioning

## Calm Control Section
**Headline:**
> Meet Calm Control — Your Safety Net for When Grooming Life Gets Messy

**Supporting Copy:**
> GroomRoute’s Calm Control Center doesn’t just react — it thinks with you. Whether your day collapses, clients cancel, traffic wrecks your schedule, or you realize you accidentally booked a nightmare day… GroomRoute helps you stabilize everything with clarity and confidence.

---

### Sub-Features Inside Calm Control

#### 🛟 Rescue My Day
> Behind schedule? Traffic disaster? Two giant doodles back-to-back?
> GroomRoute gives you 2–3 smart rescue plans with new routes, messaging handled, and your sanity intact.

---

#### 💪 Body & Burnout Protection
> Grooming is physically demanding. GroomRoute watches your workload patterns, warns when you’ve built a “danger day,” and helps protect you from burnout.

---

#### 🚧 Offline Safety Snapshot
> Lose signal? Phone meltdown? GroomRoute stores your day offline so you can keep working without panic.

---

# 4️⃣ Pricing & Trial Communication

### CTA Tone Philosophy
Do NOT place “card required” on every CTA.
Maintain motivation.
Transparency lives in microcopy.

### CTAs Remain:
- **Start Your Free Trial**

### Hero Microcopy:
> 14-day free trial. Cancel anytime. Card required.

### Pricing Page Supporting Line:
> Every plan includes a 14-day free trial. Cancel anytime before it ends.

### FAQ Additions:
**Q: Do I need a card?**  
Yes — helps keep trials focused on real grooming businesses. You won’t be charged during your trial and can cancel anytime.

**Q: Charged immediately?**  
No. Entire trial is free.

**Q: Can I cancel?**  
Yes — instantly, without awkwardness.

---

# 5️⃣ Onboarding Flow — MUST UPDATE

### Current Flow (Old)
Start Trial → onboarding → dashboard

### New Required Flow
1️⃣ Start Free Trial  
2️⃣ Create Account / Business Details  
3️⃣ Choose Plan + Card Capture (Stripe Checkout)  
4️⃣ Optional: Welcome / Quick Start  
5️⃣ Dashboard

---

### System Requirements

- Stripe Checkout
- Mode: subscription
- Trial: 14 days
- Store:
  - stripe_customer_id
  - stripe_subscription_id
  - trial_end
  - plan_tier
  - subscription_status
- User states:
  - `trial_pending_payment`
  - `trial_active`
  - `subscription_active`
  - `trial_expired`
  - `subscription_canceled`

Prevent dashboard access until payment step completed.

---

# 6️⃣ Calm Control — Product Direction / Engineering Context

### Real World Groomer Insights Integrated
- Most mobile groomers do 3–7 dogs/day
- Limit big dogs (1–2 max)
- Bathers increase capacity
- Routing inefficiency wastes time and gas
- Cancellations destroy revenue
- Burnout + body fatigue = major real-world problem
- Connectivity isn’t always reliable

---

## Calm Control Should Deliver:

### 🔥 Crisis Intelligence
- Rescue My Day smart recomputation
- One-tap client comms
- salvage logic
- automatic schedule stability options

---

### 🧠 Workload Guardian
- Dog size awareness
- Coat complexity weighting
- Assistant mode
- workload thresholds
- danger day alerts

---

### 💵 Revenue Protection
- cancellation gap monetization
- risky client identification
- deposit / policy guidance

---

### 🗺️ Territory Intelligence
- area batching
- route tightness scoring
- travel distance optimization

---

### 📶 Offline Grace
- downloadable day snapshot
- maps compatibility
- zero-panic fallback view

---

# 7️⃣ Brand Promise Update

### New Promise Section Copy
> We don’t just promise efficiency — we promise calmer days, smarter decisions, stronger income, and a work life that feels sustainable again.

---

# 8️⃣ Development Notes — MVP vs Evolution

### MVP Requirements from This Doc
- Updated landing page messaging
- New Calm Control page content
- Card-Required Free Trial onboarding experience
- Rescue My Day foundational UX concept
- Architecture awareness for:
  - workload scoring
  - assistant toggle
  - cancellation & waitlist engine
  - offline planning

---

# 9️⃣ Strategic Positioning Outcome After These Changes

GroomRoute is now positioned as:

> The first intelligent platform built specifically for mobile groomers — not just to plan routes, but to protect their time, body, income, sanity, and future.

This differentiates against:
- “simple scheduling apps”
- “basic routing tools”
- “generic service SaaS”

GroomRoute becomes:
**their operations brain + emotional anchor.**

---

# ✅ Implementation Checklist

### Landing Page
- Update hero
- Update before/after
- Add workload intelligence card
- Expand Calm Control section
- Add credibility storytelling line
- Update pricing support copy
- Add FAQ transparency

### Onboarding System
- Insert Stripe payment gate
- enforce pre-dashboard payment
- implement trial lifecycle

### Product Roadmap Foundation
- Calm Control UX
- workload weighting system
- offline snapshot system
- cancellation revenue engine foundations

---

This document should now serve as the **canonical direction document** for:
- frontend landing changes
- onboarding restructuring
- Calm Control UX evolution
- product narrative alignment
- engineering awareness

Any future refinements will build upon this foundation.
