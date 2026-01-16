/**
 * Loops Email Marketing Integration
 *
 * Used for automated email sequences:
 * - Abandoned checkout (signed up but didn't complete Stripe checkout)
 * - Customer winback (churned customers after 60 days)
 *
 * Transactional emails (welcome, confirmations) still use Resend.
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_API_URL = "https://app.loops.so/api/v1";

interface LoopsContact {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  subscribed?: boolean;
  userGroup?: string;
  // Custom properties
  accountId?: string;
  businessName?: string;
  plan?: string;
  signupDate?: string;
  cancelDate?: string;
}

interface LoopsEventPayload {
  email: string;
  eventName: string;
  eventProperties?: Record<string, string | number | boolean>;
}

/**
 * Create or update a contact in Loops
 */
export async function upsertLoopsContact(contact: LoopsContact): Promise<boolean> {
  if (!LOOPS_API_KEY) {
    console.warn("LOOPS_API_KEY not configured, skipping Loops contact upsert");
    return false;
  }

  try {
    const response = await fetch(`${LOOPS_API_URL}/contacts/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Loops contact upsert failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Loops contact upsert error:", error);
    return false;
  }
}

/**
 * Send an event to Loops to trigger automations
 */
export async function sendLoopsEvent(payload: LoopsEventPayload): Promise<boolean> {
  if (!LOOPS_API_KEY) {
    console.warn("LOOPS_API_KEY not configured, skipping Loops event");
    return false;
  }

  try {
    const response = await fetch(`${LOOPS_API_URL}/events/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Loops event send failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Loops event send error:", error);
    return false;
  }
}

/**
 * Delete a contact from Loops (useful when they hard-unsubscribe)
 */
export async function deleteLoopsContact(email: string): Promise<boolean> {
  if (!LOOPS_API_KEY) {
    return false;
  }

  try {
    const response = await fetch(`${LOOPS_API_URL}/contacts/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return response.ok;
  } catch (error) {
    console.error("Loops contact delete error:", error);
    return false;
  }
}

// ============================================
// High-level helper functions for GroomRoute
// ============================================

/**
 * Called when a user signs up (creates account but hasn't completed checkout)
 * Triggers: Abandoned Checkout sequence
 */
export async function loopsOnSignup(
  email: string,
  name: string,
  businessName: string,
  plan: string,
  accountId: string
): Promise<void> {
  const firstName = name.split(" ")[0];
  const lastName = name.split(" ").slice(1).join(" ") || undefined;

  // Create contact
  await upsertLoopsContact({
    email,
    firstName,
    lastName,
    source: "signup",
    subscribed: true,
    userGroup: "signups",
    accountId,
    businessName,
    plan,
    signupDate: new Date().toISOString(),
  });

  // Send signup event (triggers abandoned checkout sequence)
  await sendLoopsEvent({
    email,
    eventName: "signed_up",
    eventProperties: {
      plan,
      businessName,
      accountId,
    },
  });
}

/**
 * Called when user completes Stripe checkout (trial started)
 * Exits: Abandoned Checkout sequence
 */
export async function loopsOnCheckoutCompleted(
  email: string,
  plan: string,
  accountId: string
): Promise<void> {
  // Update contact group
  await upsertLoopsContact({
    email,
    userGroup: "trial",
  });

  // Send event to exit abandoned checkout sequence
  await sendLoopsEvent({
    email,
    eventName: "checkout_completed",
    eventProperties: {
      plan,
      accountId,
    },
  });
}

/**
 * Called when trial converts to paid subscription
 * Updates contact status
 */
export async function loopsOnTrialConverted(
  email: string,
  plan: string,
  accountId: string
): Promise<void> {
  await upsertLoopsContact({
    email,
    userGroup: "paying",
  });

  await sendLoopsEvent({
    email,
    eventName: "trial_converted",
    eventProperties: {
      plan,
      accountId,
    },
  });
}

/**
 * Called when subscription is canceled
 * Triggers: Winback sequence (after 60 day delay configured in Loops)
 */
export async function loopsOnSubscriptionCanceled(
  email: string,
  previousPlan: string,
  accountId: string
): Promise<void> {
  await upsertLoopsContact({
    email,
    userGroup: "churned",
    cancelDate: new Date().toISOString(),
  });

  await sendLoopsEvent({
    email,
    eventName: "subscription_canceled",
    eventProperties: {
      previousPlan,
      accountId,
    },
  });
}

/**
 * Called when a churned customer resubscribes
 * Exits: Winback sequence
 */
export async function loopsOnResubscribed(
  email: string,
  plan: string,
  accountId: string
): Promise<void> {
  await upsertLoopsContact({
    email,
    userGroup: "paying",
  });

  await sendLoopsEvent({
    email,
    eventName: "resubscribed",
    eventProperties: {
      plan,
      accountId,
    },
  });
}
