"use client";

import { useState } from "react";
import { X, Users, UploadCloud, Info } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [text, setText] = useState("");
  const [defaultCode, setDefaultCode] = useState("+225");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Veuillez coller au moins un contact.");
      return;
    }

    const contacts: { name: string; phone: string; notes?: string }[] = [];

    for (const line of lines) {
      // Split by comma, semicolon, tab or pipe
      const parts = line.split(/[,;\t|]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        let phone = parts[1].replace(/\s+/g, "");
        const notes = parts.slice(2).join(" ").trim() || undefined;

        if (!phone.startsWith("+") && !phone.startsWith("00")) {
          phone = `${defaultCode}${phone.replace(/^0+/, "")}`;
        }

        if (name && phone) {
          contacts.push({ name, phone, notes });
        }
      }
    }

    if (contacts.length === 0) {
      setError(
        "Format non reconnu. Assurez-vous d'avoir une ligne par contact : 'Nom, Numéro' (ex: Pasteur Paul, +2250701020304)"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'import");
      }

      setText("");
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
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-lg">Importation groupée de contacts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleImport} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Format attendu :</p>
              <p className="mt-0.5 text-slate-700">
                Collez vos contacts (une ligne par personne) avec une virgule ou point-virgule entre le nom et le numéro :
              </p>
              <p className="mt-1 font-mono text-[11px] bg-white p-2 rounded-lg border border-amber-200 text-slate-800">
                Frère Michel, +2250701020304<br />
                Sœur Clarisse, +33612345678, Chorale<br />
                Diacre Thomas, 0709080706
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Indicatif par défaut (si non spécifié avec +)
            </label>
            <input
              type="text"
              value={defaultCode}
              onChange={(e) => setDefaultCode(e.target.value)}
              placeholder="+225"
              className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Liste des contacts (Nom, Téléphone)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Exemple :&#10;Pasteur Jean-Marc, +2250102030405&#10;Sœur Véronique, +33698765432&#10;Frère Emmanuel, 0700112233"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              required
            />
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
              <UploadCloud className="w-4 h-4" />
              {isSubmitting ? "Importation en cours..." : "Importer les contacts"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
