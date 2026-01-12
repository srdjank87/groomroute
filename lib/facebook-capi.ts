import crypto from "crypto";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_CONVERSION_API_TOKEN;
const FB_TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE; // For testing

const FB_API_VERSION = "v18.0";
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

// Hash user data for Facebook (SHA256, lowercase)
function hashData(data: string | undefined | null): string | undefined {
  if (!data) return undefined;
  return crypto
    .createHash("sha256")
    .update(data.toLowerCase().trim())
    .digest("hex");
}

// Format phone number (remove non-digits, ensure country code)
function formatPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  // Add US country code if not present (assuming US)
  if (digits.length === 10) {
    return `1${digits}`;
  }
  return digits;
}

interface UserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbClickId?: string | null; // fbc cookie
  fbBrowserId?: string | null; // fbp cookie
}

interface EventData {
  eventName: string;
  eventTime?: number; // Unix timestamp in seconds
  eventId?: string; // For deduplication with pixel
  eventSourceUrl?: string;
  actionSource?: "website" | "email" | "app" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  customData?: Record<string, unknown>;
  userData: UserData;
}

interface FBEventPayload {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: string;
  user_data: Record<string, string | undefined>;
  custom_data?: Record<string, unknown>;
}

// Send event to Facebook Conversion API
export async function sendFBEvent(event: EventData): Promise<boolean> {
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
    console.log("Facebook CAPI not configured - skipping event:", event.eventName);
    return false;
  }

  try {
    const eventPayload: FBEventPayload = {
      event_name: event.eventName,
      event_time: event.eventTime || Math.floor(Date.now() / 1000),
      action_source: event.actionSource || "website",
      user_data: {
        em: hashData(event.userData.email),
        ph: hashData(formatPhone(event.userData.phone)),
        fn: hashData(event.userData.firstName),
        ln: hashData(event.userData.lastName),
        ct: hashData(event.userData.city),
        st: hashData(event.userData.state),
        zp: hashData(event.userData.zipCode),
        country: hashData(event.userData.country || "us"),
        client_ip_address: event.userData.clientIpAddress || undefined,
        client_user_agent: event.userData.clientUserAgent || undefined,
        fbc: event.userData.fbClickId || undefined,
        fbp: event.userData.fbBrowserId || undefined,
      },
    };

    // Add event ID for deduplication
    if (event.eventId) {
      eventPayload.event_id = event.eventId;
    }

    // Add event source URL
    if (event.eventSourceUrl) {
      eventPayload.event_source_url = event.eventSourceUrl;
    }

    // Add custom data
    if (event.customData) {
      eventPayload.custom_data = event.customData;
    }

    // Remove undefined values from user_data
    const cleanedUserData = Object.fromEntries(
      Object.entries(eventPayload.user_data).filter(([, v]) => v !== undefined)
    );
    eventPayload.user_data = cleanedUserData;

    const requestBody: {
      data: FBEventPayload[];
      test_event_code?: string;
    } = {
      data: [eventPayload],
    };

    // Add test event code if configured (for development testing)
    if (FB_TEST_EVENT_CODE) {
      requestBody.test_event_code = FB_TEST_EVENT_CODE;
    }

    const response = await fetch(
      `${FB_API_BASE}/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Facebook CAPI error:", errorData);
      return false;
    }

    const result = await response.json();
    console.log("Facebook CAPI event sent:", event.eventName, result);
    return true;
  } catch (error) {
    console.error("Facebook CAPI error:", error);
    return false;
  }
}

// Pre-built event helpers

/**
 * Track Lead event - user signed up
 */
export async function fbCapiLead(
  userData: UserData,
  eventId?: string,
  sourceUrl?: string
) {
  return sendFBEvent({
    eventName: "Lead",
    userData,
    eventId,
    eventSourceUrl: sourceUrl,
    customData: {
      content_name: "signup",
    },
  });
}

/**
 * Track StartTrial event - trial started
 */
export async function fbCapiStartTrial(
  userData: UserData,
  eventId?: string,
  sourceUrl?: string
) {
  return sendFBEvent({
    eventName: "StartTrial",
    userData,
    eventId,
    eventSourceUrl: sourceUrl,
    customData: {
      content_name: "trial_start",
      value: 0,
      currency: "USD",
    },
  });
}

/**
 * Track Subscribe event - user paid
 */
export async function fbCapiSubscribe(
  userData: UserData,
  value: number,
  planName: string,
  eventId?: string,
  sourceUrl?: string
) {
  return sendFBEvent({
    eventName: "Subscribe",
    userData,
    eventId,
    eventSourceUrl: sourceUrl,
    customData: {
      content_name: planName,
      value,
      currency: "USD",
    },
  });
}

/**
 * Track Purchase event (alternative to Subscribe for some setups)
 */
export async function fbCapiPurchase(
  userData: UserData,
  value: number,
  contentName: string,
  eventId?: string,
  sourceUrl?: string
) {
  return sendFBEvent({
    eventName: "Purchase",
    userData,
    eventId,
    eventSourceUrl: sourceUrl,
    customData: {
      content_name: contentName,
      value,
      currency: "USD",
    },
  });
}

/**
 * Track ViewContent event
 */
export async function fbCapiViewContent(
  userData: UserData,
  contentName: string,
  eventId?: string,
  sourceUrl?: string
) {
  return sendFBEvent({
    eventName: "ViewContent",
    userData,
    eventId,
    eventSourceUrl: sourceUrl,
    customData: {
      content_name: contentName,
    },
  });
}
