"use client";

import { useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  XCircle,
  Share2,
  CalendarPlus,
  Church,
  Heart,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { generateGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

export interface InvitationCardProps {
  invitation: {
    id: number;
    name: string;
    phone: string;
    token: string;
    status: string;
  };
  event: {
    id: number;
    title: string;
    ministryName: string;
    scriptureVerse: string;
    scriptureText: string;
    eventDate: string;
    eventTime: string;
    location: string;
    locationDetails?: string | null;
    locationUrl?: string | null;
    subjects: string;
    welcomeMessage?: string | null;
  };
  isPreview?: boolean;
}

export default function InvitationCard({
  invitation,
  event,
  isPreview = false,
}: InvitationCardProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(invitation.status || "pending");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResponse = async (action: "accepted" | "declined") => {
    if (isPreview) {
      setCurrentStatus(action);
      if (action === "accepted") {
        triggerCelebration();
      }
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/invitations/token/${invitation.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error("Impossible d'enregistrer votre réponse");
      }

      setCurrentStatus(action);
      if (action === "accepted") {
        triggerCelebration();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#16a34a", "#eab308", "#38bdf8", "#f43f5e"],
      });
    } catch {
      // ignore
    }
  };

  // Format subjects as array
  const subjectsList = event.subjects
    ? event.subjects
        .split("\n")
        .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  const googleCalUrl = generateGoogleCalendarUrl({
    title: `${event.ministryName} - ${event.title}`,
    description: `Invitation personnelle pour ${invitation.name}\n${event.welcomeMessage || ""}\n\nThèmes :\n${event.subjects}`,
    location: event.location,
  });

  return (
    <div className="relative mx-auto w-full max-w-xl transition-all duration-300">
      {/* Background glow ambiance */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/30 via-red-500/20 to-sky-400/30 blur-xl opacity-70 pointer-events-none" />

      <div className="relative overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-b from-[#fffcf8] via-[#fcf8f0] to-[#f7f0e3] shadow-2xl">
        {/* Sacred Top Banner Accent */}
        <div className="h-3 w-full bg-gradient-to-r from-amber-600 via-red-600 to-amber-600" />

        {/* Card Header & Ministry Logo */}
        <div className="relative px-6 pt-6 pb-4 text-center sm:px-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            Invitation Officielle
          </div>

          {/* Ministry Logo with Rosary & Crucifix */}
          <div className="mt-4 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400 to-red-400 blur opacity-40 group-hover:opacity-60 transition" />
              <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-full border-4 border-amber-400 shadow-xl bg-white p-1">
                <Image
                  src="/vino-esvi-logo.png"
                  alt="VINO-ESVI Logo"
                  width={144}
                  height={144}
                  priority
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Ministry Title */}
          <h2 className="mt-3 text-xl sm:text-2xl font-black uppercase tracking-wide text-amber-950 font-serif">
            {event.ministryName}
          </h2>

          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wider text-red-700">
            <Church className="h-3.5 w-3.5" />
            <span>« 1 PIERRE 1:3 »</span>
          </div>

          {/* Personalized Recipient Welcome */}
          <div className="mt-5 rounded-2xl border border-amber-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-800/80">
              VINO-ESVI • Invitation pour toi
            </p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
              {invitation.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Tu es cordialement invité(e) à participer à cette grande assemblée de grâce et d'alliance.
            </p>
          </div>
        </div>

        {/* Scripture Verse Box */}
        <div className="mx-6 sm:mx-10 my-2 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/70 p-4 border-l-4 border-amber-600 shadow-inner">
          <div className="flex items-start gap-2.5">
            <BookOpen className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Parole de Dieu — {event.scriptureVerse}
              </p>
              <p className="mt-1 text-xs sm:text-sm italic text-amber-950 leading-relaxed font-serif">
                « {event.scriptureText} »
              </p>
            </div>
          </div>
        </div>

        {/* Event Details: Date, Time, Location */}
        <div className="px-6 sm:px-10 py-4 space-y-3">
          {/* Date & Time */}
          <div className="flex items-start gap-3.5 rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Date de l'invitation
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900">
                {event.eventDate}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Heure : {event.eventTime}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3.5 rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-800">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lieu de rencontre
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900">
                {event.location}
              </p>
              {event.locationDetails && (
                <p className="text-xs text-slate-600 mt-0.5">
                  {event.locationDetails}
                </p>
              )}
              {event.locationUrl && (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ouvrir sur la carte (GPS)
                </a>
              )}
            </div>
          </div>

          {/* Sujets du jour de l'invitation */}
          <div className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-amber-100">
              <Church className="h-4 w-4 text-amber-700" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-950">
                Sujets du jour de l'invitation
              </h3>
            </div>
            <div className="space-y-2">
              {subjectsList.length > 0 ? (
                subjectsList.map((subject, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1 leading-snug">{subject}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-slate-600">{event.subjects}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mx-6 sm:mx-10 my-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* CONDITIONAL RESPONSE SECTIONS */}

        {/* 1. STATE: ACCEPTED ("Je viendrai") */}
        {currentStatus === "accepted" && (
          <div className="mx-6 sm:mx-10 my-4 overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 p-5 shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Présence Confirmée
                </span>
                <h4 className="text-lg font-extrabold text-emerald-950">
                  Alléluia ! Merci pour ta confirmation !
                </h4>
              </div>
            </div>

            {/* Parole de Dieu */}
            <div className="mt-4 rounded-xl bg-emerald-100/70 p-3.5 border-l-4 border-emerald-600">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Parole de Dieu pour toi :
              </p>
              <p className="mt-1 text-xs sm:text-sm italic font-serif text-emerald-950 leading-relaxed">
                « Béni soit Dieu, le Père de notre Seigneur Jésus-Christ, qui, selon sa grande miséricorde, nous a régénérés, pour une espérance vivante ! » — 1 Pierre 1:3
              </p>
              <p className="mt-1.5 text-xs text-emerald-800 font-medium">
                « Je suis dans la joie quand on me dit : Allons à la maison de l'Éternel ! » — Psaume 122:1
              </p>
            </div>

            {/* Mots de remerciements et d'encouragements */}
            <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p>
                <span className="font-semibold text-slate-900">Cher(e) {invitation.name}</span>, le Ministère VINO-ESVI te remercie de tout cœur pour ta fidélité, ton amour pour l'œuvre divine et ton engagement. Ta présence sera une source précieuse d'édification et de bénédiction pour toute l'assemblée !
              </p>
            </div>

            {/* Inscriptions obligatoires selon consigne */}
            <div className="mt-4 space-y-2.5 rounded-xl border border-emerald-300 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-2.5">
                <CalendarPlus className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-bold text-emerald-950">
                  📌 Note cette date et cette heure dans ton agenda
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <Heart className="h-5 w-5 text-red-500 shrink-0 mt-0.5 fill-red-500/20" />
                <p className="text-xs sm:text-sm font-bold text-emerald-950">
                  🙏 Mets-toi en prière pour le jour de cette rencontre
                </p>
              </div>

              {/* Action: Add to Calendar */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Ajouter à Google Agenda
                </a>
                <button
                  onClick={() =>
                    downloadIcsFile({
                      title: `${event.ministryName} - ${event.title}`,
                      description: `Rencontre VINO-ESVI pour ${invitation.name}\n${event.subjects}`,
                      location: event.location,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
                >
                  <CalendarPlus className="h-3.5 w-3.5 text-emerald-600" />
                  Télécharger (.ics / Apple / Outlook)
                </button>
              </div>
            </div>

            {/* Option to change mind */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleResponse("declined")}
                disabled={loading}
                className="text-xs text-slate-500 hover:text-red-600 hover:underline transition"
              >
                Je ne pourrai finalement pas venir (Modifier mon choix)
              </button>
            </div>
          </div>
        )}

        {/* 2. STATE: DECLINED ("Je ne viendrai pas") */}
        {currentStatus === "declined" && (
          <div className="mx-6 sm:mx-10 my-4 overflow-hidden rounded-2xl border-2 border-red-400 bg-gradient-to-b from-red-50 via-white to-red-50/50 p-5 shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                <XCircle className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-red-800">
                  Absence notifiée
                </span>
                {/* Specific required phrase */}
                <h4 className="text-base sm:text-lg font-black text-red-950">
                  Dommage car les moments sont uniques {invitation.name} !
                </h4>
              </div>
            </div>

            <div className="mt-3.5 rounded-xl bg-red-50/80 p-3.5 border-l-4 border-red-500 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Ton absence sera remarquée, mais nous demeurons en communion de prière fraternelle avec toi. Que la grâce, la paix et la bonté du Seigneur Jésus-Christ continuent de reposer sur toi et sur toute ta famille.
              </p>
            </div>

            {/* Option to change to coming */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Un changement dans votre emploi du temps ?
              </p>
              <button
                type="button"
                onClick={() => handleResponse("accepted")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                J'ai changé d'avis, je viendrai !
              </button>
            </div>
          </div>
        )}

        {/* 3. DEFAULT STATE: ACTION BUTTONS (Vert & Rouge) */}
        {currentStatus === "pending" && (
          <div className="px-6 sm:px-10 py-5">
            <div className="text-center mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-900">
                Confirmez votre présence
              </p>
              <p className="text-xs text-slate-500">
                Cliquez sur l'une des options ci-dessous pour répondre
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Bouton Je viendrai (VERT) */}
              <button
                type="button"
                onClick={() => handleResponse("accepted")}
                disabled={loading}
                className="group relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-500 hover:to-green-500 hover:shadow-xl hover:shadow-emerald-700/35 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover:scale-110 transition">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm sm:text-base font-extrabold uppercase tracking-wide">
                    Je viendrai
                  </span>
                  <span className="block text-[11px] text-emerald-100 font-medium">
                    Confirmer ma présence
                  </span>
                </div>
              </button>

              {/* Bouton Je ne viendrai pas (ROUGE) */}
              <button
                type="button"
                onClick={() => handleResponse("declined")}
                disabled={loading}
                className="group relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white shadow-lg shadow-red-700/25 hover:from-red-500 hover:to-rose-600 hover:shadow-xl hover:shadow-red-700/35 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover:scale-110 transition">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm sm:text-base font-extrabold uppercase tracking-wide">
                    Je ne viendrai pas
                  </span>
                  <span className="block text-[11px] text-rose-100 font-medium">
                    Décliner avec regret
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Footer info & Ministry Signature */}
        <div className="border-t border-amber-200/60 bg-amber-50/60 px-6 sm:px-10 py-4 text-center">
          <p className="text-xs font-semibold text-amber-950 font-serif">
            {event.ministryName} — Communion, Prière & Espérance
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            « 1 Pierre 1:3 » • Que Dieu vous bénisse abondamment
          </p>
        </div>
      </div>
    </div>
  );
}
