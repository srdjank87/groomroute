import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/accounts
 * Get all accounts with optional filtering
 */
export async function GET(req: NextRequest) {
  // Check admin authentication
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.subscriptionStatus = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          users: {
            some: {
              email: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const accounts = await prisma.account.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          take: 1,
          select: { email: true, name: true },
        },
        _count: {
          select: {
            customers: true,
            appointments: true,
            groomers: true,
          },
        },
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
