import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  ministryName: text("ministry_name").notNull().default("Ministère VINO-ESVI"),
  scriptureVerse: text("scripture_verse").notNull().default("1 Pierre 1:3"),
  scriptureText: text("scripture_text").notNull().default(
    "Béni soit Dieu, le Père de notre Seigneur Jésus-Christ, qui, selon sa grande miséricorde, nous a régénérés, pour une espérance vivante, par la résurrection de Jésus-Christ d'entre les morts."
  ),
  eventDate: text("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  location: text("location").notNull(),
  locationDetails: text("location_details"),
  locationUrl: text("location_url"),
  subjects: text("subjects").notNull(),
  welcomeMessage: text("welcome_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'declined'
  respondedAt: timestamp("responded_at"),
  whatsappSentAt: timestamp("whatsapp_sent_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
