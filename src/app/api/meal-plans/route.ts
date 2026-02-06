import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/meal-plans - List meal plans for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        recipe: true,
      },
      orderBy: [{ date: "asc" }, { mealType: "asc" }],
    });

    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error("Failed to fetch meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

// POST /api/meal-plans - Add a meal to the plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, mealType, recipeId } = body;

    if (!date || !mealType || !recipeId) {
      return NextResponse.json(
        { error: "Date, mealType, and recipeId are required" },
        { status: 400 }
      );
    }

    // Upsert - update if exists, create if not
    const mealPlan = await prisma.mealPlan.upsert({
      where: {
        date_mealType: {
          date: new Date(date),
          mealType,
        },
      },
      update: {
        recipeId,
      },
      create: {
        date: new Date(date),
        mealType,
        recipeId,
      },
      include: {
        recipe: true,
      },
    });

    return NextResponse.json(mealPlan, { status: 201 });
  } catch (error) {
    console.error("Failed to create meal plan:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/meal-plans - Remove a meal from the plan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const mealType = searchParams.get("mealType");

    if (!date || !mealType) {
      return NextResponse.json(
        { error: "Date and mealType are required" },
        { status: 400 }
      );
    }

    await prisma.mealPlan.delete({
      where: {
        date_mealType: {
          date: new Date(date),
          mealType,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}
