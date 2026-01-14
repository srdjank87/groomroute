import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get clients assigned to the groomer (from their appointments)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const groomerId = session.user.groomerId;

    // If user doesn't have a linked groomer profile, return empty
    if (!groomerId) {
      return NextResponse.json({
        clients: [],
        message: "No groomer profile linked to this account"
      });
    }

    // Get customers who have appointments with this groomer
    // Include upcoming and recent appointments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        groomerId,
        startAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        customerId: true,
      },
      distinct: ["customerId"],
    });

    const customerIds = appointments.map(a => a.customerId);

    if (customerIds.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    // Get full customer details with pets
    const clients = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        accountId,
      },
      include: {
        pets: {
          orderBy: { name: "asc" },
        },
        appointments: {
          where: {
            groomerId,
            startAt: {
              gte: thirtyDaysAgo,
            },
          },
          orderBy: { startAt: "desc" },
          take: 5,
          include: {
            pet: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Get groomer clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
