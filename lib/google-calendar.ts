import { google } from "googleapis";
import { prisma } from "./prisma";
import { AppointmentType } from "@prisma/client";

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

// ============================================
// IMPORT FROM GOOGLE CALENDAR
// ============================================

export interface GoogleCalendarEvent {
  id: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  start: Date;
  end: Date;
  // Parsed fields for easier matching
  parsedClientName: string | null;
  parsedAddress: string | null;
  durationMinutes: number;
  alreadyImported: boolean;
}

// Fetch events from Google Calendar for import
export async function fetchCalendarEvents(
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<GoogleCalendarEvent[]> {
  const { calendar, calendarId } = await getCalendarClient(accountId);

  // Get existing imported event IDs to mark as already imported
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      accountId,
      googleCalendarEventId: { not: null },
    },
    select: { googleCalendarEventId: true },
  });
  const importedEventIds = new Set(
    existingAppointments.map((a) => a.googleCalendarEventId)
  );

  const response = await calendar.events.list({
    calendarId,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const events = response.data.items || [];

  return events
    .filter((event) => {
      // Only include events with a start time (not all-day events without time)
      return event.start?.dateTime;
    })
    .map((event) => {
      const start = new Date(event.start!.dateTime!);
      const end = new Date(event.end?.dateTime || event.start!.dateTime!);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

      // Try to parse client name from summary
      // Common formats: "Client Name", "Service - Client Name", "Client Name - Service"
      let parsedClientName: string | null = null;
      if (event.summary) {
        // Try to extract name from common patterns
        const summary = event.summary;
        // Pattern: "Something - Name (info)" or "Name - Something"
        const dashMatch = summary.match(/^(.+?)\s*-\s*(.+)$/);
        if (dashMatch) {
          // Take the longer part as likely the client name
          parsedClientName = dashMatch[1].length > dashMatch[2].length
            ? dashMatch[1].trim()
            : dashMatch[2].trim();
          // Remove parenthetical info
          parsedClientName = parsedClientName.replace(/\s*\([^)]*\)\s*$/, "").trim();
        } else {
          parsedClientName = summary.trim();
        }
      }

      return {
        id: event.id!,
        summary: event.summary || null,
        description: event.description || null,
        location: event.location || null,
        start,
        end,
        parsedClientName,
        parsedAddress: event.location || null,
        durationMinutes,
        alreadyImported: event.id ? importedEventIds.has(event.id) : false,
      };
    });
}

// Import a single event as an appointment
export interface ImportEventOptions {
  eventId: string;
  customerId: string;
  petId?: string;
  groomerId: string;
  appointmentType?: string;
  serviceMinutes?: number;
  notes?: string;
}

export async function importCalendarEvent(
  accountId: string,
  options: ImportEventOptions
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  try {
    const { calendar, calendarId } = await getCalendarClient(accountId);

    // Fetch the specific event
    const eventResponse = await calendar.events.get({
      calendarId,
      eventId: options.eventId,
    });
    const event = eventResponse.data;

    if (!event.start?.dateTime) {
      return { success: false, error: "Event has no start time" };
    }

    const startAt = new Date(event.start.dateTime);
    const endAt = event.end?.dateTime ? new Date(event.end.dateTime) : startAt;
    const defaultDuration = Math.round((endAt.getTime() - startAt.getTime()) / 60000);

    // Check if already imported
    const existing = await prisma.appointment.findFirst({
      where: {
        accountId,
        googleCalendarEventId: options.eventId,
      },
    });

    if (existing) {
      return { success: false, error: "Event already imported" };
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        accountId,
        customerId: options.customerId,
        petId: options.petId || null,
        groomerId: options.groomerId,
        startAt,
        appointmentType: (options.appointmentType as AppointmentType) || "FULL_GROOM",
        serviceMinutes: options.serviceMinutes || defaultDuration || 60,
        status: "BOOKED",
        notes: options.notes || event.description || null,
        googleCalendarEventId: options.eventId,
      },
    });

    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    console.error("Failed to import calendar event:", error);
    return { success: false, error: "Failed to import event" };
  }
}
