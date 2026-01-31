import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const interviews = await prisma.cancellationInterview.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        account: {
          select: { name: true, subscriptionPlan: true },
        },
      },
    });

    // Calculate stats
    const totalInterviews = interviews.length;
    const canceled = interviews.filter((i) => i.canceledAt !== null).length;
    const retained = interviews.filter((i) => i.wasRetained).length;
    const retentionRate = totalInterviews > 0 ? Math.round((retained / totalInterviews) * 100) : 0;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    for (const interview of interviews) {
      if (interview.canceledAt) {
        for (const cat of interview.categories) {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        }
      }
    }

    const topReasons = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return NextResponse.json({
      interviews,
      stats: {
        totalInterviews,
        canceled,
        retained,
        retentionRate,
        topReasons,
      },
    });
  } catch (error) {
    console.error("Churn data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch churn data" },
      { status: 500 }
    );
  }
}
