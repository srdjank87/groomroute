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
  // Custom properties (Loops has built-in createdAt, so no need for signupDate)
  accountId?: string;
  businessName?: string;
  plan?: string;
  planPrice?: string; // e.g., "$29" - for trial ending reminder
  cancelDate?: string;
  phone?: string; // For SMS marketing
  trialEndDate?: string; // ISO date string for trial ending reminder
  cardLast4?: string; // Last 4 digits of card for trial ending reminder

  // Boolean properties for Audience Filter exit conditions
  // These are updated when actions occur, allowing loops to filter out contacts
  hasCompletedCheckout?: boolean; // Exit: Abandoned checkout sequence
  hasAddedClient?: boolean; // Exit: No clients added sequence
  hasCreatedAppointment?: boolean; // Exit: No appointments sequence
  hasOptimizedRoute?: boolean; // Exit: Route optimization nudge sequence
  hasInstalledPwa?: boolean; // Exit: PWA reminder sequence
  isActive?: boolean; // Exit: Re-engagement sequence (reset by cron)
  hasPaymentFailed?: boolean; // Trigger/Exit: Payment failed sequence
  hasResubscribed?: boolean; // Exit: Winback sequence
  lastActiveAt?: string; // ISO date string for activity tracking
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

  // Create contact with initial properties
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
    hasCompletedCheckout: false, // For abandoned checkout sequence filtering
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
 * Exits: Abandoned Checkout sequence (via hasCompletedCheckout property)
 * Triggers: Onboarding sequences + Trial Ending Reminder
 */
export async function loopsOnCheckoutCompleted(
  email: string,
  plan: string,
  accountId: string,
  options?: {
    phone?: string;
    planPrice?: string; // e.g., "$29"
    trialEndDate?: Date; // When trial ends
    cardLast4?: string; // Last 4 digits of card
  }
): Promise<void> {
  // Update contact with checkout status (exits abandoned checkout sequence)
  // Also initialize onboarding properties to false
  await upsertLoopsContact({
    email,
    userGroup: "trial",
    plan,
    hasCompletedCheckout: true, // Exits abandoned checkout sequence
    hasAddedClient: false, // Initialize for onboarding sequences
    hasCreatedAppointment: false,
    hasOptimizedRoute: false,
    hasInstalledPwa: false,
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    // Trial reminder properties
    ...(options?.phone && { phone: options.phone }),
    ...(options?.planPrice && { planPrice: options.planPrice }),
    ...(options?.trialEndDate && {
      trialEndDate: options.trialEndDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    }),
    ...(options?.cardLast4 && { cardLast4: options.cardLast4 }),
  });

  // Send event to trigger onboarding sequences
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
 * Updates contact status to paying
 */
export async function loopsOnTrialConverted(
  email: string,
  plan: string,
  accountId: string
): Promise<void> {
  await upsertLoopsContact({
    email,
    userGroup: "paying",
    hasPaymentFailed: false, // Ensure clean payment state
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
    hasResubscribed: false, // Reset for winback sequence filtering
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
 * Exits: Winback sequence (via hasResubscribed property)
 */
export async function loopsOnResubscribed(
  email: string,
  plan: string,
  accountId: string,
  phone?: string
): Promise<void> {
  await upsertLoopsContact({
    email,
    userGroup: "paying",
    hasResubscribed: true, // Exits winback sequence
    cancelDate: undefined, // Clear cancel date
    ...(phone && { phone }),
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

// ============================================
// Onboarding Events - Trigger email sequences
// ============================================

/**
 * Called when user adds their first client
 * Exits: "No clients added" sequence (via hasAddedClient property)
 * Triggers: "No appointments scheduled" sequence
 */
export async function loopsOnFirstCustomerAdded(
  email: string,
  accountId: string
): Promise<void> {
  // Update contact property to exit "no clients" sequence
  await upsertLoopsContact({
    email,
    hasAddedClient: true, // Exits "no clients added" sequence
  });

  // Send event to trigger "no appointments" sequence
  await sendLoopsEvent({
    email,
    eventName: "customer_added",
    eventProperties: {
      accountId,
    },
  });
}

/**
 * Called when user creates their first appointment
 * Exits: "No appointments scheduled" sequence (via hasCreatedAppointment property)
 * Triggers: "Route optimization nudge" sequence
 */
export async function loopsOnFirstAppointmentCreated(
  email: string,
  accountId: string
): Promise<void> {
  // Update contact property to exit "no appointments" sequence
  await upsertLoopsContact({
    email,
    hasCreatedAppointment: true, // Exits "no appointments" sequence
  });

  // Send event to trigger "route optimization" sequence
  await sendLoopsEvent({
    email,
    eventName: "appointment_created",
    eventProperties: {
      accountId,
    },
  });
}

/**
 * Called when user optimizes their first route
 * Exits: "Route optimization nudge" sequence (via hasOptimizedRoute property)
 */
export async function loopsOnFirstRouteOptimized(
  email: string,
  accountId: string,
  stops: number
): Promise<void> {
  // Update contact property to exit "route optimization nudge" sequence
  await upsertLoopsContact({
    email,
    hasOptimizedRoute: true, // Exits "route optimization" sequence
  });

  await sendLoopsEvent({
    email,
    eventName: "route_optimized",
    eventProperties: {
      accountId,
      stops,
    },
  });
}

/**
 * Called when user installs the PWA
 * Exits: "PWA installation reminder" sequence (via hasInstalledPwa property)
 */
export async function loopsOnPWAInstalled(
  email: string,
  accountId: string
): Promise<void> {
  // Update contact property to exit "PWA reminder" sequence
  await upsertLoopsContact({
    email,
    hasInstalledPwa: true, // Exits "PWA reminder" sequence
  });

  await sendLoopsEvent({
    email,
    eventName: "pwa_installed",
    eventProperties: {
      accountId,
    },
  });
}

/**
 * Called when user logs in
 * Exits: "Re-engagement" sequence (via isActive property)
 * Note: A cron job should reset isActive to false for users inactive 7+ days
 */
export async function loopsOnUserActive(
  email: string,
  accountId: string
): Promise<void> {
  // Update contact to mark as active (exits re-engagement sequence)
  await upsertLoopsContact({
    email,
    isActive: true, // Exits "re-engagement" sequence
    lastActiveAt: new Date().toISOString(),
  });

  await sendLoopsEvent({
    email,
    eventName: "user_active",
    eventProperties: {
      accountId,
    },
  });
}

/**
 * Called when invoice payment fails
 * Triggers: "Payment Failed" recovery sequence
 */
export async function loopsOnPaymentFailed(
  email: string,
  accountId: string,
  amount: number
): Promise<void> {
  // Set payment failed flag (used for audience filtering)
  await upsertLoopsContact({
    email,
    hasPaymentFailed: true, // Triggers "payment failed" sequence
  });

  await sendLoopsEvent({
    email,
    eventName: "payment_failed",
    eventProperties: {
      accountId,
      amount,
    },
  });
}

/**
 * Called when payment succeeds (after a failed payment)
 * Exits: "Payment Failed" recovery sequence (via hasPaymentFailed property)
 */
export async function loopsOnPaymentSucceeded(
  email: string,
  accountId: string
): Promise<void> {
  // Clear payment failed flag (exits "payment failed" sequence)
  await upsertLoopsContact({
    email,
    hasPaymentFailed: false, // Exits "payment failed" sequence
  });

  await sendLoopsEvent({
    email,
    eventName: "payment_succeeded",
    eventProperties: {
      accountId,
    },
  });
}
