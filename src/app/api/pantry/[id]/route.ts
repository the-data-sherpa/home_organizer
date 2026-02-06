import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/pantry/[id] - Update a pantry item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, quantity, unit, expiresAt } = body;

    const item = await prisma.pantryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(unit !== undefined && { unit }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update pantry item:", error);
    return NextResponse.json(
      { error: "Failed to update pantry item" },
      { status: 500 }
    );
  }
}

// DELETE /api/pantry/[id] - Delete a pantry item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pantryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pantry item:", error);
    return NextResponse.json(
      { error: "Failed to delete pantry item" },
      { status: 500 }
    );
  }
}
