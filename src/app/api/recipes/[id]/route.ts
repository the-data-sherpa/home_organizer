import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/recipes/[id] - Get a single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

// PATCH /api/recipes/[id] - Update a recipe
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      ingredients,
      steps,
      prepTime,
      cookTime,
      servings,
      macros,
      sourceUrl,
      imageUrl,
      isFavorite,
    } = body;

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(ingredients !== undefined && { ingredients }),
        ...(steps !== undefined && { steps }),
        ...(prepTime !== undefined && { prepTime }),
        ...(cookTime !== undefined && { cookTime }),
        ...(servings !== undefined && { servings }),
        ...(macros !== undefined && { macros }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isFavorite !== undefined && { isFavorite }),
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
