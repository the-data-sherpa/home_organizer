import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

// POST /api/grocery/generate - Generate grocery list from meal plans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Get all meal plans in the date range
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        recipe: true,
      },
    });

    // Get all pantry items to check what we have
    const pantryItems = await prisma.pantryItem.findMany();
    const pantryNames = new Set(
      pantryItems.map((p) => p.name.toLowerCase().trim())
    );

    // Collect all ingredients
    const ingredientMap = new Map<string, { quantity: number; unit: string }>();

    for (const plan of mealPlans) {
      const ingredients = plan.recipe.ingredients as unknown as Ingredient[];
      if (!Array.isArray(ingredients)) continue;

      for (const ing of ingredients) {
        const name = ing.name.toLowerCase().trim();
        
        // Skip if we have it in pantry
        if (pantryNames.has(name)) continue;

        const existing = ingredientMap.get(name);
        const qty = parseFloat(ing.quantity) || 1;

        if (existing) {
          // Combine quantities (simple addition, same unit assumed)
          existing.quantity += qty;
        } else {
          ingredientMap.set(name, { quantity: qty, unit: ing.unit || "" });
        }
      }
    }

    // Create grocery items
    const createdItems = [];
    for (const [name, { quantity, unit }] of ingredientMap) {
      // Check if already on list
      const existing = await prisma.groceryItem.findFirst({
        where: { name: { equals: name } },
      });

      if (!existing) {
        const item = await prisma.groceryItem.create({
          data: {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            quantity,
            unit,
            section: categorizeIngredient(name),
          },
        });
        createdItems.push(item);
      }
    }

    return NextResponse.json({
      added: createdItems.length,
      items: createdItems,
    });
  } catch (error) {
    console.error("Failed to generate grocery list:", error);
    return NextResponse.json(
      { error: "Failed to generate grocery list" },
      { status: 500 }
    );
  }
}

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();

  // Produce
  if (
    /lettuce|tomato|onion|garlic|pepper|carrot|celery|broccoli|spinach|kale|cucumber|zucchini|squash|potato|mushroom|avocado|lemon|lime|orange|apple|banana|berry|fruit|vegetable/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  // Meat
  if (
    /chicken|beef|pork|turkey|fish|salmon|shrimp|bacon|sausage|meat|steak|ground/i.test(
      lower
    )
  ) {
    return "Meat";
  }

  // Dairy
  if (
    /milk|cheese|yogurt|cream|butter|egg|sour cream/i.test(lower)
  ) {
    return "Dairy";
  }

  // Bakery
  if (/bread|bagel|roll|tortilla|bun|muffin|croissant/i.test(lower)) {
    return "Bakery";
  }

  // Frozen
  if (/frozen|ice cream/i.test(lower)) {
    return "Frozen";
  }

  // Canned
  if (/can |canned|beans|soup|tomato sauce|paste/i.test(lower)) {
    return "Canned";
  }

  // Pantry staples
  if (
    /rice|pasta|flour|sugar|oil|vinegar|sauce|spice|seasoning|salt|pepper|honey|syrup/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  return "Other";
}
