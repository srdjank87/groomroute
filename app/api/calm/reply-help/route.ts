import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCalmControl } from "@/lib/feature-helpers";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

interface MessageTemplate {
  id: string;
  category: string;
  title: string;
  preview: string;
  message: string;
}

/**
 * GET /api/calm/reply-help
 * Get message templates for common customer situations
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
        status: {
          notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"],
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

    // Message templates organized by category
    const templates: MessageTemplate[] = [
      // Confirmation & Scheduling
      {
        id: "confirm-appointment",
        category: "Scheduling",
        title: "Confirm Appointment",
        preview: "Hi! Just confirming your appointment...",
        message: "Hi [CUSTOMER]! Just confirming [PET]'s grooming appointment for [TIME] today. Please reply YES to confirm, or let me know if you need to reschedule. Thanks!",
      },
      {
        id: "reschedule-offer",
        category: "Scheduling",
        title: "Offer to Reschedule",
        preview: "I need to reschedule our appointment...",
        message: "Hi [CUSTOMER]! I'm so sorry, but I need to reschedule [PET]'s appointment today. Would tomorrow or later this week work better for you? I'll prioritize your booking!",
      },
      {
        id: "running-late",
        category: "Scheduling",
        title: "Running Late",
        preview: "Running a bit behind schedule...",
        message: "Hi [CUSTOMER]! I'm running about 15 minutes behind today. I should be there around [NEW_TIME]. So sorry for the delay, and thank you for your patience!",
      },
      {
        id: "on-my-way",
        category: "Scheduling",
        title: "On My Way",
        preview: "On my way to you now...",
        message: "Hi [CUSTOMER]! I'm on my way to you now. See you in about 10-15 minutes! 🚗",
      },

      // Service Related
      {
        id: "service-complete",
        category: "Service",
        title: "Service Complete",
        preview: "All done! Your pup looks great...",
        message: "Hi [CUSTOMER]! [PET] is all done and looking fabulous! 🐕✨ Thank you for trusting me with your fur baby. See you next time!",
      },
      {
        id: "follow-up-care",
        category: "Service",
        title: "Follow-up Care Tips",
        preview: "Quick care tips for your pet...",
        message: "Hi [CUSTOMER]! Just wanted to share a quick tip: [PET]'s coat looked a bit dry today, so a weekly brushing with a conditioning spray would really help. Let me know if you'd like product recommendations!",
      },
      {
        id: "matting-notice",
        category: "Service",
        title: "Matting Notice",
        preview: "Noticed some matting...",
        message: "Hi [CUSTOMER]! I noticed [PET] had some matting today. I was able to work through most of it, but regular brushing between appointments will help prevent it. Would you like me to show you some techniques next time?",
      },

      // Pricing & Payment
      {
        id: "price-increase",
        category: "Pricing",
        title: "Price Adjustment Notice",
        preview: "Wanted to give you a heads up...",
        message: "Hi [CUSTOMER]! I wanted to give you advance notice that my grooming prices will be adjusting slightly starting next month. [PET]'s new rate will be $[AMOUNT]. Thank you for your continued support!",
      },
      {
        id: "payment-reminder",
        category: "Pricing",
        title: "Payment Reminder",
        preview: "Friendly reminder about payment...",
        message: "Hi [CUSTOMER]! Just a friendly reminder that the payment for [PET]'s last grooming session is still pending. Please let me know if you have any questions!",
      },

      // Appreciation
      {
        id: "thank-you",
        category: "Appreciation",
        title: "Thank You",
        preview: "Thank you so much...",
        message: "Hi [CUSTOMER]! Just wanted to say thank you for being such a wonderful client! [PET] is always a joy to groom. I really appreciate your business! 💖",
      },
      {
        id: "referral-thanks",
        category: "Appreciation",
        title: "Referral Thanks",
        preview: "Thank you for the referral...",
        message: "Hi [CUSTOMER]! I heard you referred a friend to me - thank you so much! Word of mouth means the world to small businesses like mine. You're the best! 🙏",
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
      templates,
      customers,
      groomerName: groomer?.name || "Your Groomer",
      contactMethods: groomer?.contactMethods || ["sms", "call"],
    });
  } catch (error) {
    console.error("Reply Help GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch message templates" },
      { status: 500 }
    );
  }
}
