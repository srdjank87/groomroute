import { Resend } from "resend";

// Lazy initialization of Resend client to avoid build errors
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// Audience ID for marketing emails
const MARKETING_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export { getResend as resend, MARKETING_AUDIENCE_ID };

/**
 * Add a contact to the marketing audience
 */
export async function addToMarketingList(
  email: string,
  firstName?: string,
  lastName?: string
) {
  if (!MARKETING_AUDIENCE_ID) {
    console.warn("RESEND_AUDIENCE_ID not configured, skipping marketing list");
    return null;
  }

  try {
    const resend = getResend();
    const result = await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      unsubscribed: false,
      audienceId: MARKETING_AUDIENCE_ID,
    });

    console.log("Added contact to marketing list:", email);
    return result;
  } catch (error) {
    console.error("Failed to add contact to marketing list:", error);
    return null;
  }
}

/**
 * Remove a contact from the marketing audience
 */
export async function removeFromMarketingList(email: string) {
  if (!MARKETING_AUDIENCE_ID) {
    return null;
  }

  try {
    const resend = getResend();
    // First find the contact by email
    const contacts = await resend.contacts.list({
      audienceId: MARKETING_AUDIENCE_ID,
    });

    const contact = contacts.data?.data?.find((c) => c.email === email);
    if (!contact) {
      return null;
    }

    await resend.contacts.remove({
      audienceId: MARKETING_AUDIENCE_ID,
      id: contact.id,
    });

    console.log("Removed contact from marketing list:", email);
    return true;
  } catch (error) {
    console.error("Failed to remove contact from marketing list:", error);
    return null;
  }
}

/**
 * Update contact unsubscribe status
 */
export async function updateContactSubscription(
  email: string,
  unsubscribed: boolean
) {
  if (!MARKETING_AUDIENCE_ID) {
    return null;
  }

  try {
    const resend = getResend();
    const contacts = await resend.contacts.list({
      audienceId: MARKETING_AUDIENCE_ID,
    });

    const contact = contacts.data?.data?.find((c) => c.email === email);
    if (!contact) {
      return null;
    }

    await resend.contacts.update({
      audienceId: MARKETING_AUDIENCE_ID,
      id: contact.id,
      unsubscribed,
    });

    return true;
  } catch (error) {
    console.error("Failed to update contact subscription:", error);
    return null;
  }
}
