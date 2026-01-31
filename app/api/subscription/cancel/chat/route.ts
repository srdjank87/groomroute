import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a cancellation interview agent for GroomRoute, a mobile pet grooming route management app. Your job is to understand the REAL reason a groomer is canceling their subscription by asking thoughtful follow-up questions.

About GroomRoute:
- Route optimization: One-tap reorders appointments for minimum driving time
- Area days: Assign neighborhoods to specific days so groomers stay in one area
- Online booking: Clients can book through a personalized booking page
- Workload protection: Tracks physical intensity (a day of 4 doodles ≠ 4 chihuahuas)
- Client communication: One-tap "running late" or "on my way" messages to all remaining clients
- Real-time dashboard: See next appointment, navigation, mark complete, skip with reason
- Google Calendar sync
- Plans: Starter ($29/mo), Growth ($49/mo), Pro ($79/mo)

Your approach:
- Be empathetic but dig deeper. Surface answers like "too expensive" or "didn't work" are never the real reason.
- Ask ONE focused follow-up question per response. Keep it short (1-2 sentences).
- Drill into specifics: Which feature? What happened when they tried it? What were they expecting vs what they got?
- After 2-3 exchanges you should have enough to understand the root cause.
- Never be pushy about retention. You're here to understand, not to sell.

You MUST respond with valid JSON in this exact format:
{
  "reply": "Your follow-up question here",
  "analysis": null
}

When you believe you understand the root cause (usually after 2-3 exchanges), include analysis:
{
  "reply": "Your final empathetic response acknowledging their feedback",
  "analysis": {
    "rootCause": "One sentence summary of the actual root cause",
    "categories": ["category1", "category2"]
  }
}

Valid categories: pricing, missing_feature, setup_difficulty, not_enough_clients, switching_to_competitor, going_out_of_business, technical_issue, poor_support, not_using_enough, other`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, interviewId } = await request.json();

    // Create or update the interview record
    let interview;
    if (interviewId) {
      interview = await prisma.cancellationInterview.update({
        where: { id: interviewId },
        data: { messages },
      });
    } else {
      interview = await prisma.cancellationInterview.create({
        data: {
          accountId: session.user.accountId,
          messages,
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(responseText);

    // If analysis is provided, save it to the interview
    if (parsed.analysis) {
      await prisma.cancellationInterview.update({
        where: { id: interview.id },
        data: {
          rootCause: parsed.analysis.rootCause,
          categories: parsed.analysis.categories,
          messages: [
            ...messages,
            { role: "assistant", content: parsed.reply },
          ],
        },
      });
    }

    return NextResponse.json({
      reply: parsed.reply,
      analysis: parsed.analysis || null,
      interviewId: interview.id,
    });
  } catch (error) {
    console.error("Cancel chat error:", error);
    return NextResponse.json(
      { error: "Failed to process cancellation chat" },
      { status: 500 }
    );
  }
}
