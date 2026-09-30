import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Check if database connected
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        ministry_name TEXT NOT NULL DEFAULT 'Ministère VINO-ESVI',
        scripture_verse TEXT NOT NULL DEFAULT '1 Pierre 1:3',
        scripture_text TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        location TEXT NOT NULL,
        location_details TEXT,
        location_url TEXT,
        subjects TEXT NOT NULL,
        welcome_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        responded_at TIMESTAMP,
        whatsapp_sent_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Check if default event exists, insert if not
    const checkEvent = await db.execute(sql`SELECT count(*) FROM events;`);
    const count = parseInt(checkEvent.rows[0]?.count as string || "0", 10);

    if (count === 0) {
      await db.execute(sql`
        INSERT INTO events (
          slug, title, ministry_name, scripture_verse, scripture_text,
          event_date, event_time, location, location_details, subjects, welcome_message
        ) VALUES (
          'rencontre-vino-esvi-grace',
          'Grande Rencontre Spirituelle & Prière d''Alliance',
          'Ministère VINO-ESVI',
          '1 Pierre 1:3',
          'Béni soit Dieu, le Père de notre Seigneur Jésus-Christ, qui, selon sa grande miséricorde, nous a régénérés, pour une espérance vivante, par la résurrection de Jésus-Christ d''entre les morts.',
          'Samedi 26 Juillet 2025',
          '15h00 - 18h30',
          'Paroisse & Centre Spirituel Saint-Esprit, Salle Jean-Paul II',
          '15 Avenue de l''Espérance - Accès parking gratuit',
          '• Louange & Action de Grâce fraternelle
• Enseignement : ''L''Espérance vivante en Christ'' (1 Pierre 1:3)
• Prière d''intercession pour les familles et les guérisons
• Récitation du Chapelet et communion d''alliance
• Moment d''agape et de bénédiction mutuelle',
          'Le Ministère VINO-ESVI vous invite à vivre un rendez-vous divin inoubliable rempli de foi, de paix et de renouveau spirituel.'
        );
      `);
    }

    return NextResponse.json({
      status: "success",
      message: "Base de données initialisée avec succès ! Les tables events et invitations existent.",
      tablesReady: true,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: "error",
        message: "Erreur de connexion à PostgreSQL. Vérifiez votre variable DATABASE_URL dans Vercel.",
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
