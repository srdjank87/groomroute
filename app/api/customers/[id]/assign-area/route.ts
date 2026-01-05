import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assignAreaSchema = z.object({
  areaId: z.string().cuid().nullable(),
});

// POST - Assign a customer to a service area (or remove assignment)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: customerId } = await params;
    const body = await request.json();
    const { areaId } = assignAreaSchema.parse(body);

    // Verify customer belongs to account
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        accountId: session.user.accountId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If areaId provided, verify it belongs to account
    if (areaId) {
      const area = await prisma.serviceArea.findFirst({
        where: {
          id: areaId,
          accountId: session.user.accountId,
        },
      });

      if (!area) {
        return NextResponse.json(
          { error: "Service area not found" },
          { status: 404 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { serviceAreaId: areaId },
      include: {
        serviceArea: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: areaId ? "Customer assigned to area" : "Customer area removed",
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        serviceArea: updatedCustomer.serviceArea,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error assigning customer area:", error);
    return NextResponse.json(
      { error: "Failed to assign customer area" },
      { status: 500 }
    );
  }
}
