import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/chores - List all chores
export async function GET() {
  try {
    const chores = await prisma.chore.findMany({
      include: {
        assignedTo: true,
        completions: {
          where: {
            weekOf: getStartOfWeek(),
          },
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(chores);
  } catch (error) {
    console.error("Failed to fetch chores:", error);
    return NextResponse.json(
      { error: "Failed to fetch chores" },
      { status: 500 }
    );
  }
}

// POST /api/chores - Create a new chore
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, points, isClaimable, isRecurring, daysOfWeek, assignedToId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Chore name is required" },
        { status: 400 }
      );
    }

    const chore = await prisma.chore.create({
      data: {
        name,
        description: description || null,
        points: points || 1,
        isClaimable: isClaimable || false,
        isRecurring: isRecurring !== false,
        daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: true,
      },
    });

    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    console.error("Failed to create chore:", error);
    return NextResponse.json(
      { error: "Failed to create chore" },
      { status: 500 }
    );
  }
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}
