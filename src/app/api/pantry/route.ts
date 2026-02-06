import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/pantry - List all pantry items
export async function GET() {
  try {
    const items = await prisma.pantryItem.findMany({
      orderBy: [{ expiresAt: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch pantry items:", error);
    return NextResponse.json(
      { error: "Failed to fetch pantry items" },
      { status: 500 }
    );
  }
}

// POST /api/pantry - Add a pantry item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, quantity, unit, expiresAt } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const item = await prisma.pantryItem.create({
      data: {
        name,
        quantity: quantity || null,
        unit: unit || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create pantry item:", error);
    return NextResponse.json(
      { error: "Failed to create pantry item" },
      { status: 500 }
    );
  }
}
