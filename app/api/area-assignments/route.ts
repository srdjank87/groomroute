import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for setting an assignment
const setAssignmentSchema = z.object({
  groomerId: z.string().cuid(),
  dayOfWeek: z.number().int().min(0).max(6), // 0=Sunday, 6=Saturday
  areaId: z.string().cuid().nullable(), // null to remove assignment
});

// GET - Get all day assignments for the account (matrix view)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all groomers for the account
    const groomers = await prisma.groomer.findMany({
      where: {
        accountId: session.user.accountId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    // Get all assignments
    const assignments = await prisma.areaDayAssignment.findMany({
      where: {
        accountId: session.user.accountId,
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Get all areas for reference
    const areas = await prisma.serviceArea.findMany({
      where: {
        accountId: session.user.accountId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: { name: "asc" },
    });

    // Build the matrix: groomer -> day -> area
    const matrix = groomers.map((groomer) => {
      const groomerAssignments = assignments.filter(
        (a) => a.groomerId === groomer.id
      );

      // Build days object (0-6)
      const days: Record<
        number,
        { areaId: string; areaName: string; areaColor: string } | null
      > = {};

      for (let day = 0; day <= 6; day++) {
        const assignment = groomerAssignments.find((a) => a.dayOfWeek === day);
        if (assignment) {
          days[day] = {
            areaId: assignment.area.id,
            areaName: assignment.area.name,
            areaColor: assignment.area.color,
          };
        } else {
          days[day] = null;
        }
      }

      return {
        groomerId: groomer.id,
        groomerName: groomer.name,
        days,
      };
    });

    return NextResponse.json({
      success: true,
      assignments: matrix,
      areas,
    });
  } catch (error) {
    console.error("Error fetching area assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch area assignments" },
      { status: 500 }
    );
  }
}

// POST - Set or remove an assignment for a groomer on a specific day
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groomerId, dayOfWeek, areaId } = setAssignmentSchema.parse(body);

    // Verify groomer belongs to account
    const groomer = await prisma.groomer.findFirst({
      where: {
        id: groomerId,
        accountId: session.user.accountId,
      },
    });

    if (!groomer) {
      return NextResponse.json({ error: "Groomer not found" }, { status: 404 });
    }

    // If areaId is provided, verify it belongs to account
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

    // Find existing assignment for this groomer + day
    const existingAssignment = await prisma.areaDayAssignment.findUnique({
      where: {
        groomerId_dayOfWeek: {
          groomerId,
          dayOfWeek,
        },
      },
    });

    if (areaId === null) {
      // Remove assignment if it exists
      if (existingAssignment) {
        await prisma.areaDayAssignment.delete({
          where: { id: existingAssignment.id },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Assignment removed",
        assignment: null,
      });
    } else {
      // Create or update assignment
      const assignment = await prisma.areaDayAssignment.upsert({
        where: {
          groomerId_dayOfWeek: {
            groomerId,
            dayOfWeek,
          },
        },
        create: {
          accountId: session.user.accountId,
          groomerId,
          dayOfWeek,
          areaId,
        },
        update: {
          areaId,
        },
        include: {
          area: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          groomer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: existingAssignment ? "Assignment updated" : "Assignment created",
        assignment: {
          groomerId: assignment.groomer.id,
          groomerName: assignment.groomer.name,
          dayOfWeek: assignment.dayOfWeek,
          areaId: assignment.area.id,
          areaName: assignment.area.name,
          areaColor: assignment.area.color,
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error setting area assignment:", error);
    return NextResponse.json(
      { error: "Failed to set area assignment" },
      { status: 500 }
    );
  }
}
