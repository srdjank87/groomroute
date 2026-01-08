import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

interface UpsetScenario {
  id: string;
  title: string;
  description: string;
  suggestedResponses: {
    id: string;
    tone: "empathetic" | "professional" | "apologetic";
    label: string;
    message: string;
  }[];
}

/**
 * GET /api/calm/upset-customer
 * Get suggested responses for upset customer situations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get account to check subscription plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true, timezone: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user can access Calm Control
    if (!canAccessCalmControl(account)) {
      return NextResponse.json(
        {
          error: "This feature requires the Growth or Pro plan.",
          upgradeRequired: true,
          suggestedPlan: "GROWTH",
        },
        { status: 403 }
      );
    }

    const timezone = account.timezone || "America/New_York";

    // Get today's date based on account's timezone
    const now = new Date();
    const localNow = toZonedTime(now, timezone);
    const today = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const tomorrow = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate() + 1,
        0,
        0,
        0,
        0
      )
    );

    // Get groomer for contact methods
    const groomer = await prisma.groomer.findFirst({
      where: { accountId },
      select: { contactMethods: true, name: true },
    });

    // Get today's appointments for context
    const appointments = await prisma.appointment.findMany({
      where: {
        accountId,
        startAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        pet: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Common upset customer scenarios with suggested responses
    const scenarios: UpsetScenario[] = [
      {
        id: "unhappy-with-cut",
        title: "Unhappy with the Cut/Style",
        description: "Customer is not satisfied with how their pet looks after grooming",
        suggestedResponses: [
          {
            id: "cut-empathetic",
            tone: "empathetic",
            label: "Empathetic",
            message: "I'm so sorry [PET]'s cut isn't what you were hoping for. I completely understand how important this is to you. I'd love to make it right - can I schedule a free touch-up this week? Your satisfaction is my top priority.",
          },
          {
            id: "cut-professional",
            tone: "professional",
            label: "Professional",
            message: "Thank you for letting me know your concerns about [PET]'s grooming. I take all feedback seriously and want to ensure you're happy. I'm offering a complimentary touch-up appointment. When would work best for you?",
          },
          {
            id: "cut-apologetic",
            tone: "apologetic",
            label: "Apologetic",
            message: "I'm truly sorry the grooming didn't meet your expectations. This is not the experience I want for you and [PET]. Please let me make it up to you with a free redo. I'll make sure to get it exactly right this time.",
          },
        ],
      },
      {
        id: "late-arrival",
        title: "Upset About Late Arrival",
        description: "Customer is frustrated because you arrived later than scheduled",
        suggestedResponses: [
          {
            id: "late-empathetic",
            tone: "empathetic",
            label: "Empathetic",
            message: "I completely understand your frustration, and I'm truly sorry for the delay. Your time is valuable, and I should have communicated better. To make it up to you, I'd like to offer 10% off today's service.",
          },
          {
            id: "late-professional",
            tone: "professional",
            label: "Professional",
            message: "I sincerely apologize for arriving late today. I had an unexpected situation with a previous appointment, but I should have given you more notice. I value your time and will work to ensure this doesn't happen again.",
          },
          {
            id: "late-apologetic",
            tone: "apologetic",
            label: "Apologetic",
            message: "I'm so sorry for keeping you waiting. I know how frustrating that is, and you deserved better communication from me. I truly appreciate your patience and will make sure to manage my schedule better.",
          },
        ],
      },
      {
        id: "pricing-concern",
        title: "Concerned About Pricing",
        description: "Customer is surprised or upset about the price",
        suggestedResponses: [
          {
            id: "price-empathetic",
            tone: "empathetic",
            label: "Empathetic",
            message: "I hear you, and I understand pricing can be a concern. [PET] did require some extra work today due to [REASON], which affected the final price. I'm happy to walk you through exactly what was involved and discuss options for next time.",
          },
          {
            id: "price-professional",
            tone: "professional",
            label: "Professional",
            message: "I appreciate you bringing this up. The price today reflects [REASON]. I always try to be transparent about any additional work needed. Let me explain the details, and we can discuss how to plan for future appointments.",
          },
          {
            id: "price-apologetic",
            tone: "apologetic",
            label: "Apologetic",
            message: "I'm sorry if the pricing caught you off guard. I should have communicated better about the additional work [PET] needed today. Going forward, I'll make sure to let you know before starting if there will be any extra costs.",
          },
        ],
      },
      {
        id: "pet-stressed",
        title: "Pet Seems Stressed After Service",
        description: "Customer says their pet seems anxious or upset after grooming",
        suggestedResponses: [
          {
            id: "stress-empathetic",
            tone: "empathetic",
            label: "Empathetic",
            message: "I'm so sorry to hear [PET] seems stressed. Some pets do feel a bit out of sorts after grooming, especially with new experiences. [PET] was such a trooper! Usually they bounce back within a few hours. Please let me know how [PET] is doing tomorrow.",
          },
          {
            id: "stress-professional",
            tone: "professional",
            label: "Professional",
            message: "Thank you for letting me know. It's not uncommon for pets to need some decompression time after grooming. [PET] handled everything well during the session. If [PET] is still showing signs of stress tomorrow, please reach out and we can discuss adjustments for next time.",
          },
          {
            id: "stress-apologetic",
            tone: "apologetic",
            label: "Apologetic",
            message: "I'm really sorry [PET] is feeling stressed. Your pet's wellbeing is my top priority. For our next appointment, let's discuss ways to make the experience more comfortable - maybe shorter sessions or extra breaks. I want [PET] to feel safe with me.",
          },
        ],
      },
      {
        id: "missed-appointment",
        title: "Upset About Missed/Cancelled Appointment",
        description: "Customer is frustrated that their appointment was missed or cancelled",
        suggestedResponses: [
          {
            id: "missed-empathetic",
            tone: "empathetic",
            label: "Empathetic",
            message: "I'm so sorry about the missed appointment. I know you were counting on getting [PET] groomed today, and I've let you down. I want to make this right - can I fit you in first thing tomorrow or offer you a discount on your next visit?",
          },
          {
            id: "missed-professional",
            tone: "professional",
            label: "Professional",
            message: "I sincerely apologize for the scheduling issue. This is not the service I strive to provide. I'd like to prioritize rescheduling [PET]'s appointment at your earliest convenience and offer 15% off as an apology for the inconvenience.",
          },
          {
            id: "missed-apologetic",
            tone: "apologetic",
            label: "Apologetic",
            message: "I'm truly sorry for missing our appointment. There's no excuse, and you deserve better. Please accept my sincere apology. I'd love the chance to make it up to you with a priority booking and a discount on your next service.",
          },
        ],
      },
    ];

    // Format appointments for customer selection
    const customers = appointments.map((apt) => ({
      id: apt.customer.id,
      appointmentId: apt.id,
      name: apt.customer.name,
      phone: apt.customer.phone,
      petName: apt.pet?.name,
      time: format(apt.startAt, "h:mm a"),
    }));

    return NextResponse.json({
      scenarios,
      customers,
      groomerName: groomer?.name || "Your Groomer",
      contactMethods: groomer?.contactMethods || ["sms", "call"],
      tips: [
        "Take a deep breath before responding",
        "Acknowledge their feelings first",
        "Focus on solutions, not excuses",
        "Offer something concrete to make it right",
        "Follow up to ensure they're satisfied",
      ],
    });
  } catch (error) {
    console.error("Upset Customer GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch upset customer responses" },
      { status: 500 }
    );
  }
}
