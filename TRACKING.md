# GroomRoute – Product Analytics, Onboarding & Aha Tracking Specification

## Purpose
This document defines how GroomRoute tracks:
- onboarding friction
- time to “aha” moment
- real-world day-one value
- trial → paid conversion drivers

The goal is to ensure users experience **calm, relief, and value on real workdays**, not just understand features.

This is NOT generic SaaS analytics. It is tailored to GroomRoute’s mission:
> Reduce mental load for mobile dog groomers on chaotic days.

---

## Core Questions We Must Answer
All tracking exists to answer these five questions:

1. Did the user do *anything meaningful* after signup?
2. How long did it take?
3. Did they experience relief (the “aha” moment)?
4. Did they return the next day?
5. Did they use GroomRoute during an actual workday?

If we can answer these reliably, we can:
- fix onboarding
- improve trial → paid conversion
- reduce churn
- increase MRR ceiling

---

## Tooling Stack (Minimum Viable)

### 1. Product Analytics
**PostHog** (recommended)
- event tracking
- funnels
- session replays
- feature usage
- privacy friendly
- dev friendly

(Alternative: Mixpanel if already in use)

### 2. Error & Friction Tracking
**Sentry**
- capture crashes
- capture failed actions
- identify rage-click and broken flows

### 3. Qualitative Insight
- PostHog Session Replays
- Simple in-app micro feedback (modal or button)

NO GA4 required for core product insights.

---

## Core Concepts & Definitions

### Meaningful Action
Any action that indicates real use:
- adding an appointment
- importing calendar data
- generating a route
- using Calm Control / Rescue features

### Minimum Viable Setup
A user is considered “set up” when:
- they have at least 1 day with ≥2 appointments
- AND they generate at least one route

---

## Core Events to Track (≈10 total)

### 1. account_created
Triggered when user completes signup.

**Properties**
- signup_source (ads / email / organic / referral)
- plan_selected (if any)
- timestamp

---

### 2. first_action_completed
Triggered on the FIRST meaningful action.

**Triggered by**
- appointment_added
- calendar_imported
- route_optimized
- calm_control_used

**Properties**
- action_type
- minutes_since_signup

**Used to measure**
- Time To First Action (TTFA)
- onboarding friction

**Targets**
- Excellent: < 5 minutes
- Acceptable: 5–15 minutes
- Danger: > 20 minutes

---

### 3. minimum_setup_completed
Triggered when:
- ≥2 appointments exist on one day
- AND route_optimized has occurred at least once

**Used to measure**
- setup completion rate

**Targets**
- 70%+ = strong
- 50–70% = needs improvement
- <50% = onboarding broken

---

## Aha Moment Tracking

### Definition of Aha Moment (GroomRoute)
A user experiences “aha” when they feel:
> “I don’t have to hold this day in my head anymore.”

This is proxied by:
- route optimization
- calm / rescue feature usage

---

### 4. route_optimized
Triggered every time a route is generated or reordered.

**Properties**
- number_of_stops
- estimated_time_saved (approximate is fine)
- estimated_distance_saved
- day_of_week
- time_of_day

**Primary Aha Proxy**

---

### 5. calm_control_used
Triggered when any calm/rescue feature is used.

**Examples**
- Running Late
- Rescue My Day
- Workload Warning
- Offline Safety Snapshot

**Properties**
- trigger_type
- time_of_day

**Critical for emotional value tracking**

---

## Day-One & Real-World Value

### 6. day_viewed
Triggered when user opens the “Today” view.

**Properties**
- time_of_day
- appointments_today

**Used to determine**
- if GroomRoute is used during work hours
- theoretical vs real-world usage

---

### 7. day_completed
Triggered when:
- user marks day complete
- OR end-of-day auto trigger

**Properties**
- completed_appointments
- cancellations
- no_shows

**Used to correlate**
- feature usage → day outcome

---

## Retention & Conversion Tracking

### 8. returned_next_day (computed)
Triggered if user is active on day N+1 after signup.

**Used to measure**
- early retention
- whether enough value was felt

**Targets**
- 45–60%+ = strong
- 30–45% = acceptable
- <30% = value not landing

---

### 9. trial_converted
Triggered when trial converts to paid.

**Properties**
- plan_selected
- days_in_trial
- total_routes_optimized
- calm_control_usage_count
- days_active_in_trial

**Used to identify**
- behaviors that predict payment

---

### 10. trial_expired_without_conversion
Triggered when trial ends without payment.

**Properties**
- total_sessions
- routes_optimized
- calm_events_used
- days_active

**Used to understand**
- why users didn’t convert
- missing value moments

---

## Key Metrics & What They Tell Us

### Onboarding Friction
- Median time to first_action_completed
- % users who never trigger first_action_completed

If >30% never act → onboarding too hard.

---

### Aha Speed
- % of users triggering route_optimized OR calm_control_used within 24h

If <40% → aha moment too slow.

---

### Day-One Value
- Are key events happening during work hours (8am–5pm)?
- Are calm features used mid-day?

If usage is only at night → value is theoretical.

---

### Conversion Drivers
Compare converters vs non-converters:
- # routes optimized
- # calm events
- days active

Find the ONE action that most predicts payment.
Make that action unavoidable.

---

## Product Principles for Implementation

### 1. Default to Today
- Dashboard should open to “Today”
- Primary CTA = “Make today calmer”

### 2. Calm Before Correctness
- Allow imperfect data
- Avoid blocking flows
- Let users skip configuration safely

### 3. Emotional Confirmation
After key actions, reinforce:
- “Nice — your day just got easier.”
- “You don’t need to think about this anymore.”

---

## Weekly Operating Loop

Every week:
1. Review TTFA and setup completion
2. Watch 3–5 session replays
3. Identify top 1–2 friction points
4. Fix ONLY those

Avoid over-optimization.

---

## What NOT to Do
- Do not track everything
- Do not wait for perfect analytics
- Do not build dashboards before data exists
- Do not prioritize vanity metrics

---

## Final Reminder
GroomRoute is not a reporting tool.
It is a **mental load reduction system**.

Analytics exists only to answer:
> “Did this make a real workday calmer?”

If yes → users pay, stay, and tell others.
If no → fix onboarding, not marketing.

---
