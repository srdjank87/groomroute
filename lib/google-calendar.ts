import { google } from "googleapis";
import { prisma } from "./prisma";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

// Create OAuth2 client
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`
  );
}

// Generate authorization URL for OAuth flow
export function getAuthUrl(accountId: string): string {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to get refresh token
    state: accountId, // Pass accountId to callback
  });
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Get authenticated calendar client for an account
async function getCalendarClient(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiresAt: true,
      googleCalendarId: true,
    },
  });

  if (!account?.googleRefreshToken) {
    throw new Error("Google Calendar not connected");
  }

  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: account.googleAccessToken,
    refresh_token: account.googleRefreshToken,
    expiry_date: account.googleTokenExpiresAt?.getTime(),
  });

  // Refresh token if expired
  if (
    account.googleTokenExpiresAt &&
    new Date() >= account.googleTokenExpiresAt
  ) {
    const { credentials } = await oauth2Client.refreshAccessToken();

    await prisma.account.update({
      where: { id: accountId },
      data: {
        googleAccessToken: credentials.access_token,
        googleTokenExpiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      },
    });

    oauth2Client.setCredentials(credentials);
  }

  return {
    calendar: google.calendar({ version: "v3", auth: oauth2Client }),
    calendarId: account.googleCalendarId || "primary",
  };
}

// Format appointment data for Google Calendar event
interface AppointmentData {
  id: string;
  startAt: Date;
  serviceMinutes: number;
  appointmentType: string;
  notes?: string | null;
  customer: {
    name: string;
    phone?: string | null;
    address: string;
  };
  pet?: {
    name: string;
    breed?: string | null;
  } | null;
  groomer: {
    name: string;
  };
}

function formatAppointmentType(type: string): string {
  const typeMap: Record<string, string> = {
    FULL_GROOM: "Full Groom",
    BATH_ONLY: "Bath Only",
    BATH_BRUSH: "Bath & Brush",
    NAIL_TRIM: "Nail Trim",
    FACE_FEET_FANNY: "Face, Feet & Fanny",
    DESHED: "De-shed",
    PUPPY_INTRO: "Puppy Intro",
    HAND_STRIP: "Hand Strip",
    CUSTOM: "Custom Service",
    SQUEEZE_IN: "Squeeze In",
    ADDON: "Add-on Service",
  };
  return typeMap[type] || type;
}

function createCalendarEvent(appointment: AppointmentData, timezone: string) {
  const endTime = new Date(appointment.startAt);
  endTime.setMinutes(endTime.getMinutes() + appointment.serviceMinutes);

  const serviceType = formatAppointmentType(appointment.appointmentType);
  const petInfo = appointment.pet
    ? `${appointment.pet.name}${appointment.pet.breed ? ` (${appointment.pet.breed})` : ""}`
    : "Pet";

  // Build description with all relevant info
  const descriptionParts = [
    `Customer: ${appointment.customer.name}`,
    appointment.customer.phone ? `Phone: ${appointment.customer.phone}` : null,
    `Service: ${serviceType}`,
    `Duration: ${appointment.serviceMinutes} minutes`,
    appointment.pet ? `Pet: ${petInfo}` : null,
    `Groomer: ${appointment.groomer.name}`,
    appointment.notes ? `\nNotes: ${appointment.notes}` : null,
    `\n---\nManaged by GroomRoute`,
  ].filter(Boolean);

  return {
    summary: `${serviceType} - ${petInfo} (${appointment.customer.name})`,
    location: appointment.customer.address,
    description: descriptionParts.join("\n"),
    start: {
      dateTime: appointment.startAt.toISOString(),
      timeZone: timezone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: timezone,
    },
    // Add extended properties to identify GroomRoute events
    extendedProperties: {
      private: {
        groomrouteAppointmentId: appointment.id,
      },
    },
  };
}

// Sync a single appointment to Google Calendar
export async function syncAppointmentToCalendar(
  accountId: string,
  appointment: AppointmentData & { googleCalendarEventId?: string | null }
): Promise<string | null> {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        googleCalendarEnabled: true,
        timezone: true,
      },
    });

    if (!account?.googleCalendarEnabled) {
      return null;
    }

    const { calendar, calendarId } = await getCalendarClient(accountId);
    const eventData = createCalendarEvent(appointment, account.timezone);

    let eventId: string;

    if (appointment.googleCalendarEventId) {
      // Update existing event
      const response = await calendar.events.update({
        calendarId,
        eventId: appointment.googleCalendarEventId,
        requestBody: eventData,
      });
      eventId = response.data.id!;
    } else {
      // Create new event
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      });
      eventId = response.data.id!;
    }

    // Store the event ID on the appointment
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { googleCalendarEventId: eventId },
    });

    return eventId;
  } catch (error) {
    console.error("Failed to sync appointment to Google Calendar:", error);
    return null;
  }
}

// Delete an event from Google Calendar
export async function deleteCalendarEvent(
  accountId: string,
  googleCalendarEventId: string
): Promise<boolean> {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { googleCalendarEnabled: true },
    });

    if (!account?.googleCalendarEnabled) {
      return false;
    }

    const { calendar, calendarId } = await getCalendarClient(accountId);

    await calendar.events.delete({
      calendarId,
      eventId: googleCalendarEventId,
    });

    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return false;
  }
}

// Sync all appointments for a date range
export async function syncAppointmentsToCalendar(
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<{ synced: number; failed: number }> {
  const appointments = await prisma.appointment.findMany({
    where: {
      accountId,
      startAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        notIn: ["CANCELLED", "NO_SHOW"],
      },
    },
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
          address: true,
        },
      },
      pet: {
        select: {
          name: true,
          breed: true,
        },
      },
      groomer: {
        select: {
          name: true,
        },
      },
    },
  });

  let synced = 0;
  let failed = 0;

  for (const appointment of appointments) {
    const result = await syncAppointmentToCalendar(accountId, appointment);
    if (result) {
      synced++;
    } else {
      failed++;
    }
  }

  return { synced, failed };
}

// Disconnect Google Calendar integration
export async function disconnectGoogleCalendar(
  accountId: string
): Promise<void> {
  await prisma.account.update({
    where: { id: accountId },
    data: {
      googleCalendarEnabled: false,
      googleCalendarId: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiresAt: null,
    },
  });

  // Clear all calendar event IDs from appointments
  await prisma.appointment.updateMany({
    where: { accountId },
    data: { googleCalendarEventId: null },
  });
}
