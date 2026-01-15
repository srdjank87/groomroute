import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export type AdminEventType =
  | "signup"
  | "subscription_started"
  | "subscription_canceled"
  | "subscription_renewed"
  | "payment_succeeded"
  | "payment_failed"
  | "trial_expired"
  | "plan_upgraded"
  | "plan_downgraded"
  | "team_member_invited"
  | "team_member_joined"
  | "seat_added"
  | "seat_removed"
  | "account_deleted"
  | "password_reset_requested"
  | "password_reset_completed";

interface LogEventParams {
  type: AdminEventType;
  accountId?: string;
  accountName?: string;
  userId?: string;
  userEmail?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an admin event for audit purposes
 */
export async function logAdminEvent({
  type,
  accountId,
  accountName,
  userId,
  userEmail,
  description,
  metadata,
}: LogEventParams): Promise<void> {
  try {
    await prisma.adminEvent.create({
      data: {
        type,
        accountId,
        accountName,
        userId,
        userEmail,
        description,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the main operation
    console.error("Failed to log admin event:", error);
  }
}

/**
 * Get a formatted description for common events
 */
export function getEventDescription(
  type: AdminEventType,
  params: {
    accountName?: string;
    userEmail?: string;
    planName?: string;
    amount?: number;
    role?: string;
  }
): string {
  const { accountName, userEmail, planName, amount, role } = params;

  switch (type) {
    case "signup":
      return `New account "${accountName}" created by ${userEmail}`;
    case "subscription_started":
      return `${accountName} started ${planName} subscription`;
    case "subscription_canceled":
      return `${accountName} canceled their subscription`;
    case "subscription_renewed":
      return `${accountName} subscription renewed for $${amount}`;
    case "payment_succeeded":
      return `Payment of $${amount} received from ${accountName}`;
    case "payment_failed":
      return `Payment failed for ${accountName}`;
    case "trial_expired":
      return `Trial expired for ${accountName}`;
    case "plan_upgraded":
      return `${accountName} upgraded to ${planName}`;
    case "plan_downgraded":
      return `${accountName} downgraded to ${planName}`;
    case "team_member_invited":
      return `${userEmail} invited to ${accountName} as ${role}`;
    case "team_member_joined":
      return `${userEmail} joined ${accountName} as ${role}`;
    case "seat_added":
      return `${accountName} added a ${role} seat`;
    case "seat_removed":
      return `${accountName} removed a ${role} seat`;
    case "account_deleted":
      return `Account "${accountName}" was deleted`;
    case "password_reset_requested":
      return `Password reset requested for ${userEmail}`;
    case "password_reset_completed":
      return `Password reset completed for ${userEmail}`;
    default:
      return `Event: ${type}`;
  }
}
