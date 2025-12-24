# GroomRoute MVP Roadmap - Breakage-First Approach

This roadmap prioritizes features that fix critical operational breakage for mobile groomers.

---

## 🎯 MVP Goal

Ship a working product that immediately saves groomers **1-2 hours per day** and **$200-400/month in recovered revenue** through:
1. Optimized routing (less drive time)
2. Gap-fill when cancellations happen
3. Automated communication (less phone time)
4. Safety warnings (fewer botched appointments)
5. Location intelligence (no wrong addresses)

---

## Phase 1: Foundation (Weeks 1-2)

### Sprint 1: Auth & Account Setup
- [ ] Install NextAuth.js
- [ ] Email/password authentication
- [ ] Protected route middleware
- [ ] Sign up page
- [ ] Login page
- [ ] Onboarding flow:
  - [ ] Create account (business name, timezone)
  - [ ] Create first groomer profile
  - [ ] Enter base address
  - [ ] **Geocode base address** (validate it works!)
  - [ ] Set working hours

**Success Criteria:** New user can sign up, complete onboarding, and see dashboard

---

### Sprint 2: Core Data Entry
- [ ] Customer CRUD
  - [ ] List page with search
  - [ ] Create customer form
  - [ ] **Address input with geocoding** ⭐
  - [ ] Edit customer
  - [ ] Delete customer (with confirmation)
- [ ] Pet CRUD
  - [ ] Add pet to customer
  - [ ] Edit pet
  - [ ] Delete pet
- [ ] Basic appointment scheduling
  - [ ] Create appointment (customer, pet, date/time, duration)
  - [ ] List appointments
  - [ ] Edit appointment
  - [ ] Cancel appointment

**Success Criteria:** Can add customers with addresses that geocode successfully, add pets, schedule appointments

---

## Phase 2: MVP Breakage Fix #1 - Location Intelligence (Week 3)

### Sprint 3: Address Validation & Access Instructions
- [ ] **Geocode verification screen** ⭐
  - [ ] Show map with pin after address entry
  - [ ] "Is this location correct?" confirmation
  - [ ] Re-geocode if user says no
- [ ] **Access instructions fields** ⭐
  - [ ] "Address Notes" (gate codes, parking)
  - [ ] "Access Instructions" (which door, etc.)
  - [ ] Display prominently on appointment/route views
- [ ] **Location verification workflow**
  - [ ] Flag "Location not verified" on first visit
  - [ ] "Verify location" button for groomer
  - [ ] Badge showing verified status

**Success Criteria:**
- All new addresses show map preview
- Groomers can add gate codes/parking notes
- First-time locations are flagged until verified

**Breakage Fixed:** Eliminates wrong address visits (saves 20+ min per incident)

---

## Phase 3: MVP Breakage Fix #2 - Safety Warnings (Week 3)

### Sprint 3 (continued): Behavior Flags & Equipment Tags
- [ ] **Pet behavior flag UI** ⭐
  - [ ] Multi-select checkboxes: Friendly, Anxious, Aggressive, Bite Risk, Muzzle Required, Two-Person Required
  - [ ] Save to database (already in schema)
- [ ] **Equipment required UI** ⭐
  - [ ] Multi-select: Muzzle, Table Extender, Heavy Duty Dryer, etc.
  - [ ] Save to database
- [ ] **Warning badges on route view** ⭐
  - [ ] Big red warning: "⚠️ MUZZLE REQUIRED"
  - [ ] Yellow warning: "⚠️ Anxious - handle gently"
  - [ ] Equipment list: "🔧 Needs: Heavy Duty Dryer, Table Extender"
- [ ] **Pre-appointment briefing**
  - [ ] Modal/screen before starting appointment
  - [ ] Shows pet photo, behavior warnings, equipment needed
  - [ ] "I'm prepared" confirmation button

**Success Criteria:**
- Can flag aggressive/difficult dogs
- Warnings are HIGHLY visible on route view
- Can't start appointment without seeing warnings

**Breakage Fixed:** Prevents safety incidents and botched appointments due to unpreparedness

---

## Phase 4: MVP Breakage Fix #5 - Route Optimization (Week 4)

### Sprint 4: Route Builder & Efficiency Analytics
- [ ] **Route builder service** ⭐
  - [ ] Fetch all appointments for groomer/date
  - [ ] Validate all addresses are geocoded
  - [ ] Call routing provider (Google/Mapbox)
  - [ ] Calculate arrival/departure times
  - [ ] Save Route + RouteStops
- [ ] **Route detail page** ⭐
  - [ ] "Optimize My Day" button
  - [ ] Loading state during optimization
  - [ ] Ordered list of stops with:
    - [ ] Sequence number
    - [ ] Customer name + pet
    - [ ] Address
    - [ ] Arrival time
    - [ ] Service duration
    - [ ] Departure time
    - [ ] Drive time to next
  - [ ] **Behavior warnings displayed prominently** (from Phase 3)
  - [ ] **Access instructions visible** (from Phase 2)
- [ ] **Before/after comparison** ⭐
  - [ ] Show current route time
  - [ ] Show optimized route time
  - [ ] Highlight time saved: "SAVE 72 MINUTES"
- [ ] **Efficiency metrics** ⭐
  - [ ] Total drive time
  - [ ] Total service time
  - [ ] Efficiency score (service time / total time)
  - [ ] Color-coded: green (>70%), yellow (50-70%), red (<50%)

**Success Criteria:**
- One-click route optimization works
- Route shows clear time savings
- All stops display in optimal order with ETAs

**Breakage Fixed:** Reduces daily drive time by 1-2 hours

---

## Phase 5: MVP Breakage Fix #3 - Communication (Week 5)

### Sprint 5: Automated Messaging
- [ ] **Twilio integration** ⭐
  - [ ] Set up Twilio account
  - [ ] SMS sending service
  - [ ] Environment variables
- [ ] **Message templates** ⭐
  - [ ] Create template manager in settings
  - [ ] Default templates:
    - [ ] "24hr Reminder: Hi {customerName}, this is a reminder about {petName}'s grooming appointment tomorrow at {time}."
    - [ ] "2hr Reminder: See you soon! {petName}'s appointment is at {time} today."
    - [ ] "On My Way: I'm on my way! ETA: {eta} minutes."
    - [ ] "Running Late: Running a bit behind. New ETA: {eta}."
  - [ ] Variable substitution
- [ ] **24hr automated reminder** ⭐
  - [ ] Background job to send 24hr before
  - [ ] Mark as sent in database
- [ ] **Confirmation system** ⭐
  - [ ] "Reply YES to confirm" in reminder
  - [ ] Track confirmation status
  - [ ] Flag unconfirmed on route view
- [ ] **Quick send actions** ⭐
  - [ ] "Send On My Way" button (one-click)
  - [ ] "Running Late" with delay selector (15/30/45 min)
  - [ ] Auto-updates all remaining ETAs
  - [ ] Sends message to all remaining customers

**Success Criteria:**
- 24hr reminders send automatically
- One-click "running late" updates everyone
- Confirmation tracking works

**Breakage Fixed:** Saves 20-30 min/day on phone calls

---

## Phase 6: MVP Breakage Fix #4 - Gap Fill (Week 6)

### Sprint 6: Cancellation Recovery
- [ ] **Waitlist management** ⭐
  - [ ] Customer waitlist page
  - [ ] Add customer to waitlist
  - [ ] Preferred days/times
  - [ ] Max distance they'll travel
  - [ ] SMS/email notification preferences
- [ ] **Gap detection** ⭐
  - [ ] When appointment is cancelled, calculate gap time
  - [ ] Find waitlist customers within X miles
  - [ ] Filter by day/time preferences
- [ ] **Gap-fill broadcast** ⭐
  - [ ] "Fill this gap" button on route page
  - [ ] Shows nearby waitlist customers
  - [ ] "Send offer to 5 customers" button
  - [ ] Template: "Last-minute opening today 2-4pm in your area! Reply YES to book."
  - [ ] Track responses
- [ ] **"Squeeze-in" appointment type** ⭐
  - [ ] Quick services (nail trim, face/feet/fanny)
  - [ ] 30 min duration
  - [ ] Perfect for filling gaps

**Success Criteria:**
- Cancelled appointments trigger gap-fill offer
- Can broadcast to nearby waitlist customers
- Track bookings gained from gap-fill

**Breakage Fixed:** Recovers $200-400/month in lost revenue from cancellations

---

## Phase 7: Polish & Launch Prep (Week 7)

### Sprint 7: Dashboard, Settings, & UX Polish
- [ ] **Dashboard** ⭐
  - [ ] Today's route summary
  - [ ] Today's efficiency score
  - [ ] Upcoming appointments
  - [ ] Quick actions: Add customer, Schedule appointment, Optimize route
  - [ ] Unconfirmed appointments alert
  - [ ] Customers needing location verification
- [ ] **Settings**
  - [ ] Account info (name, timezone)
  - [ ] Groomer profiles
  - [ ] Message templates
  - [ ] Maps provider selection
  - [ ] Working hours
- [ ] **App navigation**
  - [ ] Sidebar with: Dashboard, Customers, Appointments, Routes, Settings
  - [ ] Top bar with user menu
  - [ ] Logout
- [ ] **Loading states & error handling**
  - [ ] Skeleton loaders
  - [ ] Spinners
  - [ ] Toast notifications for actions
  - [ ] Error messages
- [ ] **Mobile responsiveness**
  - [ ] Test all pages on mobile
  - [ ] Touch-friendly buttons
  - [ ] Mobile navigation

**Success Criteria:**
- Dashboard provides useful daily overview
- All pages are polished and responsive
- Error handling is graceful

---

## Phase 8: Beta Testing & Iteration (Week 8)

### Sprint 8: Real User Testing
- [ ] **Deploy to production**
  - [ ] Set up production database (Neon/Supabase)
  - [ ] Deploy to Vercel
  - [ ] Configure production environment
- [ ] **Beta user testing**
  - [ ] Recruit 3-5 mobile groomers
  - [ ] Onboard them
  - [ ] Have them use for 1 week
  - [ ] Collect feedback
- [ ] **Bug fixes**
  - [ ] Address critical bugs
  - [ ] Fix edge cases
- [ ] **Measure success metrics**
  - [ ] Time saved per route (target: 45+ min)
  - [ ] Gap-fill success rate
  - [ ] Show rate with confirmations (target: 95%+)
  - [ ] Route efficiency score (target: 65%+)

**Success Criteria:**
- Beta users save measurable time/money
- Critical bugs are fixed
- Metrics validate value proposition

---

## MVP Feature Checklist Summary

### ✅ Must-Have for MVP Launch
1. ✅ **Authentication** (signup, login, onboarding)
2. ✅ **Customer/Pet management** (CRUD)
3. ✅ **Appointment scheduling** (CRUD)
4. ⭐ **Address validation & access notes** (Breakage Fix #1)
5. ⭐ **Behavior warnings & equipment tags** (Breakage Fix #2)
6. ⭐ **Route optimization with efficiency metrics** (Breakage Fix #5)
7. ⭐ **Automated messaging & confirmations** (Breakage Fix #3)
8. ⭐ **Gap-fill system** (Breakage Fix #4)
9. ✅ **Dashboard & settings**
10. ✅ **Mobile-responsive UI**

### 🔜 Post-MVP (Phase 2)
- Smart scheduling suggestions
- Equipment/supply management
- Customer rebooking automation
- No-show prevention
- Profitability analytics
- Map visualization (nice-to-have)

---

## Success Metrics (8-Week Target)

**User Acquisition:**
- 10 beta users actively using the app

**Time Savings:**
- Average 60+ minutes saved per route
- 30%+ reduction in phone call time

**Revenue Recovery:**
- 20%+ of cancellations filled via gap-fill
- $250+ average monthly revenue recovered per user

**User Satisfaction:**
- 90%+ would recommend to another groomer
- 80%+ daily active usage

---

## Tech Stack Reminder

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma
- **Styling:** Tailwind CSS
- **Maps:** Google Maps or Mapbox
- **SMS:** Twilio
- **Deployment:** Vercel
- **Database Host:** Neon or Supabase

---

## Notes

- **Ship fast, iterate based on real feedback**
- **Focus on the 5 breakage fixes - they're the differentiator**
- **Don't over-engineer - MVP should be "good enough"**
- **Measure everything - data drives post-MVP priorities**
- **Get beta users ASAP - their feedback is gold**

---

**Current Status:** ✅ Phase 0 Complete (Foundation)
**Next Up:** Phase 1, Sprint 1 - Authentication & Account Setup
**Target MVP Launch:** 8 weeks from start
