import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { canUserCompleteChore } from "@/lib/helpers";

/** POST /api/chores/complete — Mark a chore as complete for a specific date. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { choreId, userId, date } = body;

    if (!choreId || !userId || !date) {
      return NextResponse.json(
        { error: "choreId, userId, and date are required" },
        { status: 400 },
      );
    }

    const chore = await prisma.chore.findUnique({
      where: { id: choreId },
      include: { assignments: true },
    });

    if (!chore) {
      return NextResponse.json(
        { error: "Chore not found" },
        { status: 404 },
      );
    }

    // Enforce assignment — only assigned users or claimable chores
    if (!canUserCompleteChore(chore.assignments, userId, chore.isClaimable)) {
      return NextResponse.json(
        { error: "User is not assigned to this chore" },
        { status: 403 },
      );
    }

    const completionDate = new Date(date + "T00:00:00.000Z");

    // Use transaction to prevent double-counting points
    const completion = await prisma.$transaction(async (tx) => {
      const existing = await tx.choreCompletion.findUnique({
        where: {
          choreId_completedBy_completionDate: {
            choreId,
            completedBy: userId,
            completionDate,
          },
        },
      });

      if (existing) {
        return existing;
      }

      const created = await tx.choreCompletion.create({
        data: {
          choreId,
          completedBy: userId,
          completionDate,
          pointsEarned: chore.points,
        },
        include: { user: true, chore: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: { pointsBalance: { increment: chore.points } },
      });

      return created;
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error("Failed to complete chore:", error);
    return NextResponse.json(
      { error: "Failed to complete chore" },
      { status: 500 },
    );
  }
}

/** DELETE /api/chores/complete — Undo a chore completion for a specific date. */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const choreId = searchParams.get("choreId");
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    if (!choreId || !userId || !date) {
      return NextResponse.json(
        { error: "choreId, userId, and date are required" },
        { status: 400 },
      );
    }

    const completionDate = new Date(date + "T00:00:00.000Z");

    const completion = await prisma.choreCompletion.findUnique({
      where: {
        choreId_completedBy_completionDate: {
          choreId,
          completedBy: userId,
          completionDate,
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { error: "Completion not found" },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.choreCompletion.delete({ where: { id: completion.id } }),
      prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: completion.pointsEarned } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to undo chore completion:", error);
    return NextResponse.json(
      { error: "Failed to undo completion" },
      { status: 500 },
    );
  }
}
