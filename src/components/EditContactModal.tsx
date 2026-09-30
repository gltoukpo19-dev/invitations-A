"use client";

import { useState } from "react";
import { X, Edit3, User, Phone, FileText, CheckCircle2, XCircle, Clock, Save } from "lucide-react";
import { Invitation } from "@/db/schema";

interface Props {
  isOpen: boolean;
  invitation: Invitation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditContactModal({
  isOpen,
  invitation,
  onClose,
  onSuccess,
}: Props) {
  if (!isOpen || !invitation) return null;

  return (
    <EditContactModalContent
      invitation={invitation}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function EditContactModalContent({
  invitation,
  onClose,
  onSuccess,
}: {
  invitation: Invitation;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(invitation.name);
  const [phone, setPhone] = useState(invitation.phone);
  const [status, setStatus] = useState<string>(invitation.status);
  const [notes, setNotes] = useState(invitation.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom de la personne est requis.");
      return;
    }

    if (!phone.trim()) {
      setError("Le numéro de téléphone est requis.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim().replace(/\s+/g, ""),
          status,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la modification");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Modifier l'invité</h3>
              <p className="text-xs text-amber-100">Mise à jour des coordonnées et de la réponse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom complet ou Titre *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Numéro WhatsApp *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Change Response Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Statut de la réponse (Changer le choix)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("accepted")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  status === "accepted"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs ring-2 ring-emerald-500"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 mb-1 ${status === "accepted" ? "text-emerald-600" : "text-slate-400"}`} />
                <span>Je viendrai</span>
                <span className="text-[10px] text-emerald-600 font-normal">Accepté</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("declined")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  status === "declined"
                    ? "border-red-500 bg-red-50 text-red-800 shadow-xs ring-2 ring-red-500"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <XCircle className={`w-5 h-5 mb-1 ${status === "declined" ? "text-red-600" : "text-slate-400"}`} />
                <span>Ne viendra pas</span>
                <span className="text-[10px] text-red-600 font-normal">Refusé</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("pending")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  status === "pending"
                    ? "border-amber-500 bg-amber-50 text-amber-800 shadow-xs ring-2 ring-amber-500"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Clock className={`w-5 h-5 mb-1 ${status === "pending" ? "text-amber-600" : "text-slate-400"}`} />
                <span>En attente</span>
                <span className="text-[10px] text-amber-600 font-normal">Pas de réponse</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Remarques internes
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                placeholder="Précisions sur la venue, famille, responsable, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
