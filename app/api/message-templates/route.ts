import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "REMINDER_24HR",
    "REMINDER_2HR",
    "ON_MY_WAY",
    "RUNNING_LATE",
    "CONFIRMATION_REQUEST",
    "GAP_FILL_OFFER",
    "CUSTOM",
  ]),
  content: z.string().min(1, "Content is required"),
  isActive: z.boolean().optional(),
});

// GET all message templates
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.messageTemplate.findMany({
      where: { accountId: session.user.accountId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST create new template
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createTemplateSchema.parse(body);

    const template = await prisma.messageTemplate.create({
      data: {
        accountId: session.user.accountId,
        name: validatedData.name,
        type: validatedData.type,
        content: validatedData.content,
        isActive: validatedData.isActive ?? true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create template error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
