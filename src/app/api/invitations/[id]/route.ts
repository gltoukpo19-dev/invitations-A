import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invId = parseInt(id, 10);
    if (isNaN(invId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.delete(invitations).where(eq(invitations.id, invId));
    return NextResponse.json({ message: "Invitation supprimée avec succès" });
  } catch (error) {
    console.error("Error in DELETE /api/invitations/[id]:", error);
    return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invId = parseInt(id, 10);
    if (isNaN(invId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Partial<typeof invitations.$inferInsert> = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "accepted" || body.status === "declined") {
        updateData.respondedAt = new Date();
      } else if (body.status === "pending") {
        updateData.respondedAt = null;
      }
    }

    if (body.whatsappSent === true) {
      updateData.whatsappSentAt = new Date();
    }

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim().replace(/\s+/g, "");
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(invitations)
      .set(updateData)
      .where(eq(invitations.id, invId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/invitations/[id]:", error);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}
