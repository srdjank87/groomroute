import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// GET - List all pending calendar access requests
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth")?.value;

    if (adminAuth !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.account.findMany({
      where: {
        googleCalendarAccessRequested: { not: null },
      },
      select: {
        id: true,
        name: true,
        googleCalendarAccessRequested: true,
        googleCalendarApproved: true,
        googleCalendarEnabled: true,
        users: {
          where: { role: "ADMIN" },
          select: { email: true, name: true },
          take: 1,
        },
      },
      orderBy: {
        googleCalendarAccessRequested: "desc",
      },
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        accountId: r.id,
        accountName: r.name,
        userEmail: r.users[0]?.email || "Unknown",
        userName: r.users[0]?.name || "Unknown",
        requestedAt: r.googleCalendarAccessRequested,
        approved: r.googleCalendarApproved,
        connected: r.googleCalendarEnabled,
      })),
    });
  } catch (error) {
    console.error("Get calendar requests error:", error);
    return NextResponse.json(
      { error: "Failed to get requests" },
      { status: 500 }
    );
  }
}

// POST - Approve a calendar access request
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth")?.value;

    if (adminAuth !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        googleCalendarApproved: true,
      },
    });

    // TODO: Send email notification to user that they've been approved

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve calendar request error:", error);
    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 }
    );
  }
}
