# Calm Center — Product & UI Specification

## Purpose
The Calm Center is the emotional and operational control hub of GroomRoute. It exists to help groomers stabilize their day when things go off-track by offering **simple, one-tap solutions** to the most stressful real-world scenarios.

The Calm Center must:
- Feel emotionally reassuring and non-technical  
- Surface only what matters  
- Allow resolution in **1–2 taps max**  
- Handle complexity behind the scenes (scheduling, messaging, routes, confirmations)  
- Celebrate stability, not just “fixing problems”  

---

## Core UX Principles

1. **Calm on the surface, powerful underneath**  
   Show simple options. Do heavy logic silently.

2. **Contextual intelligence**  
   Calm Center should *proactively* suggest help based on actual day conditions.

3. **Minimal cognitive load**  
   No raw chat lists. No heavy dashboards. Only:
   - “Here’s what’s happening”
   - “Here’s what we recommend”
   - “Tap to fix”

4. **Narrate the outcome**  
   Always tell the user what was fixed in human language.

5. **Emotionally aware tone**
   Calm, empathetic, encouraging, supportive.

---

# Calm Center Main Layout

## 1️⃣ Header — “Today at a Glance”
A calming summary of the day’s stability.

### Elements
- Status indicator:
  - Green = Smooth  
  - Yellow = Tight  
  - Red = Overloaded  
- Tone line (example):
  - “Today looks smooth and manageable 🙂”
  - “Today is a bit tight, but we’ve got it.”
  - “Today is overloaded — let’s lighten it together.”
- Key stats:
  - Total appointments  
  - Potential stress points (late start, tight travel, heavy workload)

---

## 2️⃣ Section A — “Quick Rescues” (Dynamic Recommendations)
This section updates based on live conditions.  
Each rescue is a **card with 1 primary button**.

### Examples of Dynamic Cards

#### Running Behind
> “You’re running ~25 minutes behind. Want us to shift affected appointments forward and notify customers?”

Button: **Fix My Day**

---

#### Missing Confirmations
> “2 customers haven’t confirmed tomorrow. Want to nudge them?”

Button: **Send Reminders**

---

#### Travel Risk
> “Your travel time between two stops looks tight. Want to smooth it?”

Button: **Fix My Route**

---

#### Schedule Gap
> “You have a 90-minute gap today. Want help filling it?”

Button: **Help Me Fill It**

---

### Behavior Rules
- Show max 3–5 at once  
- Order by urgency + emotional impact  
- Cards disappear once resolved  

---

## 3️⃣ Section B — Common Calm Actions (Always Available)
A grid or list of core one-tap tools grouped by scenario.

---

### Group 1 — When Behind or Overloaded

#### Action: “I’m Running Late”
Flow:
1. Detect which appointments are impacted  
2. Suggest shifting schedule  
3. Send bulk SMS notifications  

Outcome:
> “We’ve adjusted 3 appointments and notified everyone. You’re back on track.”

---

#### Action: “Today Is Too Heavy”
Flow:
- Offer 2–3 relief strategies:
  - Move one job  
  - Push last job to tomorrow  
  - Break day into lighter flow  

---

### Group 2 — Customer Changes / Cancels

#### Action: “Customer Wants to Reschedule”
- Suggest best alternate times  
- Provide 2–3 templated responses  
- One-tap send + reschedule  

---

#### Action: “Cancellation / No-Show”
Options:
- Apply late fee  
- Offer reschedule  
- Open slot to waitlist  

---

### Group 3 — Tough Conversations

#### Action: “Help Me Reply to This Customer”
Reply tone presets:
- Extra gentle  
- Kind but clear  
- Policy-firm & professional  

---

#### Action: “Customer Is Upset”
Paths:
- Apology + repair  
- Clarification  
- Boundary enforcement  

Each → suggested replies.

---

### Group 4 — Boundaries & Wellbeing

#### Action: “Protect My Evening”
Ensure day doesn’t exceed selected cutoff.

---

#### Action: “Give Me a Breather”
- Insert 15–30 minute break  
- Suggest safest reflow  
- Notify affected customers  

---

## 4️⃣ Section C — Customer Situations Inbox (Calm Inbox)

This is **not** a chat app.  
It is a list of situations requiring attention.

### UI Example
- ✅ 4 customers confirmed new times (no action needed)  
- ⚠️ 1 customer can’t do new time (Tap to resolve)  
- 😕 Sarah: “I’m worried about last groom” (Tap to reply)

### Tap State
- Show appointment context  
- Show customer message  
- Offer 2–3 suggested replies  
- Optional custom message  
- One-tap send  

### Auto Handling
- Auto resolve “OK 👍” replies silently  
- Only surface exceptions  

---

## 5️⃣ Section D — “You & Your Day”
A supportive wellness section.

Examples:
- “Today has more high-stress dogs than usual. Want to lighten tomorrow?”
- “You’ve completed 27 appointments this week. Want to set a max per day?”
- “Next 3 days are fully booked. Want to block rest time?”

Not urgent — encouraging.

---

# Common Groomer Stress Scenarios Covered

The Calm Center must resolve:

1️⃣ Running 20–45 mins behind  
2️⃣ Appointment overruns  
3️⃣ Customers wanting to reschedule  
4️⃣ No-shows / cancellations  
5️⃣ Upset customers  
6️⃣ Unrealistic travel windows  
7️⃣ Mid-day income gaps  
8️⃣ Late finishing days  
9️⃣ Too many “high stress” dogs  
🔟 Emotional overwhelm

Each must:
- Appear as a card/event  
- Be solvable in one tap  
- Trigger messaging + scheduling logic  

---

# Messaging Behavior (High Level)
- SMS sent via GroomRoute messaging system  
- Trial/base tier may use shared sender  
- Paid plans may include dedicated business number  
- App shows only:
  - confirmations  
  - conflicts  
  - emotional incidents  

Everything else handled silently.

---

# Scheduling Behavior (High Level)

- GroomRoute schedule = source of truth  
- Google Calendar sync + Apple iCal feed supported  
- Calm actions update GroomRoute schedule  
- GroomRoute pushes updates outward  
- Customers auto-notified  

---

# Post-Action Narration
After any Calm Action:

> “Your day is smoother now 🌿  
> • 3 appointments moved  
> • 3 customers notified  
> • 2 confirmed, 1 needs new time (Tap to resolve)”

Builds relief + clarity.

---

# Success Definition
The Calm Center is successful if:
- Users instinctively open it when stressed  
- Most actions resolve in 1–2 taps  
- Groomers say things like:
  - “I feel calmer”
  - “Problems don’t scare me anymore”
  - “It feels like the app has my back”  
