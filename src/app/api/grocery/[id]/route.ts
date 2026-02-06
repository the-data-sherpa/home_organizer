import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/grocery/[id] - Update a grocery item (toggle checked, edit, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, quantity, unit, section, store, checked } = body;

    const item = await prisma.groceryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(unit !== undefined && { unit }),
        ...(section !== undefined && { section }),
        ...(store !== undefined && { store }),
        ...(checked !== undefined && { checked }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update grocery item:", error);
    return NextResponse.json(
      { error: "Failed to update grocery item" },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery/[id] - Delete a grocery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.groceryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete grocery item:", error);
    return NextResponse.json(
      { error: "Failed to delete grocery item" },
      { status: 500 }
    );
  }
}
