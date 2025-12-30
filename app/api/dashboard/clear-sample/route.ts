import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Delete all sample data (customers with [SAMPLE_DATA] tag)
    // This will cascade delete appointments, pets, etc.
    await prisma.customer.deleteMany({
      where: {
        accountId,
        notes: {
          contains: "[SAMPLE_DATA]",
        },
      },
    });

    // Delete any routes that no longer have appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.route.deleteMany({
      where: {
        accountId,
        routeDate: today,
        stops: {
          none: {},
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear sample data error:", error);
    return NextResponse.json(
      { error: "Failed to clear sample data" },
      { status: 500 }
    );
  }
}
