import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  businessName: z.string().min(1),
  timezone: z.string().default("America/New_York"),
  plan: z.enum(["starter", "growth", "pro"]).default("starter"),
  billing: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Map plan string to enum
    const planMap: Record<string, "STARTER" | "GROWTH" | "PRO"> = {
      starter: "STARTER",
      growth: "GROWTH",
      pro: "PRO",
    };

    const billingMap: Record<string, "MONTHLY" | "YEARLY"> = {
      monthly: "MONTHLY",
      yearly: "YEARLY",
    };

    // Create account and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create account with subscription details
      const account = await tx.account.create({
        data: {
          name: validatedData.businessName,
          timezone: validatedData.timezone,
          subscriptionPlan: planMap[validatedData.plan],
          billingCycle: billingMap[validatedData.billing],
          subscriptionStatus: "TRIAL",
          trialEndsAt: trialEndsAt,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          accountId: account.id,
          role: "ADMIN",
        },
      });

      return { account, user };
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: result.user.id,
        accountId: result.account.id,
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

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
