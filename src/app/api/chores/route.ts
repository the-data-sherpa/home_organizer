import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getWeekDates, startOfDay, endOfDay } from "@/lib/helpers";

/** GET /api/chores — List all chores with assignments and completions for the given week. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get("weekOffset") ?? "0", 10) || 0;

    const weekDates = getWeekDates(weekOffset);
    const rangeStart = startOfDay(weekDates[0]);
    const rangeEnd = endOfDay(weekDates[6]);

    const chores = await prisma.chore.findMany({
      include: {
        assignments: { include: { user: true } },
        completions: {
          where: {
            completionDate: { gte: rangeStart, lte: rangeEnd },
          },
          include: { user: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(chores);
  } catch (error) {
    console.error("Failed to fetch chores:", error);
    return NextResponse.json(
      { error: "Failed to fetch chores" },
      { status: 500 },
    );
  }
}

/** POST /api/chores — Create a new chore with optional multi-user assignments. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, points, isClaimable, isRecurring, daysOfWeek, assignedUserIds } =
      body;

    if (!name) {
      return NextResponse.json(
        { error: "Chore name is required" },
        { status: 400 },
      );
    }

    const assignmentData =
      Array.isArray(assignedUserIds) && assignedUserIds.length > 0
        ? { create: assignedUserIds.map((userId: string) => ({ userId })) }
        : undefined;

    const chore = await prisma.chore.create({
      data: {
        name,
        description: description || null,
        points: points || 1,
        isClaimable: isClaimable || false,
        isRecurring: isRecurring !== false,
        daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        ...(assignmentData && { assignments: assignmentData }),
      },
      include: {
        assignments: { include: { user: true } },
      },
    });

    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    console.error("Failed to create chore:", error);
    return NextResponse.json(
      { error: "Failed to create chore" },
      { status: 500 },
    );
  }
}
