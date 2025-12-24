# GroomRoute — project_context.md

> Purpose: This document is the single source of truth for a code agent to build **GroomRoute** end-to-end using the **same tech stack, coding patterns, and UI/visual style** as **OrderShifter**.  
> Priority: Ship an MVP that nails routing + scheduling (core “breakage fix”) before anything fancy.

---

## 1) Product summary

**GroomRoute** is a SaaS for **mobile pet groomers** (and small grooming teams) that reduces “day-to-day breakage” by turning messy schedules into an optimized driving plan.

Core outcomes:
- Less drive time, fewer late appointments
- More jobs per day without feeling rushed
- Faster reschedule + cancellation fill
- A professional, modern “tech partner” vibe for the groomer’s business (client-facing polish)

Core differentiator:
- Routing that respects real appointment constraints (time windows, service durations, start/end base)
- One-click “Optimize my day” that produces a route list + ETAs + map view

---

## 2) Target user + problem (breakage)

Primary user:
- Owner-operator mobile groomer, often solo
- Sometimes a small team with 2–10 groomers/vehicles

Breakage GroomRoute fixes:
- Time lost driving (unoptimized stop order)
- Late arrivals ripple through the day
- Manual rescheduling and “who can I fit in” chaos
- Lost revenue when cancellations aren’t filled quickly
- Customers getting annoyed due to uncertainty / inconsistent ETAs

---

## 3) MVP scope (what to build first)

MVP must include:
1) **Customer + Pet records**
2) **Appointment scheduling**
3) **Geocoding** on addresses (store lat/lng once)
4) **Daily route builder**
   - One-click “Optimize my day”
   - Stop order + drive times + ETA per stop
   - Route list view + basic map view
5) **Rebuild route** after changes (appointment moved/cancelled)
6) **Basic notifications** (optional for MVP, but plan it)
   - Appointment reminders
   - “On my way” ETA message (can be manual button first)

Everything else is secondary until routing is solid.

---

## 4) Stack and engineering constraints (must match OrderShifter)

### Tech stack (same as OrderShifter)
- **Next.js** (App Router)
- **TypeScript**
- **Prisma**
- **PostgreSQL** (same provider approach as OrderShifter, e.g. Neon)
- Same patterns for:
  - auth
  - DB migrations
  - API routes / server actions approach
  - code conventions, folder structure, linting, formatting
  - environment variable handling
  - deployment workflow (GitHub + Vercel)

### Design / UI style (mirror OrderShifter)
Hard requirement: GroomRoute should feel like it came from the same product family as OrderShifter.

- Reuse the same design system decisions you already made:
  - Tailwind configuration
  - component library approach (whatever OrderShifter uses)
  - typography scale, spacing rhythm, border radii, shadow style
  - button styles, form styles, card layouts, table patterns
- Reuse the same landing page layout patterns:
  - hero section style
  - section spacing
  - feature card patterns
  - CTA blocks
  - FAQ layout
- The GroomRoute marketing site should be built inside the same Next.js repo style:
  - a public landing page
  - an authenticated app area

If OrderShifter has shared UI primitives, clone the approach. If there is a shared “components/ui” or “design system” folder, follow it exactly.

---

## 5) Routing fundamentals (must implement correctly)

Routing includes several distinct concepts:

### 5.1 Geocoding
Goal: Convert a typed address into coordinates.

When to geocode:
- Groomer “base” address on onboarding
- Customer address on create
- Customer address on edit (re-geocode)

What to store:
- `lat`, `lng`
- normalized/validated address string returned by provider (if available)
- geocode status: `ok | partial | failed`

Never geocode repeatedly for the same unchanged address.

### 5.2 Distance / duration
Routing requires travel time estimates between points.
Use a provider API (Google Maps Platform or Mapbox).

### 5.3 Route optimization
For MVP, do not over-engineer.
Two acceptable approaches:

**Approach A (preferred MVP):** provider “optimize waypoint order”
- Build a route from base → multiple stops → (optionally back to base)
- Provider returns the best stop order + leg durations

**Approach B:** distance matrix + simple heuristic
- Build a time/distance matrix between all points
- Implement a simple ordering heuristic (nearest neighbor + basic constraints)

MVP does not need advanced operations research. Most groomers have ~4–12 stops/day.

### 5.4 Constraints to support (MVP-friendly)
- Service duration per appointment (minutes)
- Start time for the day
- Optional appointment time windows:
  - earliest start, latest end (can be phase 2 if needed)
- End location = base (typical) or last stop (allow config)

### 5.5 Route rebuild behavior
- A route can be generated in “draft”
- When schedule changes, user can:
  - click “Rebuild route”
  - optionally “lock” specific stops (phase 2)

---

## 6) Data model (Prisma direction)

Below is a working schema direction. Adjust naming to match OrderShifter conventions.

### Core entities
- User (auth)
- Account/Tenant (a grooming business)
- Groomer (a person/vehicle)
- Customer
- Pet
- Appointment
- Route
- RouteStop

### Key fields (suggested)

#### Tenant / Account
- `id`
- `name`
- `timezone`
- billing-related fields (phase 2)

#### Groomer
- `id`
- `accountId`
- `name`
- `baseAddress*`
- `baseLat`, `baseLng`
- optional working hours defaults

#### Customer
- `id`
- `accountId`
- `name`, `phone`, `email`
- address fields
- `lat`, `lng`
- `geocodeStatus`

#### Pet
- `id`
- `customerId`
- `name`, `breed`, `notes`
- grooming preferences

#### Appointment
- `id`
- `accountId`
- `groomerId`
- `customerId`
- `petId` (optional but recommended)
- `startAt` (requested)
- `serviceMinutes`
- `status`: booked | cancelled | completed
- optional `earliestStart`, `latestEnd` (time window)
- optional `notes`

#### Route
- `id`
- `accountId`
- `groomerId`
- `routeDate` (date-only semantics; store as DateTime but treat as day)
- `startTime`
- `endTime`
- `totalDriveMinutes`
- `totalDistanceMeters`
- `status`: draft | published | in_progress | completed
- `provider`: google | mapbox | custom
- store route polyline/geometry (optional MVP, useful for map)

#### RouteStop
- `id`
- `routeId`
- `appointmentId` (nullable for non-appointment stops if needed)
- `sequence` (1..N)
- `arrivalTime`
- `departureTime`
- `driveMinutesFromPrev`
- `distanceMetersFromPrev`

Add indexes:
- appointments by `accountId + groomerId + date`
- customers by `accountId`
- routes by `groomerId + routeDate`

---

## 7) Core user flows (must build)

### 7.1 Onboarding
- Create account (business)
- Create first groomer profile (base address)
- Geocode base address
- Create initial preferences (timezone, working hours)

### 7.2 Add customer
- Input address
- Backend geocodes
- If fail: mark status and show UI to fix address

### 7.3 Add appointment
- Choose customer (+ pet)
- Choose date/time, duration
- Assign groomer
- Save appointment

### 7.4 Build route for a day
- User selects a date
- System fetches all booked appointments for groomer/date
- Ensure all stops have lat/lng
- Call routing provider to optimize order + durations
- Create Route + RouteStops
- Return route to UI

### 7.5 View route
- List view (ordered stops)
- Each stop shows:
  - customer + pet
  - arrival time, service time, departure time
  - drive time from previous
- Map view:
  - markers for stops
  - polyline for route (optional MVP but ideal)

### 7.6 Schedule changes → rebuild
- If appointment time changes or cancellation:
  - prompt “Route is out of date”
  - user can rebuild

---

## 8) Background jobs (keep it simple, match OrderShifter approach)

GroomRoute will eventually need scheduled/async work:
- route building (can be sync initially)
- reminders
- cancellation fill suggestions
- messaging (SMS/email)

If OrderShifter uses a worker/queue pattern, mirror it.
If OrderShifter uses:
- BullMQ + Redis (Upstash)
- background job processing
Then GroomRoute should adopt the same pattern.

MVP suggestion:
- Build route generation synchronously for small stop counts
- Add async jobs when needed, using the same infra as OrderShifter

---

## 9) Integrations (plan now, implement later)

### Maps provider
Pick one:
- Google Maps Platform (Geocoding + Directions + Distance Matrix)
- Mapbox (Geocoding + Directions + Matrix)

Implementation requirements:
- Store provider response fields needed for troubleshooting
- Cache/store lat/lng so repeat calls are minimized
- Handle failures gracefully

### Messaging
Phase 2:
- SMS provider (Twilio or similar)
- Email provider (same as OrderShifter if it exists)

---

## 10) App pages / IA (match OrderShifter layout patterns)

Public:
- `/` landing page
- pricing (optional now)
- login/signup

App (auth):
- `/app/dashboard`
- `/app/customers`
- `/app/customers/[id]`
- `/app/appointments`
- `/app/routes`
- `/app/routes/[date]` (or `[id]`)
- `/app/settings` (timezone, base address, maps provider config, etc.)

Use the same navigation shell style as OrderShifter.

---

## 11) Landing page direction (mirror OrderShifter style)

Landing page should reuse the same “conversion structure” patterns:
- Hero: outcome-first headline (time saved + calmer days)
- Show the mechanism: “Optimize My Day” routing
- Feature sections:
  - routing + ETAs
  - scheduling + reschedule
  - cancellation recovery (phase 2 messaging)
  - client-facing professionalism (optional client portal later)
- Proof section (later: testimonials)
- CTA blocks matching OrderShifter’s style

Tone:
- Practical, operator-friendly
- Results-driven, not fluffy
- “This saves you time and headache tomorrow morning” vibe

---

## 12) Engineering acceptance criteria (MVP)

A build is “MVP complete” when:

- Creating customers with addresses stores valid `lat/lng` or clear error state
- Creating appointments works reliably
- Building a route for a day:
  - produces a stable stop order
  - produces ETA/arrival/departure times
  - stores Route + RouteStops in DB
  - renders a readable route list UI
- Rebuilding a route after schedule change works without data corruption
- UI feels like OrderShifter (same spacing, components, polish)

---

## 13) Non-goals (explicitly out of scope for MVP)

- Live GPS tracking of groomer vehicles
- Customer live “track my groomer” portal
- Advanced constraint solver (multi-vehicle VRP with complex constraints)
- Deep CRM automation
- Full billing/subscription gating (can be stubbed)

---

## 14) Notes for the code agent (how to proceed)

1) Inspect the OrderShifter repo structure and copy conventions exactly:
   - folder layout
   - shared UI components
   - auth approach
   - DB config
   - environment variable pattern

2) Create a new GroomRoute app in the same style:
   - either as a separate repo cloned from the same starter
   - or as a new project that mirrors OrderShifter’s structure

3) Implement in this order:
   - Auth + tenant/account scaffolding
   - Customer + geocoding pipeline
   - Appointment CRUD
   - Route builder service
   - Route UI pages (list + map)

4) Keep the routing provider abstracted:
   - `routingProvider.ts` with methods:
     - `geocodeAddress(address)`
     - `optimizeRoute({ origin, stops, destination, startTime })`
   - makes it easy to swap Google/Mapbox later

5) Prefer correctness and UX clarity over complex optimization:
   - MVP: good enough routing for 4–12 stops/day
   - handle edge cases: missing coordinates, invalid addresses, cancellations

---

## 15) Environment variables (examples)

(Names should match OrderShifter conventions)

- `DATABASE_URL`
- `MAPS_PROVIDER` = `google` | `mapbox`
- If Google:
  - `GOOGLE_MAPS_API_KEY`
- If Mapbox:
  - `MAPBOX_ACCESS_TOKEN`

Add any queue/worker env vars only if OrderShifter already uses them.

---

## 16) Glossary

- **Geocoding**: address → lat/lng
- **Distance matrix**: travel-time table between points
- **Directions**: a specific route with legs and polylines
- **Optimization**: choosing stop order to reduce drive time

---

End of file.
