import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOrCreateDefaultEvent } from "@/lib/seed";
import crypto from "crypto";

export async function GET() {
  try {
    const event = await getOrCreateDefaultEvent();
    const list = await db
      .select()
      .from(invitations)
      .where(eq(invitations.eventId, event.id))
      .orderBy(desc(invitations.createdAt));

    const total = list.length;
    const accepted = list.filter((i) => i.status === "accepted").length;
    const declined = list.filter((i) => i.status === "declined").length;
    const pending = list.filter((i) => i.status === "pending").length;

    return NextResponse.json({
      event,
      invitations: list,
      stats: {
        total,
        accepted,
        declined,
        pending,
        responseRate: total > 0 ? Math.round(((accepted + declined) / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await getOrCreateDefaultEvent();

    // Check if bulk or single
    if (Array.isArray(body.contacts)) {
      // Bulk insert
      const contactsToInsert = body.contacts
        .filter((c: { name?: string; phone?: string }) => c.name && c.phone)
        .map((c: { name: string; phone: string; notes?: string }) => ({
          eventId: event.id,
          token: crypto.randomBytes(6).toString("hex"),
          name: c.name.trim(),
          phone: c.phone.trim().replace(/\s+/g, ""),
          status: "pending",
          notes: c.notes?.trim() || null,
        }));

      if (contactsToInsert.length === 0) {
        return NextResponse.json({ error: "No valid contacts provided" }, { status: 400 });
      }

      const inserted = await db.insert(invitations).values(contactsToInsert).returning();
      return NextResponse.json({ message: "Contacts ajoutés avec succès", inserted }, { status: 201 });
    } else {
      // Single insert
      const { name, phone, notes } = body;
      if (!name || !phone) {
        return NextResponse.json({ error: "Nom et numéro de téléphone requis" }, { status: 400 });
      }

      const [newInvitation] = await db
        .insert(invitations)
        .values({
          eventId: event.id,
          token: crypto.randomBytes(6).toString("hex"),
          name: name.trim(),
          phone: phone.trim().replace(/\s+/g, ""),
          status: "pending",
          notes: notes?.trim() || null,
        })
        .returning();

      return NextResponse.json(newInvitation, { status: 201 });
    }
  } catch (error) {
    console.error("Error in POST /api/invitations:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}
