import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/recipes - List all recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const favoritesOnly = searchParams.get("favorites") === "true";
    const search = searchParams.get("search");

    const recipes = await prisma.recipe.findMany({
      where: {
        ...(favoritesOnly && { isFavorite: true }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
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
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Recipe name is required" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        description: description || null,
        ingredients: ingredients || [],
        steps: steps || [],
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || null,
        macros: macros || null,
        sourceUrl: sourceUrl || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
