"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Settings,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  MessageCircle,
  Calendar,
  MapPin,
  Check,
  Edit3,
  Bell,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Event, Invitation } from "@/db/schema";
import AddContactModal from "./AddContactModal";
import BulkImportModal from "./BulkImportModal";
import EditEventModal from "./EditEventModal";
import EditContactModal from "./EditContactModal";
import GuideModal from "./GuideModal";
import DeployGuideModal from "./DeployGuideModal";
import InvitationCard from "./InvitationCard";
import { generateWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { HelpCircle } from "lucide-react";

interface DashboardProps {
  initialEvent: Event;
  initialInvitations: Invitation[];
  initialStats: {
    total: number;
    accepted: number;
    declined: number;
    pending: number;
    responseRate: number;
  };
}

export default function DashboardClient({
  initialEvent,
  initialInvitations,
  initialStats,
}: DashboardProps) {
  const [event, setEvent] = useState<Event>(initialEvent);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [stats, setStats] = useState(initialStats);

  // Tabs: 'all' | 'accepted' | 'declined' | 'pending' | 'preview'
  const [activeTab, setActiveTab] = useState<"all" | "accepted" | "declined" | "pending" | "preview">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);

  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [selectedPreviewInvitation, setSelectedPreviewInvitation] = useState<Invitation | null>(
    initialInvitations[0] || null
  );

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState<string | null>(null);

  const prevInvitationsRef = useRef<Invitation[]>(initialInvitations);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = async (silent = false) => {
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();

        // Check if someone responded since last check to notify the sender
        const oldMap = new Map(prevInvitationsRef.current.map((i) => [i.id, i.status]));
        const newlyResponded = (data.invitations as Invitation[]).filter((inv) => {
          const prevStatus = oldMap.get(inv.id);
          return prevStatus && prevStatus !== inv.status && inv.status !== "pending";
        });

        if (newlyResponded.length > 0) {
          const latest = newlyResponded[0];
          const notifMsg =
            latest.status === "accepted"
              ? `🎉 ${latest.name} vient de confirmer : "Je viendrai" !`
              : `ℹ️ ${latest.name} a indiqué : "Ne viendra pas".`;
          setNewNotification(notifMsg);
          showToast(notifMsg);
        }

        prevInvitationsRef.current = data.invitations;
        setEvent(data.event);
        setInvitations(data.invitations);
        setStats(data.stats);

        if (data.invitations.length > 0 && !selectedPreviewInvitation) {
          setSelectedPreviewInvitation(data.invitations[0]);
        }
      }
    } catch (err) {
      if (!silent) console.error("Failed to refresh data", err);
    }
  };

  // Real-time polling every 5 seconds so sender sees live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette invitation ?")) return;

    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Invitation supprimée avec succès");
        refreshData();
      }
    } catch {
      showToast("Erreur lors de la suppression");
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Statut mis à jour : ${newStatus === "accepted" ? "Je viendrai 🟢" : newStatus === "declined" ? "Ne viendra pas 🔴" : "En attente ⏳"}`);
        refreshData();
      }
    } catch {
      showToast("Erreur de mise à jour");
    }
  };

  const handleSendWhatsApp = async (inv: Invitation) => {
    const message = generateWhatsAppMessage({
      name: inv.name,
      phone: inv.phone,
      ministryName: event.ministryName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      location: event.location,
      token: inv.token,
    });

    const url = getWhatsAppUrl({ phone: inv.phone, message });

    // Open WhatsApp
    window.open(url, "_blank");

    // Mark as sent in DB
    try {
      await fetch(`/api/invitations/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappSent: true }),
      });
      refreshData();
    } catch {
      // ignore
    }
  };

  const handleCopyText = (text: string, id: number, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = (filteredOnly = false) => {
    const listToExport = filteredOnly ? displayedInvitations : invitations;
    if (listToExport.length === 0) {
      showToast("Aucun invité à exporter");
      return;
    }

    const headers = ["Nom", "Téléphone", "Statut", "Date de réponse", "Lien d'invitation", "Notes"];
    const rows = listToExport.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.phone}"`,
      `"${i.status === "accepted" ? "Confirmé (Je viendrai)" : i.status === "declined" ? "Décliné (Je ne viendrai pas)" : "En attente"}"`,
      `"${i.respondedAt ? new Date(i.respondedAt).toLocaleDateString("fr-FR") : "-"}"`,
      `"${window.location.origin}/invitation/${i.token}"`,
      `"${(i.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invitations-vino-esvi-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Fichier CSV exporté !");
  };

  // Filtered invitations list based on activeTab and searchQuery
  const displayedInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.phone.includes(searchQuery) ||
      (inv.notes && inv.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      activeTab === "all" ||
      activeTab === "preview" ||
      (activeTab === "accepted" && inv.status === "accepted") ||
      (activeTab === "declined" && inv.status === "declined") ||
      (activeTab === "pending" && inv.status === "pending");

    return matchesSearch && matchesStatus;
  });

  const acceptedList = invitations.filter((i) => i.status === "accepted");
  const declinedList = invitations.filter((i) => i.status === "declined");
  const pendingList = invitations.filter((i) => i.status === "pending");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and ministry title */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md p-0.5 bg-white shrink-0">
                <Image
                  src="/vino-esvi-logo.png"
                  alt="VINO-ESVI Logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-amber-950 font-serif tracking-tight">
                    {event.ministryName}
                  </span>
                  <span className="hidden sm:inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 uppercase tracking-wider">
                    1 Pierre 1:3
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Plateforme d'invitations WhatsApp & Suivi des présences
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDeployGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-900 transition cursor-pointer shadow-xs"
                title="Mettre l'application en ligne sur Internet"
              >
                <span className="text-sm">🌐</span>
                <span className="hidden sm:inline">Mettre en ligne</span>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition cursor-pointer shadow-xs"
                title="Comment procéder pour envoyer les invitations"
              >
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Comment ça marche ?</span>
              </button>

              <button
                onClick={() => setIsEditEventOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                title="Modifier les détails de la rencontre"
              >
                <Settings className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Paramètres</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nouveau Contact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher: Quick navigation between list categories */}
        <div className="border-t border-slate-200/80 bg-slate-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2">
            <nav className="flex space-x-1 sm:space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "all"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tous les invités</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === "all" ? "bg-amber-800 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {invitations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("accepted")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "accepted"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-800 hover:bg-emerald-100/70"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ceux qui ont accepté ({stats.accepted})</span>
              </button>

              <button
                onClick={() => setActiveTab("declined")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "declined"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-red-800 hover:bg-red-100/70"
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Ceux qui ont refusé ({stats.declined})</span>
              </button>

              <button
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-amber-800 hover:bg-amber-100/70"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>En attente ({stats.pending})</span>
              </button>

              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Aperçu de la Carte</span>
              </button>
            </nav>

            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 ml-4 shrink-0">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Cellulaire
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Tablet className="w-3.5 h-3.5 text-slate-400" /> Tablette
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-slate-400" /> Ordinateur
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time notification banner if someone responded */}
        {newNotification && (
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 shadow-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Nouvelle réponse reçue en direct de WhatsApp !
                </p>
                <p className="text-sm font-bold text-emerald-950">{newNotification}</p>
              </div>
            </div>
            <button
              onClick={() => setNewNotification(null)}
              className="text-xs font-semibold text-emerald-800 hover:underline px-2 py-1"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Banner with current event highlights */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-red-900 text-white p-5 sm:p-6 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
            <Image
              src="/vino-esvi-logo.png"
              alt="Background emblem"
              width={260}
              height={260}
            />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200 border border-amber-300/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Événement en cours • {event.ministryName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-amber-100">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-300" />
                  {event.eventDate} ({event.eventTime})
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-300" />
                  {event.location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditEventOpen(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs sm:text-sm font-bold text-white transition backdrop-blur flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Modifier l'événement
              </button>
            </div>
          </div>
        </div>

        {/* Real-time RSVP Statistics Cards (Clickable to switch tab) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card: Total */}
          <div
            onClick={() => setActiveTab("all")}
            className={`cursor-pointer rounded-2xl bg-white p-4 sm:p-5 border transition shadow-xs hover:border-slate-400 ${
              activeTab === "all" ? "ring-2 ring-slate-800" : "border-slate-200/90"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Invités
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              {stats.total}
            </p>
            <p className="mt-1 text-xs text-slate-500">Cliquez pour voir tous</p>
          </div>

          {/* Card: Confirmés "Je viendrai" */}
          <div
            onClick={() => setActiveTab("accepted")}
            className={`cursor-pointer rounded-2xl bg-white p-4 sm:p-5 border-2 transition shadow-xs hover:border-emerald-500 bg-gradient-to-br from-white to-emerald-50/40 ${
              activeTab === "accepted" ? "ring-2 ring-emerald-600 border-emerald-500" : "border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Ont Accepté 🟢
              </span>
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700">
              {stats.accepted}
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              Liste de ceux qui ont accepté
            </p>
          </div>

          {/* Card: Déclinés "Je ne viendrai pas" */}
          <div
            onClick={() => setActiveTab("declined")}
            className={`cursor-pointer rounded-2xl bg-white p-4 sm:p-5 border-2 transition shadow-xs hover:border-red-500 bg-gradient-to-br from-white to-red-50/40 ${
              activeTab === "declined" ? "ring-2 ring-red-600 border-red-500" : "border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                Ont Refusé 🔴
              </span>
              <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-red-600">
              {stats.declined}
            </p>
            <p className="mt-1 text-xs text-red-500 font-medium">
              Liste de ceux qui ont refusé
            </p>
          </div>

          {/* Card: En attente */}
          <div
            onClick={() => setActiveTab("pending")}
            className={`cursor-pointer rounded-2xl bg-white p-4 sm:p-5 border transition shadow-xs hover:border-amber-400 bg-gradient-to-br from-white to-amber-50/30 ${
              activeTab === "pending" ? "ring-2 ring-amber-500 border-amber-400" : "border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                En attente ⏳
              </span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-700">
              {stats.pending}
            </p>
            <p className="mt-1 text-xs text-amber-600 font-medium">
              En attente de réponse
            </p>
          </div>
        </div>

        {/* LIST VIEW (all / accepted / declined / pending) */}
        {activeTab !== "preview" && (
          <div className="space-y-4">
            {/* Header banner describing the currently viewed list */}
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  activeTab === "accepted"
                    ? "bg-emerald-100 text-emerald-800"
                    : activeTab === "declined"
                    ? "bg-red-100 text-red-800"
                    : activeTab === "pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800"
                }`}>
                  {activeTab === "accepted" && <CheckCircle2 className="w-5 h-5" />}
                  {activeTab === "declined" && <XCircle className="w-5 h-5" />}
                  {activeTab === "pending" && <Clock className="w-5 h-5" />}
                  {activeTab === "all" && <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeTab === "accepted" && "Liste de ceux qui ont accepté (« Je viendrai »)"}
                    {activeTab === "declined" && "Liste de ceux qui ont refusé (« Je ne viendrai pas »)"}
                    {activeTab === "pending" && "Liste des personnes en attente de réponse"}
                    {activeTab === "all" && "Liste complète de tous les contacts & invitations"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {displayedInvitations.length} contact(s) affiché(s) • Vous pouvez effectuer des modifications et changements sur chaque contact
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Coller plusieurs contacts d'un coup"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Import groupé</span>
                </button>

                <button
                  onClick={() => handleExportCsv(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Télécharger cette liste au format CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter ({displayedInvitations.length})</span>
                </button>

                <button
                  onClick={() => refreshData()}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="Rafraîchir les réponses en direct"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone WhatsApp, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs transition"
              />
            </div>

            {/* Table of contacts */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              {displayedInvitations.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">
                    Aucun invité dans cette catégorie
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchQuery ? "Aucun contact ne correspond à votre filtre de recherche." : "Il n'y a aucun contact ayant ce statut pour le moment."}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter un contact
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Nom de l'invité</th>
                        <th className="py-3.5 px-4">Contact WhatsApp</th>
                        <th className="py-3.5 px-4">Statut de la réponse</th>
                        <th className="py-3.5 px-4 text-center">Envoi WhatsApp</th>
                        <th className="py-3.5 px-4 text-right">Modifier & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {displayedInvitations.map((inv) => {
                        const directUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invitation/${inv.token}`;

                        return (
                          <tr key={inv.id} className="hover:bg-amber-50/30 transition">
                            {/* Name & Notes */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{inv.name}</div>
                              {inv.notes && (
                                <div
                                  className="text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2 py-1 mt-1 break-words whitespace-pre-wrap max-w-sm"
                                  title={inv.notes}
                                >
                                  📝 {inv.notes}
                                </div>
                              )}
                            </td>

                            {/* Phone */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono text-xs text-slate-700 font-medium">
                                {inv.phone}
                              </div>
                              {inv.whatsappSentAt && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                  <Check className="w-3 h-3" /> Envoyé
                                </span>
                              )}
                            </td>

                            {/* Status with Quick Toggle */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={inv.status}
                                  onChange={(e) => handleUpdateStatus(inv.id, e.target.value)}
                                  className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border transition cursor-pointer ${
                                    inv.status === "accepted"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200"
                                      : inv.status === "declined"
                                      ? "bg-red-50 text-red-800 border-red-300 ring-1 ring-red-200"
                                      : "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200"
                                  }`}
                                  title="Changer manuellement le statut de présence"
                                >
                                  <option value="accepted">🟢 Je viendrai (Accepté)</option>
                                  <option value="declined">🔴 Ne viendra pas (Refusé)</option>
                                  <option value="pending">⏳ En attente</option>
                                </select>
                              </div>
                              {inv.respondedAt && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Répondu le {new Date(inv.respondedAt).toLocaleDateString("fr-FR")}
                                </div>
                              )}
                            </td>

                            {/* WhatsApp Send Action */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleSendWhatsApp(inv)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                                title="Ouvrir WhatsApp avec le message d'invitation personnalisé"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Envoyer</span>
                              </button>
                            </td>

                            {/* Actions Dropdown / Buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit Contact Button */}
                                <button
                                  onClick={() => setEditingInvitation(inv)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                                  title="Modifier les informations de cet invité"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Modifier</span>
                                </button>

                                {/* Copy Direct Link */}
                                <button
                                  onClick={() =>
                                    handleCopyText(directUrl, inv.id, "Lien copié dans le presse-papiers !")
                                  }
                                  className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                                  title="Copier le lien direct vers la carte"
                                >
                                  {copiedId === inv.id ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>

                                {/* Preview Card */}
                                <Link
                                  href={`/invitation/${inv.token}`}
                                  target="_blank"
                                  className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                                  title="Ouvrir la carte de cet invité"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteContact(inv.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: LIVE CARD PREVIEW */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            {/* Device preview toolbar */}
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Choisir l'invité à tester :
                </span>
                <select
                  value={selectedPreviewInvitation?.id || ""}
                  onChange={(e) => {
                    const found = invitations.find((i) => i.id === Number(e.target.value));
                    if (found) setSelectedPreviewInvitation(found);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                >
                  {invitations.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsive screen switchers */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Cellulaire</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewDevice === "tablet"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablette</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Ordinateur</span>
                </button>
              </div>
            </div>

            {/* Explanatory notice */}
            <div className="text-center text-xs text-slate-500 max-w-xl mx-auto">
              Testez ci-dessous l'interaction comme le destinataire lorsqu'il ouvre son lien WhatsApp.
              Cliquez sur <strong>« Je viendrai »</strong> ou <strong>« Je ne viendrai pas »</strong> pour observer le comportement prévu.
            </div>

            {/* Device frame container */}
            <div className="flex justify-center p-4">
              <div
                className={`transition-all duration-300 ${
                  previewDevice === "mobile"
                    ? "w-full max-w-sm rounded-[40px] border-8 border-slate-800 shadow-2xl p-2 bg-slate-900"
                    : previewDevice === "tablet"
                    ? "w-full max-w-md rounded-[32px] border-8 border-slate-700 shadow-2xl p-3 bg-slate-800"
                    : "w-full max-w-2xl rounded-2xl border border-slate-300 shadow-xl p-4 bg-slate-50"
                }`}
              >
                <div className="overflow-y-auto max-h-[85vh] rounded-3xl">
                  {selectedPreviewInvitation ? (
                    <InvitationCard
                      invitation={selectedPreviewInvitation}
                      event={event}
                      isPreview={true}
                    />
                  ) : (
                    <div className="p-8 text-center bg-white rounded-3xl">
                      <p className="text-slate-500 text-sm">
                        Ajoutez d'abord un contact pour voir l'aperçu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast("Contact ajouté avec succès !");
          refreshData();
        }}
      />

      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          showToast("Contacts importés avec succès !");
          refreshData();
        }}
      />

      <EditEventModal
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
        event={event}
        onSuccess={() => {
          showToast("Paramètres de l'invitation mis à jour !");
          refreshData();
        }}
      />

      <EditContactModal
        isOpen={!!editingInvitation}
        invitation={editingInvitation}
        onClose={() => setEditingInvitation(null)}
        onSuccess={() => {
          showToast("Invité modifié avec succès !");
          refreshData();
        }}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onAddContactClick={() => setIsAddModalOpen(true)}
      />

      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
