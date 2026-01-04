# Feature Gating Implementation Examples

This document provides practical examples of how to implement feature gating throughout the GroomRoute application using the feature gating system defined in `lib/features.ts` and `lib/feature-helpers.ts`.

## Table of Contents
- [API Route Examples](#api-route-examples)
- [Server Component Examples](#server-component-examples)
- [Client Component Examples](#client-component-examples)
- [Middleware Examples](#middleware-examples)

---

## API Route Examples

### Example 1: Customer Creation API (Implemented)

Location: `app/api/customers/route.ts`

```typescript
import { canAddCustomer } from "@/lib/feature-helpers";

export async function POST(req: NextRequest) {
  const session = await auth();
  const accountId = session.user.accountId;

  // Get account with subscription plan
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { subscriptionPlan: true },
  });

  // Check current customer count
  const currentCustomerCount = await prisma.customer.count({
    where: { accountId },
  });

  // Check if user can add more customers
  const canAdd = await canAddCustomer(account, currentCustomerCount);

  if (!canAdd.allowed) {
    return NextResponse.json(
      {
        error: canAdd.message,
        upgradeRequired: true,
        suggestedPlan: "GROWTH"
      },
      { status: 403 }
    );
  }

  // Proceed with customer creation...
}
```

### Example 2: SMS Sending API (Future Implementation)

Location: `app/api/messages/send/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canSendSMS, getAccountMessagingCapabilities } from "@/lib/feature-helpers";

const sendSMSSchema = z.object({
  to: z.string().min(10, "Phone number is required"),
  message: z.string().min(1, "Message is required").max(1600),
  customerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const body = await req.json();
    const validatedData = sendSMSSchema.parse(body);

    // Get account with subscription plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Get messaging capabilities for this account
    const capabilities = getAccountMessagingCapabilities(account);

    // Check if SMS is enabled at all
    if (!capabilities.canSendSMS) {
      return NextResponse.json(
        {
          error: "SMS messaging is not available on your plan.",
          upgradeRequired: true,
          suggestedPlan: "STARTER"
        },
        { status: 403 }
      );
    }

    // Check current month SMS count
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentMonthSMS = await prisma.smsMessage.count({
      where: {
        accountId,
        sentAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Check if user can send more SMS
    const canSend = await canSendSMS(account, currentMonthSMS);

    if (!canSend.allowed) {
      return NextResponse.json(
        {
          error: canSend.message,
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
          currentUsage: currentMonthSMS,
          limit: capabilities.monthlyLimit
        },
        { status: 403 }
      );
    }

    // Determine which sender number to use
    const senderConfig = capabilities.hasDedicatedNumber
      ? {
          type: "dedicated",
          number: account.dedicatedPhoneNumber, // Would be stored on Account model
        }
      : {
          type: "shared",
          platformNumber: process.env.PLATFORM_SHARED_NUMBER,
          businessName: account.businessName,
        };

    // Send SMS using your SMS provider (Twilio, etc.)
    const result = await sendSMSMessage({
      to: validatedData.to,
      message: validatedData.message,
      from: senderConfig,
    });

    // Log the message
    await prisma.smsMessage.create({
      data: {
        accountId,
        customerId: validatedData.customerId || null,
        to: validatedData.to,
        message: validatedData.message,
        status: result.status,
        externalId: result.messageId,
        senderType: senderConfig.type,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      usageRemaining: capabilities.monthlyLimit - currentMonthSMS - 1,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Send SMS error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
```

### Example 3: Bulk Notification API (Future Implementation)

Location: `app/api/messages/bulk/route.ts`

```typescript
import { hasFeature } from "@/lib/features";

export async function POST(req: NextRequest) {
  const session = await auth();
  const accountId = session.user.accountId;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { subscriptionPlan: true },
  });

  // Check if bulk notifications feature is available
  if (!hasFeature(account.subscriptionPlan, "bulk_notifications")) {
    return NextResponse.json(
      {
        error: "Bulk notifications are only available on the Growth and Pro plans.",
        upgradeRequired: true,
        suggestedPlan: "GROWTH",
        featureName: "Bulk Notifications"
      },
      { status: 403 }
    );
  }

  // Proceed with bulk send...
}
```

---

## Server Component Examples

### Example 1: Conditional Feature Display in Dashboard

Location: `app/dashboard/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/features";
import { getAccountMessagingCapabilities } from "@/lib/feature-helpers";

export default async function DashboardPage() {
  const session = await auth();
  const accountId = session.user.accountId;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      subscriptionPlan: true,
      businessName: true,
    },
  });

  const capabilities = getAccountMessagingCapabilities(account);
  const hasCalmControl = hasFeature(account.subscriptionPlan, "calm_control_access");
  const hasRunningLate = hasFeature(account.subscriptionPlan, "running_late_automation");

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Conditionally show Calm Control button */}
      {hasCalmControl ? (
        <Link href="/calm" className="btn btn-primary">
          Open Calm Control
        </Link>
      ) : (
        <div className="alert alert-info">
          <p>Calm Control is available on Growth and Pro plans</p>
          <Link href="/pricing" className="btn btn-sm">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Show messaging info based on capabilities */}
      <div className="card">
        <h3>Messaging</h3>
        {capabilities.canSendSMS ? (
          <>
            <p>Type: {capabilities.hasDedicatedNumber ? "Dedicated Number" : "Shared Number"}</p>
            <p>Monthly Limit: {capabilities.monthlyLimit} messages</p>
            {!capabilities.hasDedicatedNumber && (
              <div className="alert alert-info">
                <p>Upgrade to Growth for your own dedicated business number</p>
                <Link href="/pricing">View Plans</Link>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning">
            <p>SMS messaging is not available on your plan</p>
            <Link href="/pricing">View Plans</Link>
          </div>
        )}
      </div>

      {/* Conditionally show Running Late feature */}
      {hasRunningLate && (
        <button className="btn btn-warning">
          Tap: Running Late
        </button>
      )}
    </div>
  );
}
```

### Example 2: Settings Page with Plan-Based Options

Location: `app/settings/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature, getPlanLimits } from "@/lib/features";

export default async function SettingsPage() {
  const session = await auth();
  const account = await prisma.account.findUnique({
    where: { id: session.user.accountId },
  });

  const limits = getPlanLimits(account.subscriptionPlan);
  const hasWorkloadIntelligence = hasFeature(
    account.subscriptionPlan,
    "workload_intelligence"
  );
  const hasMultiGroomer = hasFeature(account.subscriptionPlan, "multi_groomer");

  return (
    <div>
      <h1>Settings</h1>

      {/* Plan Limits Display */}
      <div className="card">
        <h3>Your Plan: {account.subscriptionPlan}</h3>
        <ul>
          <li>Max Customers: {limits.maxCustomers === Infinity ? "Unlimited" : limits.maxCustomers}</li>
          <li>Max Appointments/Month: {limits.maxAppointmentsPerMonth === Infinity ? "Unlimited" : limits.maxAppointmentsPerMonth}</li>
          <li>SMS Messages/Month: {limits.smsMessagesPerMonth}</li>
          <li>Max Groomers: {limits.maxGroomers === Infinity ? "Unlimited" : limits.maxGroomers}</li>
        </ul>
      </div>

      {/* Workload Intelligence Settings - Only if available */}
      {hasWorkloadIntelligence ? (
        <div className="card">
          <h3>Workload Preferences</h3>
          <label>
            Max large dogs per day:
            <input type="number" min="0" max="10" />
          </label>
          <label>
            <input type="checkbox" />
            Warn me about exhausting "danger days"
          </label>
        </div>
      ) : (
        <div className="card bg-base-200">
          <h3>Workload Intelligence 🔒</h3>
          <p>Set limits on large dogs and get danger day warnings</p>
          <Link href="/pricing" className="btn btn-sm btn-primary">
            Upgrade to Growth
          </Link>
        </div>
      )}

      {/* Multi-Groomer Settings - Only if available */}
      {hasMultiGroomer ? (
        <div className="card">
          <h3>Team Management</h3>
          <Link href="/settings/groomers" className="btn">
            Manage Team
          </Link>
        </div>
      ) : (
        <div className="card bg-base-200">
          <h3>Multi-Groomer Support 🔒</h3>
          <p>Add multiple groomers and manage your team</p>
          <Link href="/pricing" className="btn btn-sm btn-primary">
            Upgrade to Pro
          </Link>
        </div>
      )}
    </div>
  );
}
```

---

## Client Component Examples

### Example 1: Feature-Gated Button Component

Location: `components/FeatureButton.tsx`

```typescript
"use client";

import { useRouter } from "next/navigation";

interface FeatureButtonProps {
  featureName: string;
  hasAccess: boolean;
  suggestedPlan?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FeatureButton({
  featureName,
  hasAccess,
  suggestedPlan = "GROWTH",
  onClick,
  children,
  className = "",
}: FeatureButtonProps) {
  const router = useRouter();

  if (!hasAccess) {
    return (
      <div className="tooltip" data-tip={`Upgrade to ${suggestedPlan} to unlock`}>
        <button
          className={`btn btn-disabled ${className}`}
          onClick={() => router.push("/pricing")}
        >
          {children} 🔒
        </button>
      </div>
    );
  }

  return (
    <button className={`btn ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Example 2: Usage Meter Component

Location: `components/UsageMeter.tsx`

```typescript
"use client";

interface UsageMeterProps {
  current: number;
  limit: number;
  label: string;
  showUpgradeAt?: number; // Show upgrade CTA when usage reaches this percentage
}

export function UsageMeter({
  current,
  limit,
  label,
  showUpgradeAt = 80,
}: UsageMeterProps) {
  const percentage = limit === Infinity ? 0 : (current / limit) * 100;
  const isNearLimit = percentage >= showUpgradeAt;
  const isUnlimited = limit === Infinity;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h4 className="card-title text-sm">{label}</h4>

        {isUnlimited ? (
          <div className="flex items-center gap-2">
            <div className="badge badge-success">Unlimited</div>
            <p className="text-sm opacity-70">{current} used this month</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm mb-2">
              <span>{current} used</span>
              <span>{limit} limit</span>
            </div>

            <progress
              className={`progress ${
                isNearLimit ? "progress-warning" : "progress-primary"
              }`}
              value={current}
              max={limit}
            />

            <p className="text-xs opacity-70">
              {limit - current} remaining
            </p>

            {isNearLimit && (
              <div className="alert alert-warning mt-2">
                <p className="text-xs">
                  You're approaching your limit. Consider upgrading for unlimited access.
                </p>
                <a href="/pricing" className="btn btn-xs btn-primary">
                  View Plans
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

Usage in a page:

```typescript
import { UsageMeter } from "@/components/UsageMeter";
import { getPlanLimits } from "@/lib/features";

export default async function UsagePage() {
  const account = await getAccount();
  const limits = getPlanLimits(account.subscriptionPlan);

  const customerCount = await prisma.customer.count({
    where: { accountId: account.id }
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <UsageMeter
        current={customerCount}
        limit={limits.maxCustomers}
        label="Customers"
        showUpgradeAt={80}
      />
    </div>
  );
}
```

---

## Middleware Examples

### Example 1: Route Protection Middleware

Location: `middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/features";

// Routes that require specific features
const FEATURE_PROTECTED_ROUTES: Record<string, string> = {
  "/calm": "calm_control_access",
  "/team": "multi_groomer",
  "/analytics/advanced": "advanced_analytics",
};

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.accountId) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Check if route requires a specific feature
  const requiredFeature = FEATURE_PROTECTED_ROUTES[request.nextUrl.pathname];

  if (requiredFeature) {
    const account = await prisma.account.findUnique({
      where: { id: session.user.accountId },
      select: { subscriptionPlan: true },
    });

    if (!hasFeature(account.subscriptionPlan, requiredFeature as any)) {
      // Redirect to upgrade page with feature context
      const upgradeUrl = new URL("/pricing", request.url);
      upgradeUrl.searchParams.set("feature", requiredFeature);
      upgradeUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(upgradeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/calm/:path*", "/team/:path*", "/analytics/advanced/:path*"],
};
```

---

## Best Practices

### 1. Consistent Error Responses

Always return feature-gated errors in the same format:

```typescript
{
  error: "User-friendly error message",
  upgradeRequired: true,
  suggestedPlan: "GROWTH" | "PRO",
  featureName?: "Feature Name",
  currentUsage?: number,
  limit?: number
}
```

### 2. Frontend Graceful Degradation

Show locked features in the UI with clear upgrade paths:

```typescript
{hasFeature ? (
  <ActualFeature />
) : (
  <LockedFeatureCard
    featureName="Workload Intelligence"
    description="Set limits and get danger day warnings"
    suggestedPlan="GROWTH"
  />
)}
```

### 3. Usage Tracking

Always track usage before hitting API limits:

```typescript
// Get current usage
const currentUsage = await getCurrentUsageCount();
const limits = getPlanLimits(account.subscriptionPlan);

// Show warning before hitting limit
if (currentUsage >= limits.maxCustomers * 0.9) {
  showUpgradeWarning();
}
```

### 4. Type Safety

Always use the `Feature` type for feature checks:

```typescript
import { hasFeature, type Feature } from "@/lib/features";

// Good - type-safe
const feature: Feature = "calm_control_access";
hasFeature(plan, feature);

// Bad - not type-safe
hasFeature(plan, "some_random_feature"); // TypeScript error
```

---

## Testing Feature Gates

### Example Test for Customer Creation Limit

```typescript
import { describe, it, expect } from "vitest";
import { canAddCustomer } from "@/lib/feature-helpers";
import { SubscriptionPlan } from "@prisma/client";

describe("canAddCustomer", () => {
  it("should allow adding customers under Starter limit", async () => {
    const account = { subscriptionPlan: SubscriptionPlan.STARTER };
    const result = await canAddCustomer(account, 45);

    expect(result.allowed).toBe(true);
  });

  it("should block adding customers at Starter limit", async () => {
    const account = { subscriptionPlan: SubscriptionPlan.STARTER };
    const result = await canAddCustomer(account, 50);

    expect(result.allowed).toBe(false);
    expect(result.message).toContain("50 customers");
  });

  it("should allow unlimited customers on Growth plan", async () => {
    const account = { subscriptionPlan: SubscriptionPlan.GROWTH };
    const result = await canAddCustomer(account, 500);

    expect(result.allowed).toBe(true);
  });
});
```

---

## Summary

This feature gating system provides:

1. **Type-safe feature checks** using TypeScript enums
2. **Centralized plan limits** in one location
3. **Consistent error responses** across all APIs
4. **Helper functions** for common checks
5. **Usage tracking** to prevent hitting limits
6. **Graceful UI degradation** for locked features
7. **Clear upgrade paths** when features are unavailable

When implementing new features, always:
1. Define the feature in `lib/features.ts`
2. Add it to the appropriate plan's feature set
3. Create helper functions in `lib/feature-helpers.ts` if needed
4. Protect API routes with feature checks
5. Show locked features in UI with upgrade CTAs
