import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, score, comment } = await request.json();

    if (!email || !score || score < 1 || score > 10) {
      return NextResponse.json(
        { error: "Valid email and score (1-10) are required" },
        { status: 400 }
      );
    }

    // Find the user and their account by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { accountId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const feedback = await prisma.npsFeedback.create({
      data: {
        accountId: user.accountId,
        email,
        score: Math.round(score),
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error("[Feedback API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
