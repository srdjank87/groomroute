# GroomRoute Application Inventory

This document provides a comprehensive inventory of all features, pages, routes, components, and database models in the GroomRoute application.

**Last Updated:** January 13, 2026

---

## 1. PAGES & ROUTES

### Authentication & Onboarding
| Path | Description |
|------|-------------|
| `/` | Landing/home page |
| `/auth/signin` | Sign-in page |
| `/auth/signup` | Sign-up page |
| `/onboarding` | Onboarding flow for new users |
| `/subscription/expired` | Subscription expired page |

### Admin Pages (Password Protected)
| Path | Description |
|------|-------------|
| `/admin` | Admin overview dashboard with key metrics |
| `/admin/login` | Admin login page |
| `/admin/accounts` | Accounts list with filtering and search |
| `/admin/events` | Events log (links to PostHog) |

### Dashboard Pages
| Path | Description |
|------|-------------|
| `/dashboard` | Dashboard homepage/overview with today's appointments |
| `/dashboard/appointments` | Appointments list view |
| `/dashboard/appointments/new` | Create new appointment with smart date suggestions |
| `/dashboard/routes` | Route optimization and management with drag-and-drop |
| `/dashboard/calm` | Calm Control Center (stress management, body care) |
| `/dashboard/analytics` | Analytics and reporting dashboard |
| `/dashboard/customers` | Customer management list |
| `/dashboard/customers/new` | Create new customer with area suggestion |
| `/dashboard/customers/[id]` | Customer detail/edit page with internal notes |
| `/dashboard/customers/[id]/pets/new` | Add pet to customer |
| `/dashboard/customers/[id]/pets/[petId]` | Pet detail/edit page |
| `/dashboard/settings` | Settings hub |
| `/dashboard/settings/profile` | User profile/workload settings |
| `/dashboard/settings/areas` | Service area management (Area Days, Monthly Schedule) |
| `/dashboard/settings/notifications` | Message templates and reminder settings |
| `/dashboard/settings/billing` | Subscription and payment management |
| `/dashboard/settings/team` | Team member management (Pro plan) |
| `/invite/[token]` | Team invitation acceptance page |

---

## 2. API ROUTES

### Authentication & Setup
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | NextAuth configuration |
| `/api/auth/signup` | POST | User registration |
| `/api/onboarding` | GET/POST | Onboarding initialization |

### Customers & Pets
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/customers` | GET/POST | List/create customers |
| `/api/customers/[id]` | GET/PATCH/DELETE | Customer CRUD operations |
| `/api/customers/[id]/pets` | GET/POST | List/create pets for customer |
| `/api/customers/[id]/pets/[petId]` | GET/PATCH/DELETE | Pet CRUD operations |
| `/api/customers/[id]/assign-area` | POST | Assign customer to service area |

### Appointments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments` | GET/POST | List/create appointments |
| `/api/appointments/[id]` | GET/PATCH/DELETE | Appointment CRUD operations |
| `/api/appointments/[id]/skip` | POST | Skip appointment and rebuild route |
| `/api/appointments/calendar` | GET | Calendar view with area data |
| `/api/appointments/check-conflict` | POST | Check for appointment conflicts |
| `/api/appointments/suggest-date` | GET | Suggest next available date based on area days |

### Routes & Optimization
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/routes/optimize` | POST | AI-powered route optimization |
| `/api/routes/assistant` | POST | AI assistant for route suggestions |
| `/api/routes/reorder` | POST | Reorder stops in route |
| `/api/routes/start-workday` | POST | Start workday action |

### Service Areas
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/areas` | GET/POST | List/create service areas |
| `/api/areas/[id]` | GET/PATCH/DELETE | Service area CRUD |
| `/api/areas/suggest` | GET | Suggest area based on zip code |
| `/api/area-assignments` | GET/POST/DELETE | Manage area day assignments |
| `/api/area-date-overrides` | GET/POST/DELETE | Override area for specific dates |

### Breaks & Wellness
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/breaks` | GET/POST | List/create breaks |
| `/api/breaks/take` | POST | Mark break as taken |
| `/api/breaks/suggest` | GET | Smart break suggestions |

### Waitlist & Gap-Fill
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/waitlist` | GET/POST/DELETE | List/add/remove waitlist entries |
| `/api/waitlist/suggest` | GET | Smart suggestions based on proximity, value, reliability |
| `/api/gaps` | GET | Find schedule gaps and suggest waitlist clients |

### Calm Control Center
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calm/overview` | GET | Day overview and stress indicators |
| `/api/calm/running-late` | POST | Handle running late scenarios |
| `/api/calm/no-show` | POST | Handle customer no-shows |
| `/api/calm/contact` | POST | Contact customer |
| `/api/calm/reply-help` | POST | AI help for customer replies |
| `/api/calm/protect-evening` | POST | Protect end-of-day |
| `/api/calm/breather` | GET | Breathing/meditation exercises |
| `/api/calm/upset-customer` | POST | Handle upset customers |
| `/api/calm/lighten-day` | POST | Reduce schedule burden |
| `/api/calm/travel-risk` | GET | Travel risk assessment |

### Groomer Settings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/groomer/settings` | GET/PATCH | Groomer preferences |
| `/api/groomer/working-hours-check` | GET | Check working hours validation |
| `/api/groomer/large-dog-count` | GET | Track large dog limits |

### Location & Dashboard
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/geocode` | POST | Address geocoding (Google Maps) |
| `/api/dashboard/today` | GET | Today's dashboard data |
| `/api/dashboard/revenue-stats` | GET | Revenue statistics |
| `/api/dashboard/performance` | GET | Performance metrics |
| `/api/dashboard/generate-sample` | POST | Generate sample data for demo |
| `/api/dashboard/clear-sample` | DELETE | Clear sample data |

### Payments & Subscription
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-checkout-session` | POST | Stripe checkout session |
| `/api/subscription` | GET | Get current subscription info |
| `/api/subscription/portal` | POST | Create Stripe billing portal session |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

### Message Templates
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/message-templates` | GET/POST | List/create message templates |
| `/api/message-templates/[id]` | PATCH/DELETE | Update/delete message template |

### Admin APIs (Password Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/accounts` | GET | List all accounts with filtering |
| `/api/admin/account/[id]` | GET | Get single account details |
| `/api/admin/metrics` | GET | Get admin dashboard metrics |

### Team Management (Pro Plan)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/team/invite` | POST | Send team invitation |
| `/api/team/invitations` | GET | List all invitations |
| `/api/team/invitations/[id]` | DELETE | Revoke pending invitation |
| `/api/team/members` | GET | List team members with seat info |
| `/api/team/members/[id]` | DELETE | Remove team member |
| `/api/invite/[token]` | GET | Validate invitation token |
| `/api/invite/[token]/accept` | POST | Accept invitation and create account |

---

## 3. COMPONENTS

### UI Components (Base Design System)
| Component | Description |
|-----------|-------------|
| `components/ui/button.tsx` | Button component |
| `components/ui/input.tsx` | Input field component |
| `components/ui/card.tsx` | Card/panel wrapper |
| `components/ui/appointment-calendar.tsx` | Custom calendar with area day indicators |

### Feature Components
| Component | Description |
|-----------|-------------|
| `components/MapPreview.tsx` | Map display for addresses with verification |
| `components/AddressAutocomplete.tsx` | Google Places autocomplete |
| `components/TrialStatus.tsx` | Trial status/subscription banner |
| `components/FacebookPixel.tsx` | Facebook Pixel client-side tracking |

### Route Management Components
| Component | Description |
|-----------|-------------|
| `components/routes/DraggableAppointmentCard.tsx` | Draggable appointment card |
| `components/routes/SortableAppointment.tsx` | Sortable appointment wrapper |
| `components/routes/ReorderConfirmModal.tsx` | Route reorder confirmation dialog |

---

## 4. UTILITY LIBRARIES (`lib/`)

| File | Description |
|------|-------------|
| `lib/auth.ts` | NextAuth configuration with JWT strategy |
| `lib/prisma.ts` | Prisma client instance |
| `lib/features.ts` | Feature matrix and subscription plan definitions |
| `lib/feature-helpers.ts` | Helper functions for feature access |
| `lib/workload-assessment.ts` | Unified workload assessment system |
| `lib/break-calculator.ts` | Smart break suggestions |
| `lib/benchmarks.ts` | Industry benchmarks for grooming |
| `lib/area-matcher.ts` | Area assignment matching with date overrides |
| `lib/geocoding.ts` | Address geocoding utilities |
| `lib/stripe.ts` | Stripe integration |
| `lib/performance-calculator.ts` | Performance metrics calculation |
| `lib/daily-quotes.ts` | Motivational quotes |
| `lib/routing/` | Routing module (Google Maps, Mapbox providers) |
| `lib/utils/` | Utility functions (date formatting, classnames) |
| `lib/posthog.tsx` | PostHog client-side provider with user identification |
| `lib/posthog-server.ts` | PostHog server-side client for API tracking |
| `lib/facebook-capi.ts` | Facebook Conversion API client with data hashing |
| `lib/admin-auth.ts` | Admin password authentication helper |
| `lib/watchlist-suggest.ts` | Smart watchlist suggestion engine with multi-factor scoring |

---

## 5. DATABASE MODELS

### Core Models
- **User** - User accounts with roles (ADMIN/GROOMER/VIEWER)
- **Account** - Business account with subscription management
- **Groomer** - Person/vehicle with working hours and settings
- **Customer** - Client with address, location, notes, cancellation tracking
- **Pet** - Pet details with behavior flags and equipment requirements
- **Appointment** - Bookings with service time, pricing, confirmation

### Route Management
- **Route** - Daily driving plan with optimization metrics
- **RouteStop** - Individual stop with sequence and timing

### Service Areas (Area Days Feature)
- **ServiceArea** - Named location groupings with colors
- **AreaDayAssignment** - Day-of-week assignment to areas
- **AreaDateOverride** - Date-specific override for area assignment

### Communication
- **Message** - Sent messages with delivery status
- **MessageTemplate** - Reusable message templates

### Wellness
- **Break** - Break tracking with type and status

### Revenue
- **CustomerWaitlist** - Gap-fill appointment waitlist
- **GapFillNotification** - Gap-fill notification tracking

### Team Management
- **TeamInvitation** - Team invitations with tokens, expiry, status (PENDING/ACCEPTED/EXPIRED/REVOKED)

---

## 6. KEY FEATURES

### Routing & Optimization
- One-tap route optimization (Google Maps, Mapbox)
- Drag-and-drop route reordering
- Drive time and distance calculations
- Route efficiency scoring
- Area day scheduling with date overrides

### Customer & Appointment Management
- Customer profiles with pets, addresses, internal notes
- Pet behavior flags and equipment tracking
- Appointment conflict detection
- Smart date suggestions based on area days
- Appointment status workflow

### Workload Intelligence
- Real-time workload assessment
- Dog size and energy cost tracking
- Assistant mode with capacity adjustments
- Large dog daily limits
- Working hours validation

### Wellness (Calm Center)
- Smart break suggestions
- Day stress indicators
- Running late handling
- No-show management
- Body care stretches and exercises

### Communication
- SMS and email messaging
- Message templates
- Running late bulk notifications
- Customer contact history

### Analytics & Tracking
- Daily performance metrics
- Revenue statistics
- Route efficiency analysis
- PostHog product analytics (events, funnels, session replays)
- Facebook Pixel for ad tracking
- Facebook Conversion API for server-side conversion tracking

### Admin Dashboard
- Password-protected admin area
- Account management and filtering
- Key business metrics
- Links to PostHog for detailed analytics

### Subscription Tiers
- **TRIAL** - 14-day free trial (all plans)
- **STARTER** - $39/mo ($32/mo yearly) - 50 clients, route optimization, area scheduling
- **GROWTH** - $79/mo ($66/mo yearly) - Unlimited clients, Calm Center, wellness features
- **PRO** - $149/mo ($124/mo yearly) - Multi-groomer, team features:
  - Base price includes 1 admin seat with full access
  - Additional admin seats: +$49/mo ($41/mo yearly)
  - Groomer seats: +$29/mo ($25/mo yearly) - Daily schedule, route, Calm Center only

---

## 7. CHANGELOG

### January 13, 2026
- **Team Management for Pro Plan:**
  - Added team invitation system for Pro plan seat management
  - New database model `TeamInvitation` with token-based invites, expiry dates, and status tracking
  - Added seat tracking fields to Account model: `adminSeats`, `groomerSeats`
  - Created `/dashboard/settings/team` page with:
    - Seat usage overview (admin vs groomer seats)
    - Team member list with role badges
    - Invite modal with role selection
    - Pending invitation management
    - Groomer profile management (separate from user accounts)
  - Created invitation flow:
    - Admin sends invite via email address and role selection
    - System generates unique token link (7-day expiry)
    - Invitee visits `/invite/[token]` to accept and create account
    - Seat availability checked before invite and acceptance
  - New API endpoints:
    - `POST /api/team/invite` - Send invitation
    - `GET /api/team/invitations` - List invitations
    - `DELETE /api/team/invitations/[id]` - Revoke invitation
    - `GET /api/team/members` - List members with seat info
    - `DELETE /api/team/members/[id]` - Remove member
    - `GET /api/invite/[token]` - Validate token
    - `POST /api/invite/[token]/accept` - Accept and create account
  - Updated Stripe webhook to sync seat counts from subscription metadata

- **Pro Plan Pricing Model Update:**
  - Changed Pro plan to base price + optional seats model:
    - **Base:** $149/mo ($124/mo yearly) - Includes 1 admin seat with full access
    - **Additional Admin Seats:** +$49/mo ($41/mo yearly) each
    - **Groomer Seats:** +$29/mo ($25/mo yearly) each - Limited access
  - Updated landing page Pro pricing card to show $149 base with add-on info
  - Updated signup page team size selector:
    - Shows base Pro price with included admin seat
    - Optional additional admin seats (0-5)
    - Optional groomer seats (0-19)
    - Dynamic total calculation
  - Updated checkout session API (`app/api/create-checkout-session/route.ts`):
    - Accepts `additionalAdminSeats` and `groomerSeats` parameters
    - Creates Stripe line items: base price + optional seat add-ons
    - Stores seat counts in subscription metadata
  - Updated Stripe configuration (`lib/stripe.ts`):
    - Pro base price ID: `STRIPE_PRO_MONTHLY_PRICE_ID` ($149/mo)
    - Additional admin: `STRIPE_PRO_ADMIN_MONTHLY_PRICE_ID` ($49/mo)
    - Groomer seat: `STRIPE_PRO_GROOMER_MONTHLY_PRICE_ID` ($29/mo)
  - Added role-based feature gating (`lib/feature-helpers.ts`):
    - `canAccessByRole()` - Check if user's role allows feature access
    - `canAccessAnalytics()`, `canManageCustomers()`, `canScheduleAppointments()`, etc.
    - `getRoleBasedFeatures()` - Get full list of user's permissions
  - Groomer seat users (UserRole.GROOMER) are restricted from:
    - Analytics/revenue reports
    - Team management
    - Billing/subscription management
    - Customer management (create, edit, delete)
    - Appointment scheduling (create, edit appointments)
    - Settings pages (except own profile)

- **Bug Fix: Sample data generator creating multiple groomers on non-Pro plans**
  - Generate-sample route was creating additional groomers regardless of subscription plan
  - This caused inflated analytics numbers since appointments were distributed across all groomers
  - Fixed to only create additional groomers for Pro plan accounts
  - Non-Pro accounts now only use their primary groomer for sample data

- **Bug Fix: Analytics earnings showing inflated numbers**
  - Revenue stats API was not filtering by groomerId
  - For multi-groomer accounts, was showing combined revenue from ALL groomers
  - Fixed `/api/dashboard/revenue-stats/route.ts` to filter appointments by current groomer's ID
  - Affected metrics: weekly earnings, monthly earnings, lost revenue, completion rate

- **Service Areas Settings - Mobile Optimization:**
  - **Your Areas cards:** Hide assigned days list on mobile to prevent text cutoff
  - **Default Weekly Pattern:** Changed from cramped 7-column grid to vertical list on mobile
    - Shows full day names (Sunday, Monday, etc.) instead of abbreviations
    - Each day is a full-width row with day name and area name clearly visible
  - **Monthly Schedule Calendar:**
    - Smaller day headers on mobile (single letters: S, M, T, W, T, F, S)
    - Reduced cell padding and minimum height for better fit
    - Area indicator shows larger colored dot on mobile (no truncated text)
    - Smaller date number font on mobile
  - **Legend:** More compact on mobile, "Override" label shortened

- **Landing Page - Calm Center Emphasis:**
  - Added dedicated "Calm Control Center" highlight section before pricing
    - Eye-catching badge "Only on Growth & Pro Plans"
    - Three feature cards: Workload Protection, Stress Detection, Quick Rescues
    - Visual mockup showing day status indicator
  - Updated pricing cards to emphasize Calm Center availability:
    - Starter: Shows "Calm Control Center" as NOT included (grayed out with X icon)
    - Growth: Calm Center highlighted with green background and Shield icon
    - Pro: Shows Calm Center included with Shield icon
  - Goal: Push users from Starter to Growth plan by highlighting exclusive features

- **Pricing Update:**
  - Lowered pricing to be more accessible for solo groomers
  - Starter: $89/mo → $39/mo (yearly: $74 → $32/mo)
  - Growth: $179/mo → $79/mo (yearly: $149 → $66/mo)
  - Pro: $329/mo → $149/mo (yearly: $274 → $124/mo)
  - Kept 14-day free trial on all plans

- **Bug Fix: Calm Center showing wrong appointment count (16 instead of 6)**
  - Same timezone bug as dashboard - was using server local time instead of account timezone
  - Same groomerId bug - was showing all account appointments instead of current groomer's
  - Updated `/api/calm/overview/route.ts` to use account timezone and filter by groomerId

- **Bug Fix: Pre-fill suggested time on new appointment page**
  - Fixed URL parameters `suggestedDate` and `suggestedTime` not being used to pre-fill the date/time fields
  - When clicking "Book any client for this slot" from Routes page gap-fill section, time is now pre-filled
  - Fixed time format from 12-hour (8:00 AM) to 24-hour (08:00) for HTML time input compatibility

- **Smart Watchlist Suggest Feature:**
  - Created intelligent suggestion engine (`lib/watchlist-suggest.ts`) that scores waitlist customers based on:
    - Day/time preference matching (30 pts)
    - Service area alignment with groomer's schedule (25 pts)
    - Proximity to scheduled appointments using Haversine formula (20 pts)
    - Customer lifetime value and spending tier (15 pts)
    - Reliability score based on cancellation/no-show history (10 pts)
    - Recency bonus for customers due for appointments (10 pts)
  - Created `/api/waitlist/suggest` endpoint with filters:
    - `date`: Target date (defaults to today)
    - `limit`: Max suggestions (default 10)
    - `minReliability`: Filter by tier (excellent/good/fair/poor)
    - `valueTier`: Filter by value (high/medium/low)
    - `maxDistance`: Maximum miles from route
  - Returns rich customer data including:
    - Total revenue, average appointment value, appointment count
    - Last appointment date and days since
    - Completion rate and reliability tier
    - Distance to today's route
    - Value tier (high/medium/low based on revenue quartiles)

### January 12, 2026 (Session 2)
- **Analytics & Tracking Implementation:**
  - Added PostHog analytics integration (`lib/posthog.tsx`, `lib/posthog-server.ts`)
  - Added Facebook Pixel client-side tracking (`components/FacebookPixel.tsx`)
  - Added Facebook Conversion API server-side tracking (`lib/facebook-capi.ts`)
  - Updated Stripe webhook to track StartTrial and Subscribe events via PostHog and FB CAPI
  - Added `lastActiveAt` field to Account model for user activity tracking
- **Admin Dashboard:**
  - Created password-protected admin area at `/admin`
  - Admin authentication helper (`lib/admin-auth.ts`)
  - Admin login page (`app/admin/login/page.tsx`)
  - Admin overview dashboard (`app/admin/page.tsx`) with key metrics
  - Accounts management page (`app/admin/accounts/page.tsx`) with filtering
  - Events log page (`app/admin/events/page.tsx`) linking to PostHog
  - Admin APIs: `/api/admin/login`, `/api/admin/accounts`, `/api/admin/metrics`, `/api/admin/account/[id]`
- **Bug Fixes:**
  - Fixed dashboard appointment count mismatch between "Ready when you are" and "Your Progress" sections
  - Root cause 1: Performance API was using server local time while Today API used account timezone
  - Root cause 2: Today API wasn't filtering by groomerId while Performance API was
  - Updated `/api/dashboard/performance/route.ts` to use account timezone (date-fns-tz)
  - Updated `/api/dashboard/today/route.ts` to filter by groomerId
- **Sample Data Generation:**
  - Changed from 5-8 total appointments per day to 4-6 appointments PER GROOMER per day
  - Ensures each groomer has meaningful data for testing

### January 12, 2026 (Session 1)
- Fixed timezone inconsistency in area override detection
- Removed misleading Client Situations section from Calm Center
- Improved input field styling on new/edit client pages
- Added Phone/Email icons with proper z-index
- Added top padding to textareas for better spacing
- Added Internal Notes section to client profile page
- Created this inventory file
- **Design Consistency Pass:**
  - Standardized input field styling across all pages (bg-gray-50, border-2, focus:border-[#A5744A])
  - Added pl-4 padding to pet name/breed/age/weight fields on pet new/edit pages
  - Added pl-4 pt-3 padding to all textareas on pet new/edit pages
  - Fixed customer list search input to use consistent styling
  - Fixed new appointment search input to use consistent styling
  - Fixed new appointment custom service name input styling
  - Fixed new appointment notes textarea styling
  - Fixed settings/areas area name input styling
  - Fixed address icon on edit client page (added z-10 pointer-events-none)
- Added high-risk client warning system:
  - Shows alert on client profile page for 3+ no-shows or cancellations
  - Shows warning when booking appointments for high-risk clients
  - Includes actionable tips (require deposit, send reminders, confirm via phone)
  - Displays last no-show/cancellation date for context
- Fixed service type icons: Full Groom now uses 🐕 consistently (was 💇 on appointments list)
- **Bug Fixes & New Features:**
  - Fixed subscription reactivation: Page now calls correct API endpoint (`/api/create-checkout-session`)
  - API now handles resubscription properly (skips trial, redirects to dashboard)
  - Created Notifications settings page with message template management
  - Created Billing settings page with Stripe portal integration
  - Added subscription info API (`/api/subscription`)
  - Added Stripe billing portal API (`/api/subscription/portal`)
  - Added message templates API (`/api/message-templates`)
  - Fixed geocoding during onboarding (was marked as TODO, now actually geocodes address)

---

## Technical Stack

- **Framework:** Next.js 15 with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with JWT
- **Payments:** Stripe
- **Maps:** Google Maps + Mapbox
- **Styling:** Tailwind CSS + DaisyUI
- **Drag & Drop:** React DnD Kit
- **Analytics:** PostHog
- **Ad Tracking:** Facebook Pixel + Conversion API
