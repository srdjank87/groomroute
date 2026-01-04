# GroomRoute — Offline Safety Snapshot (Implementation Guide)

## 🎯 Goal

Give GroomRoute users a **reliable, calm, read-only offline experience** when mobile signal drops — so they can keep working without panic.

This feature allows users to:
- View today’s full schedule
- See stops, addresses, client names, dog info & notes
- Copy addresses into Maps
- Continue functioning calmly, even if offline

When internet resumes, the app automatically resyncs.

---

## ✅ User Experience (What It Should Feel Like)

### **When Online**
- GroomRoute loads normally
- Automatically saves “Today’s Schedule” locally in the background
- Shows nothing special — just works

---

### **When Signal Drops**
App automatically flips into **Offline Safety Snapshot Mode**

User can still:
- See today’s route
- Open each appointment
- View notes like:
  - “Nervous doodle — needs extra time”
  - “Elderly dog — handle gently”
- View addresses
- View dog names
- View time windows
- Copy address into GPS

Show a small banner across the UI:

> **Offline Safety Snapshot**
> Last updated at: `8:42 AM`

---

### **What Doesn’t Work Offline (V1)**
These should be **disabled with tooltips**:
- Send “Running Late”
- Rescue My Day
- Re-Optimize Route
- Messaging

Tooltip copy example:

> Needs internet — available when you’re back online.

---

### **When Internet Returns**
- Snapshot quietly updates
- Any queued actions (if built in future versions) send automatically
- Show small toast:

> Synced! Your schedule is up to date.

---

## 🧠 Architecture Overview

We implement GroomRoute as a **mobile-first PWA**.

This gives us:
- Offline support
- Installable home screen app
- Cached UI shell
- Local stored “Today Snapshot”

---

## 🛠️ Technical Plan

### 1️⃣ Convert GroomRoute to a PWA
Add:
- Web App Manifest
- Service Worker

Service worker responsibilities:
- Cache app shell (JS, CSS, UI)
- Cache endpoint response for `TodaySchedule`

---

### 2️⃣ Cache Today’s Schedule Locally

When user loads GroomRoute & logs in:

Fetch:
`/api/today-snapshot`

Store data in:
- **IndexedDB** (preferred)
- fallback: LocalStorage

Example stored object:
```json
{
  "date": "2026-01-04",
  "lastUpdatedAt": "2026-01-04T08:42:13Z",
  "stops": [
    {
      "id": "stop_1",
      "time": "09:15",
      "clientName": "Sarah & Milo",
      "address": "123 Oak Street",
      "notes": "Nervous doodle, needs calm approach",
      "dogInfo": {
        "name": "Milo",
        "size": "large"
      }
    }
  ]
}
