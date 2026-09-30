"use client";

import { useState } from "react";
import { X, UserPlus, Phone, User, FileText } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COUNTRY_CODES = [
  { code: "+225", country: "Côte d'Ivoire (CI)" },
  { code: "+33", country: "France (FR)" },
  { code: "+221", country: "Sénégal (SN)" },
  { code: "+237", country: "Cameroun (CM)" },
  { code: "+243", country: "RDC (CD)" },
  { code: "+228", country: "Togo (TG)" },
  { code: "+229", country: "Bénin (BJ)" },
  { code: "+32", country: "Belgique (BE)" },
  { code: "+41", country: "Suisse (CH)" },
  { code: "+1", country: "USA / Canada (US/CA)" },
  { code: "+242", country: "Congo (CG)" },
  { code: "+241", country: "Gabon (GA)" },
  { code: "+226", country: "Burkina Faso (BF)" },
  { code: "+223", country: "Mali (ML)" },
  { code: "+224", country: "Guinée (GN)" },
  { code: "+230", country: "Maurice (MU)" },
];

export default function AddContactModal({ isOpen, onClose, onSuccess }: Props) {
  const [selectedCode, setSelectedCode] = useState("+225");
  const [name, setName] = useState("");
  const [rawPhone, setRawPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Veuillez saisir le nom de la personne.");
      return;
    }

    let phoneClean = rawPhone.replace(/\s+/g, "");
    if (!phoneClean) {
      setError("Veuillez saisir le numéro WhatsApp.");
      return;
    }

    // Prepend country code if user didn't enter '+' or '00'
    let fullPhone = phoneClean;
    if (!phoneClean.startsWith("+") && !phoneClean.startsWith("00")) {
      fullPhone = `${selectedCode}${phoneClean.replace(/^0+/, "")}`;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      setName("");
      setRawPhone("");
      setNotes("");
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
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-lg">Ajouter un contact WhatsApp</h3>
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
              Nom complet ou Titre de la personne *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Frère David, Sœur Marie, Pasteur Emmanuel..."
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="sm:col-span-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} ({item.country.split(" ")[0]})
                  </option>
                ))}
              </select>
              <div className="sm:col-span-2 relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Ex: 07 08 09 10 11 ou +33 6..."
                  value={rawPhone}
                  onChange={(e) => setRawPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Le numéro servira à envoyer l'invitation directement par WhatsApp.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note interne (Facultatif)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                placeholder="Ex: Responsable groupe de louange, Invité d'honneur..."
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
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Créer l'invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
