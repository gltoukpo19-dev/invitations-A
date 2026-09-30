import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ministère VINO-ESVI • Invitations WhatsApp (1 Pierre 1:3)",
  description:
    "Application de gestion et d'envoi d'invitations WhatsApp pour le Ministère VINO-ESVI. Cartes d'invitation avec confirmation 'Je viendrai' et 'Je ne viendrai pas'.",
  icons: {
    icon: "/vino-esvi-logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
