import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateDefaultEvent } from "@/lib/seed";

export async function GET() {
  try {
    const event = await getOrCreateDefaultEvent();
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error in GET /api/event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const event = await getOrCreateDefaultEvent();

    const [updatedEvent] = await db
      .update(events)
      .set({
        title: body.title ?? event.title,
        ministryName: body.ministryName ?? event.ministryName,
        scriptureVerse: body.scriptureVerse ?? event.scriptureVerse,
        scriptureText: body.scriptureText ?? event.scriptureText,
        eventDate: body.eventDate ?? event.eventDate,
        eventTime: body.eventTime ?? event.eventTime,
        location: body.location ?? event.location,
        locationDetails: body.locationDetails ?? event.locationDetails,
        locationUrl: body.locationUrl ?? event.locationUrl,
        subjects: body.subjects ?? event.subjects,
        welcomeMessage: body.welcomeMessage ?? event.welcomeMessage,
      })
      .where(eq(events.id, event.id))
      .returning();

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error in PUT /api/event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
