import { db } from "@/db";
import { events, invitations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOrCreateDefaultEvent() {
  const existingEvents = await db.select().from(events).limit(1);

  if (existingEvents.length > 0) {
    return existingEvents[0];
  }

  // Create default event
  const [newEvent] = await db
    .insert(events)
    .values({
      slug: "rencontre-vino-esvi-grace",
      title: "Grande Rencontre Spirituelle & Prière d'Alliance",
      ministryName: "Ministère VINO-ESVI",
      scriptureVerse: "1 Pierre 1:3",
      scriptureText:
        "Béni soit Dieu, le Père de notre Seigneur Jésus-Christ, qui, selon sa grande miséricorde, nous a régénérés, pour une espérance vivante, par la résurrection de Jésus-Christ d'entre les morts.",
      eventDate: "Samedi 26 Juillet 2025",
      eventTime: "15h00 - 18h30",
      location: "Paroisse & Centre Spirituel Saint-Esprit, Salle Jean-Paul II",
      locationDetails: "15 Avenue de l'Espérance - Accès parking gratuit",
      locationUrl: "https://maps.google.com/?q=Centre+Spirituel",
      subjects:
        "• Louange & Action de Grâce fraternelle\n• Enseignement : 'L'Espérance vivante en Christ' (1 Pierre 1:3)\n• Prière d'intercession pour les familles et les guérisons\n• Récitation du Chapelet et communion d'alliance\n• Moment d'agape et de bénédiction mutuelle",
      welcomeMessage:
        "Le Ministère VINO-ESVI vous invite à vivre un rendez-vous divin inoubliable rempli de foi, de paix et de renouveau spirituel.",
    })
    .returning();

  // Create some initial sample invitations for demonstration
  const sampleContacts = [
    {
      name: "Sœur Marie-Claire Kouassi",
      phone: "+2250708091011",
      token: "vino-marie-claire-" + Math.random().toString(36).substring(2, 8),
      status: "pending",
      notes: "Chorale / Responsable louange",
    },
    {
      name: "Frère David Mensah",
      phone: "+33612345678",
      token: "vino-david-" + Math.random().toString(36).substring(2, 8),
      status: "accepted",
      respondedAt: new Date(Date.now() - 3600 * 1000 * 2),
      notes: "Vient avec sa famille",
    },
    {
      name: "Mme Antoinette Traoré",
      phone: "+221771234567",
      token: "vino-antoinette-" + Math.random().toString(36).substring(2, 8),
      status: "declined",
      respondedAt: new Date(Date.now() - 3600 * 1000 * 8),
      notes: "En voyage ce jour-là",
    },
  ];

  for (const c of sampleContacts) {
    await db.insert(invitations).values({
      eventId: newEvent.id,
      name: c.name,
      phone: c.phone,
      token: c.token,
      status: c.status,
      respondedAt: c.respondedAt ?? null,
      notes: c.notes,
    });
  }

  return newEvent;
}
