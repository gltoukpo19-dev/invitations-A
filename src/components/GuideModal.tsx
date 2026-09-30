"use client";

import { X, Send, CheckCircle2, MessageCircle, HelpCircle, Smartphone, Edit3, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddContactClick: () => void;
}

export default function GuideModal({ isOpen, onClose, onAddContactClick }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-white shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Guide d'utilisation pas à pas</h3>
              <p className="text-xs text-amber-100">Comment envoyer vos invitations et suivre les retours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          {/* Étape 1 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-sm shadow-xs">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950 text-sm sm:text-base">
                Vérifiez ou personnalisez l'événement
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Cliquez sur le bouton <strong>« Paramètres de l'événement »</strong> en haut pour ajuster le nom du ministère, la date, l'heure, le lieu de la rencontre et les sujets de la journée (verset 1 Pierre 1:3).
              </p>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Ajoutez vos contacts WhatsApp
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Cliquez sur <strong>« Nouveau Contact »</strong> pour ajouter un invité (Nom + numéro avec indicatif international comme +225, +33, etc.). Pour aller plus vite, utilisez <strong>« Import groupé »</strong> pour coller plusieurs contacts d'un coup.
              </p>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                Envoyez l'invitation par WhatsApp
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Dans la colonne <strong>Envoi WhatsApp</strong> de chaque invité, cliquez sur <strong>« Envoyer »</strong>. WhatsApp s'ouvre automatiquement (sur téléphone ou WhatsApp Web sur ordinateur) avec le message pré-rempli :
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-slate-800 space-y-1">
                <p className="font-bold text-emerald-800">🕊️ VINO-ESVI - Invitation pour toi [Nom]</p>
                <p className="text-slate-600">Le Ministère VINO-ESVI vous convie à un grand moment de prière...</p>
                <p className="text-blue-600 underline">https://.../invitation/[token-unique]</p>
              </div>
              <p className="text-[11px] text-slate-500">
                Vous pouvez également copier directement le lien avec l'icône de copie pour l'envoyer par SMS ou email.
              </p>
            </div>
          </div>

          {/* Étape 4 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-sm shadow-xs">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Le destinataire ouvre la carte et choisit son bouton
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Le destinataire clique sur le lien depuis son téléphone. Il découvre la magnifique carte avec le logo VINO-ESVI (chapelet & crucifix) et deux boutons :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-medium">
                  🟢 <strong>Bouton Vert (« Je viendrai ») :</strong> Déclenche les confettis, la Parole de Dieu, le message d'encouragement, et le rappel d'inscrire la date dans son agenda et de se mettre en prière.
                </div>
                <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-950 font-medium">
                  🔴 <strong>Bouton Rouge (« Je ne viendrai pas ») :</strong> Affiche « Dommage car les moments sont uniques [Nom] ! » avec une bénédiction fraternelle.
                </div>
              </div>
            </div>
          </div>

          {/* Étape 5 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white font-bold text-sm shadow-xs">
              5
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950 text-sm sm:text-base">
                Vous recevez le retour en direct et pouvez modifier
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Dès qu'un invité répond, l'application se met à jour automatiquement toutes les 5 secondes sans recharger la page :
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                <li>Une notification sonore et visuelle s'affiche en haut de votre écran.</li>
                <li>L'invité est classé dans l'onglet <strong>« Ceux qui ont accepté »</strong> ou <strong>« Ceux qui ont refusé »</strong>.</li>
                <li>Vous pouvez modifier n'importe quand son statut ou ses coordonnées via le bouton <strong>« Modifier »</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">Prêt à commencer ?</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                onAddContactClick();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold shadow hover:from-amber-700 hover:to-amber-800 transition cursor-pointer"
            >
              Ajouter un premier contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
