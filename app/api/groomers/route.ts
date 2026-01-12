import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hasFeature, getPlanLimits } from "@/lib/features";

const groomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  baseAddress: z.string().min(1, "Base address is required"),
  workingHoursStart: z.string().optional().nullable(),
  workingHoursEnd: z.string().optional().nullable(),
  contactMethods: z.array(z.string()).optional(),
  preferredMessaging: z.enum(["SMS", "WHATSAPP"]).optional(),
  preferredMaps: z.enum(["GOOGLE", "APPLE"]).optional(),
  defaultHasAssistant: z.boolean().optional(),
  largeDogDailyLimit: z.number().nullable().optional(),
});

// GET - List all groomers for the account
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") !== "false";

    const groomers = await prisma.groomer.findMany({
      where: {
        accountId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ groomers });
  } catch (error) {
    console.error("Get groomers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groomers" },
      { status: 500 }
    );
  }
}

// POST - Create a new groomer (Pro plan only for additional groomers)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Get account to check plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { subscriptionPlan: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check current groomer count
    const currentGroomerCount = await prisma.groomer.count({
      where: { accountId, isActive: true },
    });

    // Check plan limits
    const limits = getPlanLimits(account.subscriptionPlan);

    if (currentGroomerCount >= limits.maxGroomers) {
      // Check if they have multi_groomer feature
      if (!hasFeature(account.subscriptionPlan, "multi_groomer")) {
        return NextResponse.json(
          {
            error: "Multi-groomer support requires the Pro plan",
            upgradeRequired: true,
            suggestedPlan: "PRO"
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const validatedData = groomerSchema.parse(body);

    // Geocode the base address
    let baseLat: number | null = null;
    let baseLng: number | null = null;
    let geocodeStatus: "OK" | "PARTIAL" | "FAILED" | "PENDING" = "PENDING";

    if (validatedData.baseAddress) {
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            validatedData.baseAddress
          )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            baseLat = location.lat;
            baseLng = location.lng;
            geocodeStatus = "OK";
          } else {
            geocodeStatus = "FAILED";
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        geocodeStatus = "FAILED";
      }
    }

    const groomer = await prisma.groomer.create({
      data: {
        accountId,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        baseAddress: validatedData.baseAddress,
        baseLat,
        baseLng,
        geocodeStatus,
        workingHoursStart: validatedData.workingHoursStart || "08:00",
        workingHoursEnd: validatedData.workingHoursEnd || "17:00",
        contactMethods: validatedData.contactMethods || ["call", "sms"],
        preferredMessaging: validatedData.preferredMessaging || "SMS",
        preferredMaps: validatedData.preferredMaps || "GOOGLE",
        defaultHasAssistant: validatedData.defaultHasAssistant || false,
        largeDogDailyLimit: validatedData.largeDogDailyLimit ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      groomer,
      message: "Groomer added successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create groomer error:", error);
    return NextResponse.json(
      { error: "Failed to add groomer" },
      { status: 500 }
    );
  }
}
