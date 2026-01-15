import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type"); // Filter by event type
    const accountId = searchParams.get("accountId"); // Filter by account

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      type?: string;
      accountId?: string;
    } = {};

    if (type) {
      where.type = type;
    }
    if (accountId) {
      where.accountId = accountId;
    }

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.adminEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminEvent.count({ where }),
    ]);

    // Get event type counts for filter dropdown
    const typeCounts = await prisma.adminEvent.groupBy({
      by: ["type"],
      _count: true,
      orderBy: {
        _count: {
          type: "desc",
        },
      },
    });

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      typeCounts: typeCounts.map((t) => ({
        type: t.type,
        count: t._count,
      })),
    });
  } catch (error) {
    console.error("Get admin events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
