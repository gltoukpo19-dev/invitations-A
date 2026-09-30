import { db } from "@/db";
import { invitations, events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getOrCreateDefaultEvent } from "@/lib/seed";
import DashboardClient from "@/components/DashboardClient";
import Link from "next/link";
import { Database, AlertTriangle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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

    const stats = {
      total,
      accepted,
      declined,
      pending,
      responseRate: total > 0 ? Math.round(((accepted + declined) / total) * 100) : 0,
    };

    return (
      <DashboardClient
        initialEvent={event}
        initialInvitations={list}
        initialStats={stats}
      />
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Ministère VINO-ESVI • Initialisation
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            La connexion à votre base de données PostgreSQL nécessite une première initialisation des tables, ou la variable d'environnement <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">DATABASE_URL</code> doit être vérifiée sur Vercel.
          </p>

          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Détail technique :
            </p>
            <p className="text-xs font-mono text-red-600 break-words bg-white p-2 rounded-lg border border-red-100">
              {errorMsg}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/api/init-db"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
            >
              <Database className="w-4 h-4" />
              Initialiser les tables automatiquement
            </a>

            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </a>
          </div>
        </div>
      </div>
    );
  }
}
