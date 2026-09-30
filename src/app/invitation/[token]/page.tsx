import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { invitations, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import InvitationCard from "@/components/InvitationCard";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const inv = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  if (!inv.length) {
    return {
      title: "VINO-ESVI - Invitation",
    };
  }

  return {
    title: `VINO-ESVI - Invitation pour toi ${inv[0].name}`,
    description: `Invitation officielle du Ministère VINO-ESVI (1 Pierre 1:3) pour ${inv[0].name}. Confirmez votre présence.`,
    openGraph: {
      title: `VINO-ESVI - Invitation pour toi ${inv[0].name}`,
      description: `Carte d'invitation officielle du Ministère VINO-ESVI (1 Pierre 1:3).`,
      images: ["/vino-esvi-logo.png"],
    },
  };
}

export default async function InvitationPage({ params }: Props) {
  const { token } = await params;

  const invList = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  if (invList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-amber-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Invitation introuvable</h1>
          <p className="text-sm text-slate-600 mb-6">
            Ce lien d'invitation n'est plus valide ou a été supprimé. Veuillez contacter le Ministère VINO-ESVI.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const invitation = invList[0];

  let event = null;
  if (invitation.eventId) {
    const eventList = await db
      .select()
      .from(events)
      .where(eq(events.id, invitation.eventId))
      .limit(1);
    if (eventList.length > 0) {
      event = eventList[0];
    }
  }

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/80 via-orange-50/60 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top subtle bar */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between mb-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>VINO-ESVI • 1 Pierre 1:3</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-700 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Lien sécurisé</span>
        </div>
      </header>

      {/* Main Card */}
      <div className="my-auto">
        <InvitationCard invitation={invitation} event={event} />
      </div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Ministère VINO-ESVI • Tous droits réservés</p>
        <p className="mt-1 text-[11px] text-slate-400">
          « Béni soit Dieu, le Père de notre Seigneur Jésus-Christ »
        </p>
      </footer>
    </main>
  );
}
