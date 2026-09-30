import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitations, events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invResults = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    if (invResults.length === 0) {
      return NextResponse.json({ error: "Invitation non trouvée" }, { status: 404 });
    }

    const invitation = invResults[0];

    // Get event
    let event = null;
    if (invitation.eventId) {
      const eventResults = await db
        .select()
        .from(events)
        .where(eq(events.id, invitation.eventId))
        .limit(1);
      if (eventResults.length > 0) {
        event = eventResults[0];
      }
    }

    return NextResponse.json({ invitation, event });
  } catch (error) {
    console.error("Error in GET /api/invitations/token/[token]:", error);
    return NextResponse.json({ error: "Failed to fetch invitation" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action } = body; // 'accepted' | 'declined'

    if (action !== "accepted" && action !== "declined") {
      return NextResponse.json(
        { error: "Action invalide. Doit être 'accepted' ou 'declined'" },
        { status: 400 }
      );
    }

    const invResults = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    if (invResults.length === 0) {
      return NextResponse.json({ error: "Invitation non trouvée" }, { status: 404 });
    }

    const [updated] = await db
      .update(invitations)
      .set({
        status: action,
        respondedAt: new Date(),
      })
      .where(eq(invitations.token, token))
      .returning();

    return NextResponse.json({
      message:
        action === "accepted"
          ? "Présence confirmée avec joie !"
          : "Absence enregistrée",
      invitation: updated,
    });
  } catch (error) {
    console.error("Error in POST /api/invitations/token/[token]:", error);
    return NextResponse.json({ error: "Failed to update response" }, { status: 500 });
  }
}
