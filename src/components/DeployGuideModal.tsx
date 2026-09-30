"use client";

import { X, Cloud, Globe, Database, Key, CheckCircle2, Copy, Sparkles, Terminal } from "lucide-react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeployGuideModal({ isOpen, onClose }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-white shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Mettre l'application en ligne (Déploiement)</h3>
              <p className="text-xs text-blue-100">Guide pour rendre votre application accessible partout sur Internet</p>
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
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-950 text-xs">
            💡 <strong>Hébergement 100% gratuit & performant recommandé :</strong> Vercel (pour l'application Next.js) + Neon ou Supabase (pour la base de données PostgreSQL).
          </div>

          {/* Étape 1 */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">1</span>
              <h4>Créer une base de données PostgreSQL en ligne (Gratuit)</h4>
            </div>
            <p className="text-slate-600 pl-8">
              L'application a besoin d'une base de données PostgreSQL en ligne pour enregistrer les contacts et réponses 24h/24 :
            </p>
            <div className="pl-8 space-y-1.5 text-xs">
              <p>1. Rendez-vous sur <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Neon.tech</a> ou <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Supabase.com</a>.</p>
              <p>2. Créez un compte gratuit et cliquez sur <strong>Create Project</strong>.</p>
              <p>3. Copiez l'URL de connexion fournie qui ressemble à :</p>
              <div className="flex items-center justify-between p-2 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-lg">
                <span className="truncate">postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require</span>
                <button
                  onClick={() => copyText("DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require", "db")}
                  className="ml-2 text-xs text-white hover:text-amber-300"
                >
                  {copiedKey === "db" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">2</span>
              <h4>Déposer le code sur GitHub</h4>
            </div>
            <div className="pl-8 space-y-1 text-slate-600 text-xs">
              <p>1. Allez sur <a href="https://github.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">GitHub.com</a> et créez un nouveau dépôt (ex: <code>vino-esvi-invitations</code>).</p>
              <p>2. Poussez le code de votre projet dessus :</p>
              <div className="p-2.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg space-y-1">
                <p>git init</p>
                <p>git add .</p>
                <p>git commit -m "Application invitations VINO-ESVI"</p>
                <p>git remote add origin https://github.com/votre-nom/vino-esvi.git</p>
                <p>git push -u origin main</p>
              </div>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">3</span>
              <h4>Déployer sur Vercel (Recommandé en 1 clic)</h4>
            </div>
            <div className="pl-8 space-y-1.5 text-slate-600 text-xs">
              <p>1. Allez sur <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Vercel.com</a> et connectez-vous avec votre compte GitHub.</p>
              <p>2. Cliquez sur <strong>Add New... &gt; Project</strong> et importez votre dépôt <code>vino-esvi</code>.</p>
              <p>3. Dans la section <strong>Environment Variables</strong>, ajoutez :</p>
              <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-mono">
                <strong>Nom :</strong> DATABASE_URL<br />
                <strong>Valeur :</strong> [Votre lien PostgreSQL copié à l'étape 1]
              </div>
              <p>4. Cliquez sur <strong>Deploy</strong> !</p>
            </div>
          </div>

          {/* Étape 4 */}
          <div className="space-y-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">4</span>
              <h4>Initialiser les tables dans la base en ligne</h4>
            </div>
            <div className="pl-8 space-y-1 text-emerald-900 text-xs">
              <p>Sur votre ordinateur, exécutez cette commande avec votre URL de production pour créer la table des invitations :</p>
              <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                npx drizzle-kit push
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-200">
            <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              🎉 Votre adresse publique est prête !
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vercel vous donnera une adresse comme <code>https://vino-esvi.vercel.app</code>.
              Chaque message WhatsApp envoyé contiendra automatiquement ce lien officiel direct que n'importe qui dans le monde pourra ouvrir sur son téléphone !
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
