# GroomRoute - Breakage-Fixing Features

This document tracks features that solve real operational problems ("breakage") for mobile pet groomers.

---

## 🎯 MVP Features (Top Priority - Immediate Value)

These features directly fix the most critical, revenue-impacting breakage points and should be included in the initial release.

### 1. Address Validation & Location Intelligence ⭐
**Breakage Fixed:** "Where am I actually going?" - Wrong addresses waste 20+ min per incident

**MVP Features:**
- ✅ Geocoding on address save (already in schema)
- ✅ Geocode status tracking (OK/PARTIAL/FAILED) (already in schema)
- 🔲 Address notes field for gate codes, parking, special instructions
- 🔲 Geocode verification screen - show map pin, "Is this correct?"
- 🔲 "Access instructions" field: gate codes, parking location, which entrance
- 🔲 Flag for "Difficult to find - needs validation on first visit"

**Database Updates Needed:**
```prisma
model Customer {
  // Add these fields:
  addressNotes     String? @db.Text  // Gate codes, parking, etc.
  accessInstructions String? @db.Text // How to access property
  locationVerified Boolean @default(false) // Groomer confirmed location
}
```

**UI Components:**
- Address form with map preview
- Access instructions input
- "Verify location" button on first visit

---

### 2. Pet Behavior & Special Handling Warnings ⭐
**Breakage Fixed:** "I forgot their dog is aggressive" - Safety issues, rescheduling, customer frustration

**MVP Features:**
- 🔲 Behavior flags: Aggressive, Anxious, Bite Risk, Muzzle Required, Two-Person Required
- 🔲 Required equipment tags: Muzzle, Table Extender, Heavy Duty Dryer
- 🔲 **Big red warning badges** on route view and appointment detail
- 🔲 Special handling notes field
- 🔲 Pre-appointment briefing screen with warnings
- 🔲 "Cannot book solo" flag for dangerous dogs

**Database Updates Needed:**
```prisma
enum BehaviorFlag {
  FRIENDLY
  ANXIOUS
  AGGRESSIVE
  BITE_RISK
  MUZZLE_REQUIRED
  TWO_PERSON_REQUIRED
}

enum EquipmentRequired {
  MUZZLE
  TABLE_EXTENDER
  HEAVY_DUTY_DRYER
  EXTRA_TOWELS
  SENSITIVE_SKIN_PRODUCTS
}

model Pet {
  // Add these fields:
  behaviorFlags      BehaviorFlag[]
  equipmentRequired  EquipmentRequired[]
  behaviorNotes      String? @db.Text
  specialHandling    String? @db.Text
  canBookSolo        Boolean @default(true)
}
```

**UI Components:**
- Behavior flag selector (checkboxes)
- Equipment required multi-select
- Warning badges (red/yellow/green)
- Pre-appointment briefing modal

---

### 3. Automated Customer Communication ⭐
**Breakage Fixed:** "I'm running late and customers keep calling" - Wastes 20+ min/day on phone

**MVP Features:**
- 🔲 24-hour appointment reminder (auto-send)
- 🔲 2-hour appointment reminder (auto-send)
- 🔲 "On my way" ETA message (one-click send)
- 🔲 "Running behind" mass update - delays all appointments and auto-notifies
- 🔲 Appointment confirmation system (24hr before)
- 🔲 Template message library

**Database Updates Needed:**
```prisma
enum MessageType {
  REMINDER_24HR
  REMINDER_2HR
  ON_MY_WAY
  RUNNING_LATE
  CONFIRMATION_REQUEST
  CUSTOM
}

model Message {
  id            String      @id @default(cuid())
  accountId     String
  customerId    String
  appointmentId String?
  messageType   MessageType
  content       String      @db.Text
  sentAt        DateTime    @default(now())
  deliveryStatus String?    // sent, delivered, failed
  customer      Customer    @relation(fields: [customerId], references: [id])
  appointment   Appointment? @relation(fields: [appointmentId], references: [id])

  @@index([accountId])
  @@index([customerId])
  @@index([appointmentId])
}

model Appointment {
  // Add these fields:
  reminderSent24hr  Boolean @default(false)
  reminderSent2hr   Boolean @default(false)
  customerConfirmed Boolean @default(false)
  confirmedAt       DateTime?
  messages          Message[]
}

model MessageTemplate {
  id        String      @id @default(cuid())
  accountId String
  name      String      // "24hr Reminder", "On My Way", etc.
  type      MessageType
  content   String      @db.Text  // Can include variables: {customerName}, {time}, {eta}
  isActive  Boolean     @default(true)
  createdAt DateTime    @default(now())

  @@index([accountId])
}
```

**Integration Required:**
- SMS provider (Twilio recommended)
- Background job queue for scheduled messages

**UI Components:**
- "Running late" button with delay selector
- "Send update" quick actions on route view
- Message template manager in settings
- Message history log

---

### 4. Cancellation Gap-Fill System ⭐
**Breakage Fixed:** "The 2pm cancelled, now I have a 2-hour gap" - Lost $80+ revenue, wasted time

**MVP Features:**
- 🔲 Instant gap detection when appointment is cancelled
- 🔲 **"Fill this gap" suggestions** - nearby customers who want bookings
- 🔲 Waitlist by zone/timeframe
- 🔲 One-click broadcast to nearby customers: "Opening in your area today"
- 🔲 "Squeeze-in" appointment type (shorter services)
- 🔲 Optional gap-fill discount setting

**Database Updates Needed:**
```prisma
enum AppointmentType {
  FULL_GROOM
  BATH_ONLY
  NAIL_TRIM
  FACE_FEET_FANNY
  SQUEEZE_IN  // Quick service for filling gaps
  ADDON
}

model Appointment {
  // Add:
  appointmentType AppointmentType @default(FULL_GROOM)
}

model CustomerWaitlist {
  id              String   @id @default(cuid())
  accountId       String
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  preferredDays   String[] // ["MONDAY", "TUESDAY"]
  preferredTimes  String[] // ["MORNING", "AFTERNOON"]
  flexibleTiming  Boolean  @default(true)
  maxDistance     Int?     // Miles willing to travel from home
  notifyViaSMS    Boolean  @default(true)
  notifyViaEmail  Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@index([accountId])
  @@index([customerId])
}

model GapFillNotification {
  id            String   @id @default(cuid())
  accountId     String
  routeId       String
  route         Route    @relation(fields: [routeId], references: [id])
  gapStartTime  DateTime
  gapEndTime    DateTime
  customersSent Int      @default(0)
  bookingsGained Int     @default(0)
  sentAt        DateTime @default(now())

  @@index([accountId])
  @@index([routeId])
}
```

**Service Logic:**
```typescript
// lib/services/gap-fill.ts
async function detectAndFillGap(cancelledAppointmentId: string) {
  // 1. Calculate gap time window
  // 2. Find nearby waitlist customers (within X miles)
  // 3. Filter by availability/preferences
  // 4. Send broadcast message
  // 5. Track responses
}
```

**UI Components:**
- "Gap detected!" alert on route page
- "Find customers to fill gap" button
- Waitlist management page
- Gap-fill broadcast composer

---

### 5. Route Efficiency Analytics ⭐
**Breakage Fixed:** "I'm paying for drive time, not grooming time" - 3hrs/day wasted driving

**MVP Features:**
- 🔲 Drive time vs work time breakdown (per route, per week)
- 🔲 Route efficiency score: "Current: 2.3hrs drive. Optimized: 1.1hrs - SAVE 72min"
- 🔲 **Before/after route comparison** when optimizing
- 🔲 Weekly summary: total miles, gas cost estimate, efficiency trends
- 🔲 Zone-based scheduling suggestions: "3 customers in Riverside - book same day?"
- 🔲 Color-coded route map: green = efficient, yellow = ok, red = inefficient segments

**Database Updates Needed:**
```prisma
model Route {
  // Already have these - just need to display them:
  // totalDriveMinutes
  // totalDistanceMeters

  // Add:
  totalServiceMinutes Int?
  efficiencyScore     Float? // 0-100, higher = better (work time / total time)
  estimatedGasCost    Float?
  gapFillNotifications GapFillNotification[]
}

model RouteAnalytics {
  id                String   @id @default(cuid())
  accountId         String
  groomerId         String
  weekOf            DateTime @db.Date
  totalRoutes       Int
  totalMiles        Float
  totalDriveMinutes Int
  totalWorkMinutes  Int
  averageEfficiency Float
  estimatedGasCost  Float
  createdAt         DateTime @default(now())

  @@unique([groomerId, weekOf])
  @@index([accountId])
  @@index([groomerId])
}
```

**Calculations:**
```typescript
// Efficiency Score = (Total Service Time / Total Time) * 100
// Total Time = Drive Time + Service Time
// Target: 70% service, 30% drive
```

**UI Components:**
- Route efficiency card on dashboard
- Before/after comparison modal when optimizing
- Weekly analytics page
- Efficiency trends chart

---

## 📋 Post-MVP Features (Phase 2+)

These features solve important breakage but can wait until after core MVP is validated.

### Phase 2A: Enhanced Scheduling Intelligence

#### 6. Smart Scheduling Suggestions
**Breakage Fixed:** "I don't know if I can fit them in" - Lost bookings, mental overhead

**Features:**
- Real-time route simulator - drag-and-drop new appointment
- "Best available slot" finder based on customer location
- Tentative hold system - reserve slot, confirm later
- Route capacity indicators (6/8 slots filled)
- Weekly capacity heatmap

**Database:**
```prisma
model AppointmentHold {
  id            String   @id @default(cuid())
  appointmentId String
  customerId    String
  groomerId     String
  proposedTime  DateTime
  expiresAt     DateTime
  confirmed     Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

---

#### 7. Equipment & Supply Management
**Breakage Fixed:** "My van is packed wrong" - Forgot supplies, wasted trips home

**Features:**
- Service-specific supply lists
- Pet profile equipment tags (already started in #2)
- Pre-route morning checklist
- Inventory tracking (simple: low/ok/full)
- Restocking alerts

**Database:**
```prisma
model SupplyItem {
  id          String  @id @default(cuid())
  accountId   String
  name        String
  category    String  // Shampoo, Tools, Dryer, etc.
  stockLevel  String  // LOW, OK, FULL
  reorderAt   String  // LOW threshold
  lastChecked DateTime?
}

model RouteSupplyChecklist {
  id             String   @id @default(cuid())
  routeId        String
  route          Route    @relation(fields: [routeId], references: [id])
  checklistItems Json     // [{item: "Large dog shampoo", checked: true}]
  completedAt    DateTime?
  createdAt      DateTime @default(now())
}
```

---

#### 8. Customer Rebooking Automation
**Breakage Fixed:** "Mrs. Johnson's dog needs grooming every 6 weeks but I forget"

**Features:**
- Auto-recurring appointment suggestions
- Recommended frequency per dog/breed
- "Overdue customers" dashboard
- Proactive booking invites (auto-text at 5 weeks)
- Loyalty/VIP customer tracking

**Database:**
```prisma
model Customer {
  // Add:
  preferredFrequencyWeeks Int? // How often they typically book
  lastBookedDate          DateTime?
  isVIP                   Boolean @default(false)
  lifetimeValue          Float   @default(0)
}

model RebookingRule {
  id                String @id @default(cuid())
  petId             String
  pet               Pet    @relation(fields: [petId], references: [id])
  recommendedWeeks  Int    // 6 weeks for doodles, 8 for short-hair, etc.
  autoRemindEnabled Boolean @default(true)
  lastRemindedAt    DateTime?
}
```

---

#### 9. No-Show Prevention
**Breakage Fixed:** "I arrived but they're not home" - Wasted drive, lost income

**Features:**
- Mandatory appointment confirmations (24hr)
- Auto-confirmation reminders (text at 24hr, 2hr)
- No-show tracking per customer
- Deposit requirement toggle
- "Customer confirmed" indicator on route

**Database:**
```prisma
model Customer {
  // Add:
  noShowCount        Int     @default(0)
  requiresDeposit    Boolean @default(false)
  reliabilityScore   Float?  // 0-100, based on show rate
}

model Appointment {
  // Add (some already in #3):
  confirmationRequired Boolean @default(true)
  depositPaid         Boolean @default(false)
  depositAmount       Float?
}
```

---

### Phase 2B: Financial Intelligence

#### 10. Profitability Analytics
**Breakage Fixed:** "I have no idea if I'm making money"

**Features:**
- Daily route profitability breakdown
- Per-dog profitability (time vs charge)
- Mileage tracking from routes
- Pricing suggestions for difficult dogs
- Customer lifetime value

**Database:**
```prisma
model RouteFinancials {
  id              String   @id @default(cuid())
  routeId         String   @unique
  route           Route    @relation(fields: [routeId], references: [id])
  totalRevenue    Float
  gasCost         Float
  suppliesCost    Float?
  totalMinutes    Int
  netProfit       Float
  effectiveHourlyRate Float
  createdAt       DateTime @default(now())
}

model AppointmentFinancials {
  id                  String      @id @default(cuid())
  appointmentId       String      @unique
  appointment         Appointment @relation(fields: [appointmentId], references: [id])
  chargedAmount       Float
  actualMinutes       Int
  driveTimeMinutes    Int
  effectiveHourlyRate Float
  isProfitable        Boolean
  notes               String?     @db.Text
  createdAt           DateTime    @default(now())
}
```

---

### Phase 3: Advanced Features

#### 11. Customer Self-Service Portal
- Online booking page
- Live ETA tracking
- Appointment history
- Rescheduling
- Payment processing

#### 12. Team/Multi-Groomer Features
- Multi-vehicle route optimization
- Team calendar view
- Groomer capacity balancing
- Customer assignment rules

#### 13. Advanced Route Optimization
- Manual drag-and-drop reordering
- Lock specific stops in place
- Break time scheduling
- Multi-day route planning

#### 14. Integrations
- Calendar sync (Google Calendar)
- Accounting software (QuickBooks)
- Payment processing (Stripe, Square)
- Email marketing tools

---

## Implementation Priority

### Sprint 1-2 (MVP Core)
1. ✅ Project setup (COMPLETE)
2. 🔲 Authentication system
3. 🔲 Basic customer/pet CRUD
4. 🔲 Basic appointment scheduling
5. 🔲 Route optimization (existing schema)

### Sprint 3-4 (MVP Breakage Fixes)
6. 🔲 **Feature #1: Address validation & notes**
7. 🔲 **Feature #2: Behavior warnings & equipment tags**
8. 🔲 **Feature #5: Route efficiency analytics**

### Sprint 5-6 (MVP Communication)
9. 🔲 **Feature #3: Automated messages** (integrate Twilio)
10. 🔲 **Feature #4: Gap-fill system**

### Sprint 7+ (Post-MVP)
11. 🔲 Features #6-10 as prioritized by user feedback

---

## Key Metrics to Track

**MVP Success Metrics:**
1. **Time saved per route** (target: 45+ min/day)
2. **Gap-fill success rate** (% of cancelled appointments refilled)
3. **Customer show rate** (target: 95%+ with confirmations)
4. **Route efficiency score** (target: 65%+ work time vs drive time)
5. **User engagement** (daily active usage, routes optimized per week)

---

## Notes

- All breakage features tie directly to time/money saved
- MVP focuses on the 5 highest-impact features
- Post-MVP features validated by real user feedback
- Keep implementation simple - ship fast, iterate based on data
