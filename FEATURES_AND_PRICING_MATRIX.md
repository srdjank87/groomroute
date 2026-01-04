# GroomRoute Feature Roadmap & Pricing Matrix

**Last Updated:** 2026-01-03
**Purpose:** Comprehensive catalog of all features promised on the landing page, organized by priority and pricing tier.

---

## Landing Page Promise Analysis

This document catalogs every feature explicitly or implicitly promised on the GroomRoute landing page, ensuring we build what we sell.

---

## Core Value Propositions (From Hero Section)

1. **Protect your body** - Workload intelligence prevents physical burnout
2. **Protect your sanity** - Calm Control reduces daily stress
3. **Protect your income** - Revenue recovery and time savings

---

## Feature Categories & Implementation Priority

### 🔴 **CRITICAL - P0 (Must-Have for Launch)**

These features are explicitly promised in multiple places on the landing page and are core to the product's value proposition.

#### 1. Route Optimization Engine

**Landing Page Promises:**
- "One-Tap Optimized Routes - Turn Chaos Into a Calm, Profitable Day"
- "Save 45-90 minutes a day"
- "Stop zig-zag driving all over town"
- "Supports dedicated 'area days'"
- "Routes that are tight, efficient, and stress-free"

**Technical Requirements:**
- [ ] One-tap route optimization button
- [ ] Real-time route calculation using Google Maps/Apple Maps APIs
- [ ] Geographic clustering for "area days"
- [ ] Time savings calculation and display
- [ ] Mileage reduction metrics
- [ ] Support for custom area/territory preferences

**Pricing Tier:** ALL (Essential, Growth, Scale)

---

#### 2. One-Tap Start Driving (Navigation Integration)

**Landing Page Promises:**
- "One Tap: 'Start Driving' - Navigation Loads. You Go. Done."
- "Your entire route instantly loads into Google Maps or Apple Maps"
- "No copying addresses. No juggling screenshots. No confusion."

**Technical Requirements:**
- [ ] One-tap button to launch navigation
- [ ] Deep linking to Google Maps (iOS/Android)
- [ ] Deep linking to Apple Maps (iOS)
- [ ] Automatic waypoint ordering
- [ ] Sequential navigation through all stops

**Pricing Tier:** ALL (Essential, Growth, Scale)

---

#### 3. Running Late Automation

**Landing Page Promises:**
- "One Tap: 'Running Late' - Clients Instantly Know. You Stay Stress-Free."
- "Instant, kind, professional update - without you stopping to type"
- "Auto-notify customers when life happens - no panic texting"
- "Customers always informed - without you juggling messages"
- "80% reduction in stress calls"

**Technical Requirements:**
- [ ] One-tap "Running Late" button
- [ ] ETA recalculation for all remaining appointments
- [ ] Automatic SMS/email notification to affected customers
- [ ] Professional message templates
- [ ] Time delay selection (15 min, 30 min, 45 min, custom)
- [ ] Notification history log

**Pricing Tier:** Growth, Scale (Premium feature)

---

#### 4. Workload & Dog Size Intelligence

**Landing Page Promises:**
- "Understands Dog Size, Workload & Your Physical Capacity"
- "Big dogs take more time. Doodles are their own universe."
- "Helps you plan sustainable days that protect your body, your brain, and your love for grooming"
- "Set comfort limits (max big dogs/day)"
- "Auto-flag exhausting 'danger days'"
- "Adjust workload instantly if an assistant is helping"
- "Balanced schedules that protect your body"
- "Protects Your Body - Prevents back-to-back heavy dogs"
- "Protect your body with workload intelligence (chihuahua days ≠ doodle days)"

**Technical Requirements:**
- [ ] Dog size field in pet profiles (Small, Medium, Large, Giant)
- [ ] Energy cost rating system (Light, Medium, Heavy)
- [ ] "Doodle" breed flag (extra workload multiplier)
- [ ] Daily workload limit settings
- [ ] "Danger day" visual warnings when limits exceeded
- [ ] Assistant mode toggle (reduces workload calculations)
- [ ] Workload distribution in scheduling algorithm
- [ ] Daily energy bar visualization

**Pricing Tier:** Growth, Scale (Premium feature)

---

#### 5. Cancellation Gap Fill & Revenue Recovery

**Landing Page Promises:**
- "Cancellations Happen. GroomRoute Turns Them Into Income."
- "Automatically fills gaps with waitlist clients nearby"
- "Recover $200-$400/month you'd normally lose"
- "Automatic cancellation recovery when plans change"
- "Without lifting a finger"

**Technical Requirements:**
- [ ] Waitlist management system
- [ ] Automatic gap detection when appointment cancelled
- [ ] Proximity-based waitlist client matching
- [ ] One-tap offer to waitlist clients (SMS/email)
- [ ] Revenue recovery tracking and reporting
- [ ] Opt-in waitlist for customers

**Pricing Tier:** Growth, Scale (Premium feature)

---

#### 6. Calm Control Center

**Landing Page Promises:**
- "Meet Calm Control - Your Safety Net for When Grooming Life Gets Messy"
- "GroomRoute doesn't just react - it thinks with you"
- "Helps you stabilize your day with smart rescue plans, clear decisions, and confidence"

**Sub-Features:**

##### 6a. Rescue My Day

**Landing Page Promises:**
- "Behind schedule? Traffic disaster? Two giant doodles back-to-back?"
- "Gives you 2-3 smart rescue plans with new routes, messaging handled, and your sanity intact"

**Technical Requirements:**
- [ ] "Rescue My Day" button in Calm Control
- [ ] Day state analysis (current time vs planned schedule)
- [ ] Generate 2-3 alternative solutions:
  - Option 1: Reorder remaining stops (fastest route)
  - Option 2: Cancel/reschedule least profitable appointments
  - Option 3: Compress service times (faster grooms)
- [ ] Auto-notification to affected customers
- [ ] One-tap solution selection

**Pricing Tier:** Growth, Scale

##### 6b. Body & Burnout Protection

**Landing Page Promises:**
- "Flag danger days before you book them"
- "Plan max big dogs per day, max driving time, required breaks"

**Technical Requirements:**
- [ ] Pre-booking workload preview
- [ ] Max big dogs per day limit enforcement
- [ ] Max driving time calculations
- [ ] Required break time insertion
- [ ] Visual warnings when booking exceeds limits

**Pricing Tier:** Growth, Scale

##### 6c. Smart Skip Stop

**Landing Page Promises:**
- "Client not answering? Dog sick? Tap Skip Stop."
- "GroomRoute rebuilds your route, updates ETAs, and messages everyone"

**Technical Requirements:**
- [ ] "Skip Stop" button on each appointment
- [ ] Instant route recalculation
- [ ] ETA updates for all remaining stops
- [ ] Auto-notification to upcoming customers
- [ ] Reason tracking (no answer, dog sick, emergency, etc.)

**Pricing Tier:** ALL

---

#### 7. Calendar Import & Sync

**Landing Page Promises:**
- "One tap. Your routes are optimized, customers informed, and your day stays calm"
- (Implied: Need to get appointments into system somehow)

**Technical Requirements:**
- [ ] Google Calendar sync (OAuth integration)
- [ ] ICS file import
- [ ] CSV import
- [ ] Manual appointment creation form
- [ ] Two-way sync option (updates flow back to Google Calendar)

**Pricing Tier:** ALL (Import), Growth+ (Two-way sync)

---

### 🟡 **HIGH PRIORITY - P1 (Launch + 30 Days)**

Features that strengthen core value props but aren't explicitly shown in screenshots.

#### 8. Customer & Pet Management

**Landing Page Promises:**
- (Implied by all appointment/routing features)

**Technical Requirements:**
- [ ] Customer profiles (name, address, phone, email, notes)
- [ ] Pet profiles (name, species, breed, weight, behavior flags, special handling)
- [ ] Address geocoding and validation
- [ ] Customer search and filtering
- [ ] Appointment history per customer

**Pricing Tier:** ALL

---

#### 9. Professional Communication Templates

**Landing Page Promises:**
- "Instant, kind, professional update"
- "Your business continues to look polished and reliable"

**Technical Requirements:**
- [ ] SMS/email template library:
  - Running late
  - On my way
  - Appointment reminder
  - Cancellation confirmation
  - Rescheduling request
  - Thank you / review request
- [ ] Template customization (personalization tokens)
- [ ] Professional tone and formatting

**Pricing Tier:** Growth, Scale

---

#### 10. End-of-Day Analytics & Proof

**Landing Page Promises:**
- "45-90 mins/day time saved"
- "$200-$400/month revenue recovered"
- "80% reduction in stress calls"

**Technical Requirements:**
- [ ] Daily summary dashboard:
  - Time saved vs unoptimized route
  - Mileage saved
  - Number of appointments completed
  - Cancellations recovered
  - Revenue protected
  - Auto-notifications sent
- [ ] Weekly/monthly trend reports
- [ ] ROI calculator with real user data

**Pricing Tier:** Growth, Scale

---

### 🟢 **MEDIUM PRIORITY - P2 (Launch + 60 Days)**

Features that enhance the core experience but are less critical for initial launch.

#### 11. Growth & Stability Program

**Landing Page Promises:**
- (Mentioned in MARKET_INSIGHTS.md as optional add-on)

**Technical Requirements:**
- [ ] Under-booking detection
- [ ] Gentle upgrade prompt to Growth & Stability add-on
- [ ] Integration with marketing campaign tools:
  - Local ad campaign setup
  - Postcard campaign management
  - Route density analysis
  - New customer acquisition tracking

**Pricing Tier:** Add-on service (separate pricing)

---

#### 12. Appointment Conflict Detection

**Landing Page Promises:**
- (Already implemented in route.ts)

**Technical Requirements:**
- [x] Prevent double-booking
- [x] Time slot conflict validation
- [ ] Visual calendar view showing conflicts

**Pricing Tier:** ALL

---

#### 13. Service Type & Pricing Management

**Landing Page Promises:**
- (Implied by appointment system)

**Technical Requirements:**
- [ ] Service type templates:
  - Full Groom
  - Bath Only
  - Nail Trim
  - Face/Feet/Fanny
  - Custom services
- [ ] Default pricing per service
- [ ] Weight-based pricing tiers
- [ ] Custom pricing per customer/pet

**Pricing Tier:** ALL

---

### 🔵 **LOWER PRIORITY - P3 (Launch + 90 Days)**

Features from MARKET_INSIGHTS.md that strengthen product-market fit.

#### 14. Stress-Aware Scheduling

**From MARKET_INSIGHTS.md:**
- Energy-first day design
- Avoid X heavy dogs in a row
- End day with easier dogs

**Technical Requirements:**
- [ ] Energy cost field in pet profiles
- [ ] Handling difficulty flags
- [ ] Scheduling preferences:
  - Max heavy dogs in sequence
  - Prefer easy dogs at end of day
- [ ] Energy profile visualization
- [ ] "Optimize for calm workload" vs "Optimize for drive time" toggle

**Pricing Tier:** Scale (Advanced feature)

---

#### 15. Professional Confidence Toolkit

**From MARKET_INSIGHTS.md:**
- Context-aware safety tips
- Handling best practices

**Technical Requirements:**
- [ ] Confidence Tips micro-panel in Calm Control
- [ ] Context-aware surfacing (e.g., multiple large dogs → safety tips)
- [ ] High stress mode → calming techniques
- [ ] Links to external resources (optional)

**Pricing Tier:** ALL (Value-add)

---

#### 16. End-of-Day Calm Reflection

**From MARKET_INSIGHTS.md:**
- Summary of wins and value delivered

**Technical Requirements:**
- [ ] End-of-day summary card:
  - Time saved
  - Appointments completed
  - Cancellations recovered
  - "Calm Moments" (auto-notifications sent)
- [ ] Emotional framing: "Here's how you protected your body and business today"
- [ ] Weekly recap email

**Pricing Tier:** Growth, Scale

---

#### 17. Equipment / Van Issue Logging

**From MARKET_INSIGHTS.md:**
- Lightweight issue tracking

**Technical Requirements:**
- [ ] "Issues Today" logging in Calm Control
- [ ] Quick log entry (1-2 taps + note)
- [ ] Tag to dog/appointment if relevant
- [ ] Pattern detection (e.g., "3 days this month impacted by van issues")
- [ ] Export for mechanic/van provider

**Pricing Tier:** Scale (Advanced feature)

---

## Pricing Tier Feature Matrix

### 💎 **STARTER - $89/month**

**Target User:** Solo groomer, 1-3 appointments/day, just starting or part-time

**Core Features:**
- ✅ Basic route optimization (one-tap)
- ✅ One-tap start driving (navigation)
- ✅ Customer & pet management (up to 50 customers)
- ✅ Manual appointment scheduling
- ✅ Skip stop functionality
- ✅ Basic calendar import (ICS/CSV)
- ✅ Appointment conflict detection
- ✅ **SMS messaging (shared number)** - Immediate access, no A2P delays
- ✅ **Calm Inbox** - Intelligent reply classification
- ✅ **Auto-reply classification** - "OK" and "Thanks" auto-resolved
- ✅ Basic analytics
- ✅ Email support
- ❌ Running late automation
- ❌ Workload intelligence
- ❌ Cancellation gap fill
- ❌ Dedicated business SMS number
- ❌ Message templates
- ❌ Calm Control advanced features
- ❌ Advanced analytics

**Limitations:**
- Max 50 customers
- Max 100 appointments/month
- 500 SMS messages/month
- Shared SMS sender number (messages include business name in content)
- No advanced scheduling features

**SMS Messaging:**
- Uses platform-wide verified sender identity
- Replies routed to correct business inbox
- Full Calm Inbox experience
- Supports single send and bulk notifications
- Auto-classification of customer replies

---

### 🚀 **GROWTH - $179/month** (RECOMMENDED)

**Target User:** Professional mobile groomer, 4-8 appointments/day, sustainable business

**Everything in Starter, PLUS:**

- ✅ **Unlimited customers & appointments**
- ✅ **Dedicated Business SMS Number** - Your own number, 24-72hr provisioning
- ✅ **Running Late Automation** (SMS/email)
- ✅ **Workload & Dog Size Intelligence**
  - Dog size tracking
  - Energy cost ratings
  - Danger day warnings
  - Assistant mode
- ✅ **Cancellation Gap Fill**
  - Waitlist management
  - Auto-recovery matching
  - Revenue tracking
- ✅ **Calm Control Center**
  - Rescue My Day
  - Body & Burnout Protection
  - Smart decision support
- ✅ **Professional Communication Templates**
  - SMS/email template library
  - Custom template editor
  - One-tap replies
- ✅ **Bulk Notifications**
  - Shift day messaging
  - Route adjust notifications
  - Waitlist fill blast
- ✅ **Google Calendar Two-Way Sync**
- ✅ **End-of-Day Analytics**
  - Time saved tracking
  - Revenue recovery reporting
  - Efficiency metrics
- ✅ **Area Days Support**
- ✅ **Professional Confidence Toolkit**
- ✅ **Priority Support**

**SMS Messaging Upgrade:**
- Dedicated phone number provisioned after upgrade
- Automatic switchover (no disruption)
- Higher deliverability and trust
- Customers recognize your number
- 2,000 SMS messages/month included

**Key Value Props:**
- ROI: $1,321/month net gain (based on 60 min/day saved @ $75/hr)
- 8.4x return on investment
- $200-$400/month in recovered revenue
- 45-90 minutes saved per day

---

### 🏢 **PRO - $329/month**

**Target User:** Multi-van operation, team management, 10+ appointments/day

**Everything in Growth, PLUS:**

- ✅ **Multi-Groomer/Multi-Van Support**
  - Unlimited team members
  - Per-groomer scheduling
  - Team calendar view
  - Groomer performance analytics
- ✅ **Stress-Aware Scheduling**
  - Energy-first optimization
  - Advanced workload balancing
  - End-day energy preferences
- ✅ **Advanced Analytics Dashboard**
  - Multi-groomer reporting
  - Revenue per groomer
  - Efficiency benchmarking
  - Trend analysis
- ✅ **Equipment & Van Issue Logging**
  - Maintenance tracking
  - Issue pattern detection
  - Export capabilities
- ✅ **Premium Support**
  - Dedicated account manager
  - Phone support
  - Custom onboarding
- ✅ **API Access** (future)
  - Custom integrations
  - Third-party software connections

**SMS Messaging:**
- 10,000 SMS messages/month included
- Multi-number support (one per groomer/van)

**Key Value Props:**
- ROI scales with team size
- Team efficiency optimization
- Business-level insights and reporting

---

## Implementation Roadmap

### Phase 1: MVP Launch (P0 Features)

**Timeline:** 0-60 days

**Must-Have Features:**
1. Route optimization engine
2. One-tap start driving
3. Customer & pet management
4. Basic appointment scheduling
5. Calendar import (ICS/CSV)
6. Skip stop functionality

**Goal:** Essential tier is fully functional. Growth tier is mostly functional (minus automation features).

---

### Phase 2: Automation & Intelligence (P0 + P1 Features)

**Timeline:** 60-90 days

**Add:**
1. Running late automation (SMS/email)
2. Workload intelligence
3. Cancellation gap fill
4. Calm Control Center (Rescue My Day)
5. Communication templates
6. End-of-day analytics

**Goal:** Growth tier is fully functional and delivers on all landing page promises.

---

### Phase 3: Scale & Refinement (P1 + P2 Features)

**Timeline:** 90-120 days

**Add:**
1. Google Calendar two-way sync
2. Advanced scheduling preferences
3. Professional confidence toolkit
4. Enhanced analytics
5. Multi-groomer support (Scale tier)

**Goal:** Scale tier is fully functional. All landing page promises are delivered.

---

### Phase 4: Advanced Features (P3 Features)

**Timeline:** 120+ days

**Add:**
1. Stress-aware scheduling
2. Equipment/van issue logging
3. Growth & Stability Program integration
4. API access
5. Third-party integrations

**Goal:** Product differentiation and market leadership.

---

## Feature Dependency Map

```
ESSENTIAL TIER
├── Route Optimization Engine
├── Navigation Integration
├── Customer & Pet Management
├── Appointment Scheduling
├── Calendar Import (ICS/CSV)
└── Skip Stop

GROWTH TIER (depends on Essential +)
├── Running Late Automation
│   └── Communication Templates
│   └── SMS/Email Service Integration
├── Workload Intelligence
│   └── Dog Size & Energy Tracking
│   └── Danger Day Detection
│   └── Assistant Mode
├── Cancellation Gap Fill
│   └── Waitlist Management
│   └── Revenue Recovery Tracking
├── Calm Control Center
│   └── Rescue My Day
│   └── Body & Burnout Protection
│   └── Smart Skip Stop (enhanced)
├── Google Calendar Two-Way Sync
└── End-of-Day Analytics
    └── Time Saved Tracking
    └── Revenue Metrics

SCALE TIER (depends on Growth +)
├── Multi-Groomer Support
│   └── Team Calendar View
│   └── Per-Groomer Analytics
├── Stress-Aware Scheduling
│   └── Energy-First Optimization
├── Advanced Analytics
│   └── Team Performance
│   └── Business Intelligence
├── Equipment Logging
└── Priority Support
```

---

## Landing Page Promises Checklist

Use this checklist to ensure every promise on the landing page is backed by a real feature:

### Hero Section Promises
- [x] "Save 45-90 min/day with smart routing" → Route Optimization Engine
- [x] "Auto-notify customers when life happens" → Running Late Automation
- [x] "Protect your body with workload intelligence" → Workload Intelligence

### Identity Proof Section
- [x] "Understands Doodles" → Workload Intelligence (Doodle breed flag)
- [x] "Protects Your Body" → Workload Intelligence (heavy dog limits)
- [x] "Built With You" → All features designed from groomer research

### Before/After Section
- [x] "Balanced schedules that protect your body" → Workload Intelligence
- [x] "Routes that are tight, efficient, and stress-free" → Route Optimization
- [x] "Automatic cancellation recovery" → Cancellation Gap Fill
- [x] "Customers always informed" → Running Late + Communication Templates

### One-Tap Features
- [x] "One-Tap Optimized Routes" → Route Optimization Engine
- [x] "One Tap: Running Late" → Running Late Automation
- [x] "One Tap: Start Driving" → Navigation Integration
- [x] "Understands Dog Size, Workload & Capacity" → Workload Intelligence
- [x] "Cancellations Happen. GroomRoute Turns Them Into Income" → Gap Fill

### Calm Control Section
- [x] "Rescue My Day" → Calm Control: Rescue My Day
- [x] "Body & Burnout Protection" → Workload Intelligence + Calm Control
- [x] "Smart Skip Stop" → Skip Stop Enhanced

### Proof Bar
- [x] "45-90 mins/day" → Time Saved Analytics
- [x] "$200-$400/month" → Revenue Recovery Analytics
- [x] "80% reduction in stress calls" → Running Late Automation Impact

### Pricing ROI Calculator
- [x] "60 minutes saved per day" → Route Optimization
- [x] "$1,321/month net gain" → Calculated from time savings
- [x] "8.4x return" → ROI metrics
- [x] "Gap-fill revenue recovery" → Cancellation Gap Fill

---

## Technical Architecture Notes

### Critical Integrations Required

1. **SMS/Email Service** (Growth tier)
   - Twilio or SendGrid for messaging
   - Template management system
   - Delivery tracking

2. **Mapping & Routing APIs** (All tiers)
   - Google Maps API (route optimization, geocoding)
   - Apple Maps integration (deep linking)
   - Distance matrix calculations

3. **Calendar Integration** (All tiers)
   - Google Calendar API (OAuth 2.0)
   - ICS file parsing
   - Two-way sync engine (Growth+)

4. **Payment Processing** (All tiers)
   - Stripe for subscription billing
   - Trial management
   - Tiered pricing enforcement

---

## Business Metrics to Track

To validate landing page promises and demonstrate ROI:

1. **Time Savings**
   - Actual route time vs optimized route time
   - Average daily savings per user
   - Cumulative monthly savings

2. **Revenue Recovery**
   - Cancellation gap fills executed
   - Revenue recovered per month
   - Waitlist conversion rate

3. **Stress Reduction**
   - Number of auto-notifications sent
   - Running late events handled
   - Rescue My Day activations

4. **Workload Protection**
   - Danger days flagged
   - Heavy dog limits enforced
   - Energy distribution metrics

5. **User Engagement**
   - Daily active users
   - Feature usage frequency
   - Time to value (days until first optimization)

---

## Conclusion

This document serves as the **single source of truth** for:
- What features we've promised on the landing page
- What features belong in each pricing tier
- What order to build features in

**Next Steps:**
1. Review and validate this feature matrix with product owner
2. Prioritize P0 features for MVP
3. Create detailed technical specs for each feature
4. Build and test in phases
5. Update landing page as features ship

**Remember:** Every feature on the landing page is a promise to our customers. We must deliver on every promise to build trust and retain users.
