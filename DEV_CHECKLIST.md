# GroomRoute Development Checklist

## MVP Implementation Roadmap

### ✅ Phase 0: Foundation (COMPLETE)
- [x] Next.js project setup
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Prisma schema with all models
- [x] Routing provider abstraction (Google Maps + Mapbox)
- [x] Base UI components
- [x] Landing page
- [x] Project documentation

---

### 🔄 Phase 1: Authentication & Account Setup
- [ ] Install and configure NextAuth.js
- [ ] Create auth pages
  - [ ] `/auth/login` - Login page
  - [ ] `/auth/signup` - Sign up page
  - [ ] `/auth/error` - Error handling
- [ ] Implement auth providers
  - [ ] Email/password authentication
  - [ ] Session management
- [ ] Create middleware for protected routes
- [ ] Build onboarding flow
  - [ ] Create account (business name, timezone)
  - [ ] Create first groomer profile
  - [ ] Enter and geocode base address
  - [ ] Set working hours defaults

**Acceptance Criteria:**
- User can sign up and create account
- User can log in/out
- Protected routes redirect to login
- New users complete onboarding
- Groomer base address is geocoded on save

---

### 🔄 Phase 2: Customer Management
- [ ] Create customer list page (`/app/customers`)
  - [ ] Table view with search/filter
  - [ ] Pagination
  - [ ] "Add Customer" button
- [ ] Build customer form
  - [ ] Name, email, phone fields
  - [ ] Address input (street, city, state, zip)
  - [ ] Notes field
  - [ ] Geocoding on save
  - [ ] Show geocoding status
- [ ] Create customer detail page (`/app/customers/[id]`)
  - [ ] View customer info
  - [ ] Edit customer
  - [ ] Delete customer (with confirmation)
  - [ ] List of pets
  - [ ] Add pet functionality
- [ ] Implement pet management
  - [ ] Add pet form (name, breed, species, notes)
  - [ ] Edit pet
  - [ ] Delete pet
- [ ] Create server actions for CRUD
  - [ ] `createCustomer()`
  - [ ] `updateCustomer()`
  - [ ] `deleteCustomer()`
  - [ ] `createPet()`
  - [ ] `updatePet()`
  - [ ] `deletePet()`

**Acceptance Criteria:**
- Can create customers with addresses
- Addresses are geocoded automatically
- Failed geocodes show clear error state
- Can manage pets for each customer
- Customer list loads quickly with pagination

---

### 🔄 Phase 3: Appointment Scheduling
- [ ] Create appointments page (`/app/appointments`)
  - [ ] Calendar view (day/week/month)
  - [ ] List view option
  - [ ] Filter by groomer/status
- [ ] Build appointment form
  - [ ] Select customer (searchable dropdown)
  - [ ] Select pet for customer
  - [ ] Select groomer
  - [ ] Date/time picker
  - [ ] Service duration input
  - [ ] Optional time window fields
  - [ ] Notes field
  - [ ] Price field (optional)
- [ ] Create appointment detail view
  - [ ] Show all appointment details
  - [ ] Edit appointment
  - [ ] Cancel appointment
  - [ ] Mark as completed
- [ ] Implement server actions
  - [ ] `createAppointment()`
  - [ ] `updateAppointment()`
  - [ ] `cancelAppointment()`
  - [ ] `completeAppointment()`
- [ ] Add validation
  - [ ] Prevent double-booking same groomer
  - [ ] Warn if appointment overlaps
  - [ ] Validate time windows

**Acceptance Criteria:**
- Can schedule appointments for customers
- Calendar shows appointments clearly
- Can modify/cancel appointments
- Overlapping appointments trigger warnings
- Customer addresses must be geocoded to book

---

### 🔄 Phase 4: Route Builder Service
- [ ] Create route service (`lib/services/route-builder.ts`)
  - [ ] `buildDailyRoute(groomerId, date)` function
  - [ ] Fetch all booked appointments for day
  - [ ] Validate all addresses are geocoded
  - [ ] Call routing provider API
  - [ ] Save Route and RouteStops to DB
  - [ ] Return route data
- [ ] Implement route calculations
  - [ ] Calculate arrival times based on start time + drive times
  - [ ] Calculate departure times (arrival + service duration)
  - [ ] Handle return to base
- [ ] Add error handling
  - [ ] Missing geocodes
  - [ ] Provider API failures
  - [ ] No appointments for day
  - [ ] Invalid time windows

**Acceptance Criteria:**
- Can generate route from appointments
- Route respects service durations
- ETAs are calculated correctly
- Handles edge cases gracefully
- Route data persists in database

---

### 🔄 Phase 5: Route UI & Visualization
- [ ] Create routes page (`/app/routes`)
  - [ ] Date picker/calendar
  - [ ] List of routes by date
  - [ ] Route status badges
- [ ] Build route detail page (`/app/routes/[date]` or `[id]`)
  - [ ] "Optimize My Day" button
  - [ ] Loading state during optimization
  - [ ] Route list view
    - [ ] Ordered stops with sequence numbers
    - [ ] Customer name + pet
    - [ ] Address
    - [ ] Arrival time
    - [ ] Service time
    - [ ] Departure time
    - [ ] Drive time to next stop
  - [ ] Total summary (drive time, distance, appointments)
  - [ ] "Rebuild Route" button
- [ ] Add map view
  - [ ] Display route polyline
  - [ ] Show stop markers (numbered)
  - [ ] Show base location marker
  - [ ] Popup on marker click (customer info)
  - [ ] Toggle between list/map view
- [ ] Implement route actions
  - [ ] `optimizeRoute()` - Server action
  - [ ] `rebuildRoute()` - Server action
  - [ ] `publishRoute()` - Change status to published
  - [ ] `startRoute()` - Change status to in_progress
  - [ ] `completeRoute()` - Change status to completed

**Acceptance Criteria:**
- One-click route optimization works
- Route displays in clear, ordered list
- Map shows route polyline and stops
- Can rebuild route when schedule changes
- UI is responsive and polished

---

### 🔄 Phase 6: Route Management & Updates
- [ ] Detect stale routes
  - [ ] When appointment is modified, flag route as out of date
  - [ ] When appointment is cancelled, flag route
  - [ ] When new appointment is added, flag route
- [ ] Show "Route out of date" warning
  - [ ] Banner on route page
  - [ ] Prompt to rebuild
- [ ] Implement route rebuild
  - [ ] Preserve manual adjustments (phase 2 feature)
  - [ ] Re-optimize with current appointments
  - [ ] Update all stop times
- [ ] Add route status management
  - [ ] DRAFT → PUBLISHED workflow
  - [ ] PUBLISHED → IN_PROGRESS when day starts
  - [ ] IN_PROGRESS → COMPLETED when day ends
  - [ ] Manual status updates

**Acceptance Criteria:**
- System detects when routes need updates
- Rebuilding route is quick and easy
- Route status workflow is intuitive
- No data loss during rebuilds

---

### 🔄 Phase 7: Dashboard & Settings
- [ ] Create dashboard (`/app/dashboard`)
  - [ ] Today's route summary
  - [ ] Upcoming appointments
  - [ ] Recent customers
  - [ ] Quick stats (appointments today, this week)
  - [ ] Quick actions (add customer, schedule appointment)
- [ ] Create settings page (`/app/settings`)
  - [ ] Account settings (business name, timezone)
  - [ ] Groomer profiles management
    - [ ] Add/edit/delete groomers
    - [ ] Update base addresses
    - [ ] Working hours
  - [ ] Maps provider configuration
  - [ ] Notification preferences (phase 2)
- [ ] Add app layout/navigation
  - [ ] Sidebar navigation
  - [ ] Top bar with user menu
  - [ ] Account switcher (if multi-tenant)
  - [ ] Logout button

**Acceptance Criteria:**
- Dashboard provides useful daily overview
- Settings are easy to find and modify
- Navigation is intuitive
- Consistent layout across all pages

---

### 🔄 Phase 8: Polish & UX Improvements
- [ ] Add loading states everywhere
  - [ ] Skeleton loaders for lists
  - [ ] Spinners for actions
  - [ ] Optimistic UI updates
- [ ] Improve error handling
  - [ ] Toast notifications for actions
  - [ ] Friendly error messages
  - [ ] Retry mechanisms
- [ ] Add confirmation dialogs
  - [ ] Delete customer
  - [ ] Cancel appointment
  - [ ] Delete route
- [ ] Implement search functionality
  - [ ] Search customers by name/address
  - [ ] Search appointments by customer
  - [ ] Filter by date ranges
- [ ] Mobile responsiveness
  - [ ] Test all pages on mobile
  - [ ] Touch-friendly buttons
  - [ ] Mobile-optimized navigation
- [ ] Accessibility
  - [ ] Keyboard navigation
  - [ ] ARIA labels
  - [ ] Focus management
  - [ ] Color contrast

**Acceptance Criteria:**
- App feels fast and responsive
- Errors are handled gracefully
- All actions have visual feedback
- Works well on mobile devices
- Meets basic accessibility standards

---

### 🔄 Phase 9: Testing & Quality Assurance
- [ ] Manual testing
  - [ ] Complete user journey (signup → schedule → optimize)
  - [ ] Test all CRUD operations
  - [ ] Test route optimization with various scenarios
  - [ ] Test geocoding failures
  - [ ] Test API failures
- [ ] Edge cases
  - [ ] No appointments for day
  - [ ] Single appointment
  - [ ] 20+ appointments
  - [ ] Invalid addresses
  - [ ] Overlapping appointments
- [ ] Performance
  - [ ] Page load times
  - [ ] Database query optimization
  - [ ] API response times
  - [ ] Large data sets
- [ ] Browser testing
  - [ ] Chrome, Firefox, Safari
  - [ ] Mobile browsers

**Acceptance Criteria:**
- All core flows work end-to-end
- Edge cases handled properly
- Performance is acceptable
- Works in major browsers

---

### 🔄 Phase 10: Deployment & Launch Prep
- [ ] Set up production database
  - [ ] Provision PostgreSQL (Neon, Supabase, etc.)
  - [ ] Run migrations
  - [ ] Set up backups
- [ ] Configure production environment
  - [ ] Set all environment variables
  - [ ] Configure domain
  - [ ] Set up SSL
- [ ] Deploy to Vercel (or chosen platform)
  - [ ] Connect GitHub repo
  - [ ] Configure build settings
  - [ ] Deploy
- [ ] Post-deployment checks
  - [ ] Test production deployment
  - [ ] Verify database connection
  - [ ] Test geocoding/routing APIs
  - [ ] Check error tracking
- [ ] Set up monitoring
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Uptime monitoring
  - [ ] Analytics (optional for MVP)

**Acceptance Criteria:**
- App is live and accessible
- All features work in production
- Errors are tracked
- Database is backed up

---

## Future Enhancements (Post-MVP)

### Notifications
- [ ] Email notifications
- [ ] SMS notifications (Twilio)
- [ ] Appointment reminders (24hr before)
- [ ] "On my way" notifications with ETA

### Advanced Routing
- [ ] Manual route reordering (drag-and-drop)
- [ ] Lock specific stops in place
- [ ] Multi-vehicle optimization
- [ ] Break time scheduling

### Client Portal
- [ ] Customer-facing booking page
- [ ] Live ETA tracking
- [ ] Appointment history
- [ ] Online payments

### Business Intelligence
- [ ] Revenue tracking
- [ ] Time saved reports
- [ ] Customer frequency analysis
- [ ] Route efficiency metrics

### Integrations
- [ ] Calendar sync (Google Calendar, etc.)
- [ ] Accounting software integration
- [ ] Payment processing
- [ ] Email/SMS provider

---

## Notes

- Focus on getting MVP features working before polish
- Ship authentication + routing ASAP to validate core value
- Iterate based on user feedback
- Keep code quality high but don't over-engineer
- Document decisions in comments

---

**Current Status**: Phase 0 Complete ✅
**Next Up**: Phase 1 - Authentication & Account Setup
