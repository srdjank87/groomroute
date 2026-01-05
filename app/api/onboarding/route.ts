import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  groomer: z.object({
    name: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
  }),
  address: z.object({
    baseAddress: z.string().min(1),
  }),
  hours: z.object({
    workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/),
    workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  contactMethods: z.array(z.string()).optional().default(["call", "sms"]),
  largeDogDailyLimit: z.number().min(1).max(10).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    // Create groomer profile
    const groomer = await prisma.groomer.create({
      data: {
        accountId: session.user.accountId,
        name: validatedData.groomer.name,
        email: validatedData.groomer.email || null,
        phone: validatedData.groomer.phone || null,
        baseAddress: validatedData.address.baseAddress,
        workingHoursStart: validatedData.hours.workingHoursStart,
        workingHoursEnd: validatedData.hours.workingHoursEnd,
        contactMethods: validatedData.contactMethods || ["call", "sms"],
        largeDogDailyLimit: validatedData.largeDogDailyLimit ?? null,
        geocodeStatus: "PENDING",
      },
    });

    // TODO: In a real app, we would geocode the address here
    // For now, we'll leave it as PENDING and geocode it later

    return NextResponse.json(
      {
        message: "Onboarding completed successfully",
        groomerId: groomer.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
