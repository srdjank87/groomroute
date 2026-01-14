import { resend, addToMarketingList } from "./resend";
import WelcomeEmail from "@/emails/WelcomeEmail";
import TeamInviteEmail from "@/emails/TeamInviteEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "GroomRoute <hello@groomroute.com>";

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  planName: string,
  trialDays: number = 14
) {
  try {
    const client = resend();
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to GroomRoute! Let's get you started",
      react: WelcomeEmail({ userName, planName, trialDays }),
    });

    console.log("Welcome email sent:", email);
    return result;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return null;
  }
}

/**
 * Send team invitation email
 */
export async function sendTeamInviteEmail(
  email: string,
  inviterName: string,
  businessName: string,
  role: "ADMIN" | "GROOMER",
  inviteToken: string
) {
  try {
    const client = resend();
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You've been invited to join ${businessName} on GroomRoute`,
      react: TeamInviteEmail({ inviterName, businessName, role, inviteToken }),
    });

    console.log("Team invite email sent:", email);
    return result;
  } catch (error) {
    console.error("Failed to send team invite email:", error);
    return null;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string
) {
  try {
    const client = resend();
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your GroomRoute password",
      react: PasswordResetEmail({ userName, resetToken }),
    });

    console.log("Password reset email sent:", email);
    return result;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return null;
  }
}

/**
 * Add new user to marketing list and send welcome email
 */
export async function onboardNewUser(
  email: string,
  userName: string,
  planName: string,
  trialDays: number = 14
) {
  // Send welcome email
  const emailResult = await sendWelcomeEmail(email, userName, planName, trialDays);

  // Add to marketing list
  const firstName = userName.split(" ")[0];
  const lastName = userName.split(" ").slice(1).join(" ") || undefined;
  const contactResult = await addToMarketingList(email, firstName, lastName);

  return {
    emailSent: !!emailResult,
    addedToMarketingList: !!contactResult,
  };
}
