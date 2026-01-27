import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importCalendarEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

interface ImportRequest {
  eventId: string;
  customerId: string;
  petId?: string;
  groomerId?: string;
  appointmentType?: string;
  serviceMinutes?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can import calendar events" },
        { status: 403 }
      );
    }

    const body: ImportRequest = await request.json();

    if (!body.eventId || !body.customerId) {
      return NextResponse.json(
        { error: "eventId and customerId are required" },
        { status: 400 }
      );
    }

    // If no groomerId provided, try to get the default groomer for the account
    let groomerId = body.groomerId;
    if (!groomerId) {
      const defaultGroomer = await prisma.groomer.findFirst({
        where: { accountId: session.user.accountId },
        select: { id: true },
      });

      if (!defaultGroomer) {
        return NextResponse.json(
          { error: "No groomer found. Please create a groomer first." },
          { status: 400 }
        );
      }

      groomerId = defaultGroomer.id;
    }

    const result = await importCalendarEvent(session.user.accountId, {
      eventId: body.eventId,
      customerId: body.customerId,
      petId: body.petId,
      groomerId,
      appointmentType: body.appointmentType,
      serviceMinutes: body.serviceMinutes,
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to import event" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      appointmentId: result.appointmentId,
    });
  } catch (error) {
    console.error("Import calendar event error:", error);

    const message = error instanceof Error ? error.message : "Failed to import event";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Bulk import multiple events
interface BulkImportRequest {
  events: ImportRequest[];
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can import calendar events" },
        { status: 403 }
      );
    }

    const body: BulkImportRequest = await request.json();

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: "events array is required" },
        { status: 400 }
      );
    }

    // Get default groomer for events without one specified
    const defaultGroomer = await prisma.groomer.findFirst({
      where: { accountId: session.user.accountId },
      select: { id: true },
    });

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const event of body.events) {
      if (!event.eventId || !event.customerId) {
        results.failed++;
        results.errors.push(`Event missing required fields: ${event.eventId}`);
        continue;
      }

      const groomerId = event.groomerId || defaultGroomer?.id;
      if (!groomerId) {
        results.failed++;
        results.errors.push(`No groomer available for event: ${event.eventId}`);
        continue;
      }

      const result = await importCalendarEvent(session.user.accountId, {
        ...event,
        groomerId,
      });

      if (result.success) {
        results.imported++;
      } else {
        results.failed++;
        results.errors.push(`${event.eventId}: ${result.error}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Bulk import calendar events error:", error);

    const message = error instanceof Error ? error.message : "Failed to import events";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
