# GroomRoute Messaging System — Product + Technical Specification

## Purpose
GroomRoute messaging supports the Calm Center vision by enabling **reliable, compliant, two-way communication** between groomers and their clients, with:
- One-tap communication flows
- Bulk notifications
- Intelligent reply handling
- Minimal cognitive load for groomers
- Calm, organized problem resolution

Messaging is not a “chat app.” It is a **calm operations + emotional stability engine**.

---

# Goals

### Product Goals
- Groomers can notify clients effortlessly
- “Shifting schedules” or “Fix My Day” can trigger messaging automatically
- Groomers see only what needs attention
- Conversations stay tied to appointments and operations context
- Trial users can use messaging instantly (no onboarding friction)
- Paid users get a premium dedicated business SMS identity

### Technical Goals
- Compliant with A2P / US carrier restrictions
- Highly reliable delivery
- Scalable routing & threading
- Minimal latency
- Secure and auditable

---

# Architecture Overview

### Messaging Channel: SMS Primary
- Primary outbound + inbound = SMS
- Support optional email for redundancy or specific flows
- Future: WhatsApp or region-specific channels (not required MVP)

---

# Two Sending Modes

## MODE 1 — Trial / Base Tier Messaging
Trial and base-tier accounts SHOULD have immediate messaging access without A2P delay.

### Method
Use a **shared, pre-verified sender identity**, approved at platform level.

### Characteristics
- Shared toll-free or shared local pool
- Business name inserted into message content
- Replies still routed to correct business inbox
- Supports:
  - Single send
  - Bulk notifications
  - Calm actions

### UX
Users should **not feel limited**. Calm Center still works fully.

---

## MODE 2 — Paid Tier Dedicated Business Number
Paid plans (or higher tiers) get their **own SMS number**.

### Benefits
- Trusted identity
- Recognition by returning clients
- Conversation continuity
- Higher deliverability
- Professional feel

### Technical Requirements
- 10DLC or Toll-Free verification
- A2P brand + campaign registration
- Dedicated routing

### Provisioning Strategy
Provision **after upgrade**, NOT during trial onboarding.

### UX
After upgrade:

> “We’re setting up your dedicated business SMS line so customers always know it’s you. This usually completes in 24–72 hours. Until then, we’ll keep messaging active through our verified system.”

System continues shared-mode until dedicated number goes live, then auto-switches with no customer disruption.

---

# A2P + Compliance

### Requirements
- Business approval
- Campaign approval
- Opt-in compliance
- STOP / HELP support
- Logging
- Rate control
- Content restrictions adhered

### Platform Compliance Defaults
GroomRoute platform must:
- Provide STOP → automatic opt-out handling
- Provide HELP → required help response
- Maintain deliverability health monitoring
- Store consent logs per customer

---

# Outbound Messaging Behavior

## Supported Use Cases
- Appointment reminders
- Reschedule notices
- Route / time shift notifications
- Confirmations
- Calm Center one-tap actions
- Problem resolution templates
- Customer support messaging
- Waitlist or cancellation slot outreach

---

# Inbound Messaging Behavior

When a customer replies:

### Source
SMS Provider → GroomRoute Webhook

### GroomRoute Webhook Processing
1️⃣ Identify Business
- Based on receiving number (dedicated or shared routing map)

2️⃣ Identify Client
- Based on sender phone mapping
- If new: create client stub profile

3️⃣ Thread Message
- Attach message to:
  - Related appointment
  - Customer profile
  - Calm Center “Customer Situations” group if actionable

4️⃣ Trigger Business Logic
- Auto-handle “OK”, “Yes”, “Thank you”, etc.
- Surface conflicts or issues to Calm Center

---

# Calm Inbox (NOT a messaging app)

### Goal
Surface only emotionally / operationally relevant replies.

### Auto-Classifications

#### Class 1 — Auto-Resolve
Messages like:
- “OK”
- “Sounds good”
- “Thanks”
- 👍

These should:
- Be auto-marked as resolved
- Increment confirmation counters
- NOT appear as “work”

---

#### Class 2 — Needs Attention
Examples:
- “I can’t make that new time”
- “That won’t work”
- “Can we do another day?”
- “I’m not happy with last groom”
- “I’m confused”

These should:
- Appear in Calm Center “Customer Situations”
- Show:
  - who
  - what appointment
  - what the issue is
- Offer **suggested replies**
- Offer **one-tap operational fixes**

---

### Calm Center Display Example
- ✅ 4 clients confirmed new times (hidden as handled)
- ⚠️ 1 client cannot make new time → (Tap to resolve)
- 😕 1 emotional situation → (Tap to reply)

---

# Reply UI Behavior

When groomer taps a situation:

Show:

1️⃣ Appointment Details
- Pet
- Time
- Context

2️⃣ Customer Message
Readable content

3️⃣ Suggested Replies
Examples:
- Gentle reassurance
- Clear + kind boundary
- Policy-based firmness

4️⃣ Optional Custom Reply

5️⃣ One-Tap Send Action

---

# Optional Forwarding Behavior

Groomer may optionally enable:
- SMS forward to personal phone
- Email notifications

Rules:
- Include summary
- Link back to GroomRoute for main action
- Do NOT bypass GroomRoute as source of truth

---

# Bulk Messaging Behavior

Bulk messaging must:
- Queue safely
- Send sequentially
- Respect carrier limits
- Log each delivery status

Bulk categories:
- Shift Day / “Fix My Day”
- Route adjust
- Confirmation reminder batch
- Waitlist fill blast

---

# Data Model (High Level)

### Entities
- Business
- SMS Number (nullable for trial)
- Client
- Appointment
- Message Thread
- Message
- Calm Event

---

# Integration with Scheduling

Messaging must tie directly into scheduling:

- When schedule changes:
  - Messaging auto-triggers
- When messaging response indicates conflict:
  - Scheduling suggests adjustments
- Calm Center displays operational impact

---

# Failure Handling

### SMS Delivery Failures
If failed:
- Retry policy
- Fallback to email (if available)
- Notify groomer in Calm Center summary

### Webhook Failure
- Queue inbound messages
- Retry processing
- Ensure eventual consistency

---

# Security + Logging

- Log all inbound/outbound messages
- Mask sensitive data where appropriate
- Encrypt PII
- Store compliance logs
- Provide audit trail

---

# Performance Requirements

- Responses must appear in Calm Center within seconds
- Bulk messages queued within 2 seconds
- Status updates visible in near real-time

---

# Trial vs Paid Behavior Summary

| Feature | Trial / Base Tier | Paid Tier |
|--------|------------------|----------|
| Messaging Availability | YES | YES |
| Sender Identity | Shared verified | Dedicated business number |
| Calm Center Integration | Full | Full |
| Auto Routing | Yes | Yes |
| Inbox Experience | Same | Same |
| Brand Trust | Medium | High |
| Compliance | Covered by Platform | Fully Business-Aligned |

---

# Success Definition

Messaging is successful if:
- Users never worry whether messages go through
- Users instinctively trust Calm Center to “just handle it”
- Business communication feels calm, not stressful
- Most responses do NOT require user effort
- Only meaningful things demand attention
- Groomers feel:
  - Safer
  - Supported
  - Professionally represented

---
