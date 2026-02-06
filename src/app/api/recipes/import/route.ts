import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface SchemaRecipe {
  "@type"?: string;
  name?: string;
  description?: string;
  image?: string | string[] | { url: string }[];
  prepTime?: string;
  cookTime?: string;
  recipeYield?: string | number;
  recipeIngredient?: string[];
  recipeInstructions?: string[] | { "@type": string; text: string }[];
  nutrition?: {
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
  };
}

function parseDuration(iso8601: string | undefined): number | null {
  if (!iso8601) return null;
  // Parse ISO 8601 duration (e.g., PT30M, PT1H30M)
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  return hours * 60 + minutes;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function extractImageUrl(image: SchemaRecipe["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && "url" in first) return first.url;
  }
  return null;
}

function parseInstructions(instructions: SchemaRecipe["recipeInstructions"]): string[] {
  if (!instructions) return [];
  if (Array.isArray(instructions)) {
    return instructions.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && "text" in item) return item.text;
      return "";
    }).filter(Boolean);
  }
  return [];
}

// POST /api/recipes/import - Import recipe from URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HomeOrganizer/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract JSON-LD schema
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    );

    if (!jsonLdMatch) {
      return NextResponse.json(
        { error: "No recipe data found on this page" },
        { status: 400 }
      );
    }

    let recipeData: SchemaRecipe | null = null;

    for (const match of jsonLdMatch) {
      const jsonContent = match.replace(
        /<script[^>]*>|<\/script>/gi,
        ""
      );
      try {
        const parsed = JSON.parse(jsonContent);
        
        // Handle @graph format
        if (parsed["@graph"]) {
          const recipe = parsed["@graph"].find(
            (item: SchemaRecipe) => item["@type"] === "Recipe"
          );
          if (recipe) {
            recipeData = recipe;
            break;
          }
        }
        
        // Direct Recipe type
        if (parsed["@type"] === "Recipe") {
          recipeData = parsed;
          break;
        }
        
        // Array format
        if (Array.isArray(parsed)) {
          const recipe = parsed.find(
            (item: SchemaRecipe) => item["@type"] === "Recipe"
          );
          if (recipe) {
            recipeData = recipe;
            break;
          }
        }
      } catch {
        continue;
      }
    }

    if (!recipeData) {
      return NextResponse.json(
        { error: "No recipe data found on this page" },
        { status: 400 }
      );
    }

    // Parse recipe data
    const ingredients = (recipeData.recipeIngredient || []).map((ing) => ({
      name: ing,
      quantity: "",
      unit: "",
    }));

    const steps = parseInstructions(recipeData.recipeInstructions);

    const macros = recipeData.nutrition
      ? {
          calories: parseNumber(recipeData.nutrition.calories),
          protein: parseNumber(recipeData.nutrition.proteinContent),
          carbs: parseNumber(recipeData.nutrition.carbohydrateContent),
          fat: parseNumber(recipeData.nutrition.fatContent),
        }
      : undefined;

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        name: recipeData.name || "Imported Recipe",
        description: recipeData.description || null,
        ingredients,
        steps,
        prepTime: parseDuration(recipeData.prepTime),
        cookTime: parseDuration(recipeData.cookTime),
        servings: typeof recipeData.recipeYield === "number"
          ? recipeData.recipeYield
          : parseInt(String(recipeData.recipeYield)) || null,
        macros,
        sourceUrl: url,
        imageUrl: extractImageUrl(recipeData.image),
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Failed to import recipe:", error);
    return NextResponse.json(
      { error: "Failed to import recipe" },
      { status: 500 }
    );
  }
}
