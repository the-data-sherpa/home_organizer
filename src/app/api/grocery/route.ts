import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/grocery - List all grocery items
export async function GET() {
  try {
    const items = await prisma.groceryItem.findMany({
      orderBy: [{ checked: "asc" }, { section: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch grocery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch grocery items" },
      { status: 500 }
    );
  }
}

// POST /api/grocery - Add a grocery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, quantity, unit, section, store } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const item = await prisma.groceryItem.create({
      data: {
        name,
        quantity: quantity || null,
        unit: unit || null,
        section: section || "Other",
        store: store || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create grocery item:", error);
    return NextResponse.json(
      { error: "Failed to create grocery item" },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery - Clear checked items or all items
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkedOnly = searchParams.get("checkedOnly") === "true";

    if (checkedOnly) {
      await prisma.groceryItem.deleteMany({
        where: { checked: true },
      });
    } else {
      await prisma.groceryItem.deleteMany({});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear grocery items:", error);
    return NextResponse.json(
      { error: "Failed to clear items" },
      { status: 500 }
    );
  }
}
