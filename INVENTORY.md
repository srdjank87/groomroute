# GroomRoute Application Inventory

This document provides a comprehensive inventory of all features, pages, routes, components, and database models in the GroomRoute application.

**Last Updated:** January 12, 2026

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
| `/dashboard/settings/profile` | User profile settings |
| `/dashboard/settings/areas` | Service area management (Area Days, Monthly Schedule) |

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

### Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-checkout-session` | POST | Stripe checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

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

### Analytics
- Daily performance metrics
- Revenue statistics
- Route efficiency analysis

### Subscription Tiers
- **TRIAL** - 14-day trial period
- **STARTER** - Basic features
- **GROWTH** - Extended features
- **PRO** - All features

---

## 7. CHANGELOG

### January 12, 2026
- Fixed timezone inconsistency in area override detection
- Removed misleading Client Situations section from Calm Center
- Improved input field styling on new/edit client pages
- Added Phone/Email icons with proper z-index
- Added top padding to textareas for better spacing
- Added Internal Notes section to client profile page
- Created this inventory file

---

## Technical Stack

- **Framework:** Next.js 15 with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with JWT
- **Payments:** Stripe
- **Maps:** Google Maps + Mapbox
- **Styling:** Tailwind CSS + DaisyUI
- **Drag & Drop:** React DnD Kit
