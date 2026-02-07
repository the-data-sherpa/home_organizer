import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/** GET /api/chores/[id] — Get a single chore with assignments and completions. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const chore = await prisma.chore.findUnique({
      where: { id },
      include: {
        assignments: { include: { user: true } },
        completions: { include: { user: true } },
      },
    });

    if (!chore) {
      return NextResponse.json(
        { error: "Chore not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(chore);
  } catch (error) {
    console.error("Failed to fetch chore:", error);
    return NextResponse.json(
      { error: "Failed to fetch chore" },
      { status: 500 },
    );
  }
}

/** PATCH /api/chores/[id] — Update a chore, including reassigning users. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, points, isClaimable, isRecurring, daysOfWeek, assignedUserIds } =
      body;

    const choreData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(points !== undefined && { points }),
      ...(isClaimable !== undefined && { isClaimable }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(daysOfWeek !== undefined && { daysOfWeek }),
    };

    if (Array.isArray(assignedUserIds)) {
      // Use transaction to atomically replace assignments
      const chore = await prisma.$transaction(async (tx) => {
        await tx.choreAssignment.deleteMany({ where: { choreId: id } });
        if (assignedUserIds.length > 0) {
          await Promise.all(
            assignedUserIds.map((userId: string) =>
              tx.choreAssignment.create({ data: { choreId: id, userId } }),
            ),
          );
        }
        return tx.chore.update({
          where: { id },
          data: choreData,
          include: { assignments: { include: { user: true } } },
        });
      });
      return NextResponse.json(chore);
    }

    const chore = await prisma.chore.update({
      where: { id },
      data: choreData,
      include: { assignments: { include: { user: true } } },
    });

    return NextResponse.json(chore);
  } catch (error) {
    console.error("Failed to update chore:", error);
    return NextResponse.json(
      { error: "Failed to update chore" },
      { status: 500 },
    );
  }
}

/** DELETE /api/chores/[id] — Delete a chore. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.chore.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chore:", error);
    return NextResponse.json(
      { error: "Failed to delete chore" },
      { status: 500 },
    );
  }
}
