import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getStartOfWeek } from "@/lib/helpers";

// POST /api/chores/complete - Mark a chore as complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { choreId, userId } = body;

    if (!choreId || !userId) {
      return NextResponse.json(
        { error: "choreId and userId are required" },
        { status: 400 }
      );
    }

    // Get the chore to find its points
    const chore = await prisma.chore.findUnique({
      where: { id: choreId },
    });

    if (!chore) {
      return NextResponse.json(
        { error: "Chore not found" },
        { status: 404 }
      );
    }

    const weekOf = getStartOfWeek();

    // Create completion record
    const completion = await prisma.choreCompletion.upsert({
      where: {
        choreId_completedBy_weekOf: {
          choreId,
          completedBy: userId,
          weekOf,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        choreId,
        completedBy: userId,
        weekOf,
        pointsEarned: chore.points,
      },
      include: {
        user: true,
        chore: true,
      },
    });

    // Update user's points balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        pointsBalance: {
          increment: chore.points,
        },
      },
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error("Failed to complete chore:", error);
    return NextResponse.json(
      { error: "Failed to complete chore" },
      { status: 500 }
    );
  }
}

// DELETE /api/chores/complete - Undo a chore completion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const choreId = searchParams.get("choreId");
    const userId = searchParams.get("userId");

    if (!choreId || !userId) {
      return NextResponse.json(
        { error: "choreId and userId are required" },
        { status: 400 }
      );
    }

    const weekOf = getStartOfWeek();

    // Find the completion
    const completion = await prisma.choreCompletion.findUnique({
      where: {
        choreId_completedBy_weekOf: {
          choreId,
          completedBy: userId,
          weekOf,
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { error: "Completion not found" },
        { status: 404 }
      );
    }

    // Delete completion and deduct points
    await prisma.$transaction([
      prisma.choreCompletion.delete({
        where: { id: completion.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          pointsBalance: {
            decrement: completion.pointsEarned,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to undo chore completion:", error);
    return NextResponse.json(
      { error: "Failed to undo completion" },
      { status: 500 }
    );
  }
}
