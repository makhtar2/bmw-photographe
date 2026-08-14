"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { logoutAdmin, updatePricesSettings, updateBookingStatus, deleteBooking, addPortfolioItem, deletePortfolioItem, updatePortfolioItem } from "../app/actions";
import { PricesSettings, Booking, PortfolioItem } from "../lib/db";
import { 
  LogOut, 
  Settings, 
  Image as ImageIcon, 
  Calendar, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ExternalLink, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  MessageSquare,
  FileText,
  HelpCircle,
  Bell,
  BellRing,
  Edit2,
  Upload,
  Table as TableIcon,
  Download,
  Smartphone,
  Check,
  RefreshCw
} from "lucide-react";
import Image from "next/image";

interface AdminDashboardProps {
  initialSettings: PricesSettings;
  initialBookings: Booking[];
  initialPortfolio: PortfolioItem[];
}

function playNotificationBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }, 250);
  } catch (e) {}
}

export default function AdminDashboard({ initialSettings, initialBookings, initialPortfolio }: AdminDashboardProps) {
  const [settings, setSettings] = useState<PricesSettings>(initialSettings);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolio);

  const [activeTab, setActiveTab] = useState<"reservations" | "sheet" | "portfolio" | "prices">("reservations");
  const [isPending, startTransition] = useTransition();

  // Notifications navigateur
  const [pushEnabled, setPushEnabled] = useState(false);

  // Filtres réservations
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "En attente" | "Confirmé" | "Annulé">("Tous");

  // Notification Toast
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Alerte Nouveau Client
  const [newBookingAlert, setNewBookingAlert] = useState<Booking | null>(null);
  const lastBookingCountRef = useRef(initialBookings.length);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Formulaire Portfolio & Édition
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    src: "",
    category: "studio" as "studio" | "exterior",
    aspectClass: "aspect-[3/4]",
    alt: "",
  });

  // Demander la permission notification
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setPushEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setPushEnabled(true);
        triggerNotification("success", "Notifications temps réel activées !");
        new Notification("BMW Photographe Admin", {
          body: "Vous recevrez les nouvelles réservations directement sur votre écran !",
          icon: "/icon-192.png"
        });
      }
    }
  };

  // POLLING EN TEMPS RÉEL
  const fetchLatestData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.bookings.length > lastBookingCountRef.current) {
        const newest: Booking = data.bookings[0];
        setNewBookingAlert(newest);
        playNotificationBeep();

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🎉 Nouvelle réservation de ${newest.name} !`, {
            body: `${newest.formula} (${newest.location}) - Tel: ${newest.phone}`,
            icon: "/icon-192.png"
          });
        }
        
        setTimeout(() => setNewBookingAlert(null), 15000);
      }
      
      lastBookingCountRef.current = data.bookings.length;
      setBookings(data.bookings);
      setSettings(data.settings);
      setPortfolio(data.portfolio);
    } catch (e) {}
  }, []);

  useEffect(() => {
    pollingRef.current = setInterval(fetchLatestData, 8000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchLatestData]);

  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Déconnexion
  const handleLogout = async () => {
    await logoutAdmin();
    window.location.reload();
  };

  // Mise à jour tarifs
  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updatePricesSettings(settings);
      if (res.success) {
        triggerNotification("success", "Tarifs enregistrés et mis à jour !");
      } else {
        triggerNotification("error", res.message || "Erreur de mise à jour");
      }
    });
  };

  // Statut Réservation
  const handleStatusChange = async (id: string, newStatus: Booking["status"]) => {
    startTransition(async () => {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        triggerNotification("success", `Réservation #${id} marquée "${newStatus}"`);
      } else {
        triggerNotification("error", res.message || "Erreur");
      }
    });
  };

  // Supprimer réservation
  const handleDeleteBooking = async (id: string) => {
    if (!confirm(`Supprimer définitivement la réservation #${id} ?`)) return;
    startTransition(async () => {
      const res = await deleteBooking(id);
      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
        triggerNotification("success", "Réservation supprimée");
      } else {
        triggerNotification("error", res.message || "Erreur");
      }
    });
  };

  // Upload d'image fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.src) {
        if (isEdit && editingItem) {
          setEditingItem(prev => prev ? { ...prev, src: data.src } : null);
        } else {
          setNewPhoto(prev => ({ ...prev, src: data.src }));
        }
        triggerNotification("success", "Image téléversée avec succès !");
      } else {
        triggerNotification("error", data.message || "Échec du téléversement");
      }
    } catch (err) {
      triggerNotification("error", "Erreur lors de l'envoi de l'image");
    } finally {
      setUploading(false);
    }
  };

  // Ajouter Photo Portfolio
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.src) {
      triggerNotification("error", "Veuillez téléverser ou fournir une image");
      return;
    }
    startTransition(async () => {
      const res = await addPortfolioItem({
        title: newPhoto.title,
        src: newPhoto.src,
        category: newPhoto.category,
        aspectClass: newPhoto.aspectClass,
        alt: newPhoto.alt || newPhoto.title,
      });
      if (res.success) {
        triggerNotification("success", "Nouvelle photo ajoutée au Portfolio !");
        setNewPhoto({ title: "", src: "", category: "studio", aspectClass: "aspect-[3/4]", alt: "" });
        fetchLatestData();
      } else {
        triggerNotification("error", res.message || "Erreur d'ajout");
      }
    });
  };

  // Enregistrer modification photo
  const handleSaveEditPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    startTransition(async () => {
      const res = await updatePortfolioItem(editingItem.id, {
        title: editingItem.title,
        src: editingItem.src,
        category: editingItem.category,
        aspectClass: editingItem.aspectClass,
        alt: editingItem.alt || editingItem.title,
      });

      if (res.success) {
        triggerNotification("success", "Photo modifiée avec succès !");
        setEditingItem(null);
        fetchLatestData();
      } else {
        triggerNotification("error", res.message || "Erreur lors de la mise à jour");
      }
    });
  };

  // Supprimer Photo Portfolio
  const handleDeletePhoto = async (id: number) => {
    if (!confirm("Supprimer cette photo du portfolio ?")) return;
    startTransition(async () => {
      const res = await deletePortfolioItem(id);
      if (res.success) {
        setPortfolio(prev => prev.filter(p => p.id !== id));
        triggerNotification("success", "Photo retirée du portfolio");
      } else {
        triggerNotification("error", res.message || "Erreur de suppression");
      }
    });
  };

  // Export CSV style Google Sheet
  const exportToCSV = () => {
    const headers = ["ID", "Nom Client", "Téléphone", "Lieu", "Formule", "Statut", "Date"];
    const rows = bookings.map(b => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      b.location,
      `"${b.formula.replace(/"/g, '""')}"`,
      b.status,
      b.createdAt ? new Date(b.createdAt).toLocaleDateString("fr-FR") : ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservations-bmw-photo-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtres des réservations
  const filteredBookings = bookings.filter((b) => {
    const matchQuery = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.formula.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = statusFilter === "Tous" || b.status === statusFilter;
    return matchQuery && matchStatus;
  });

  // Calculs statistiques
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "En attente").length;
  const confirmedCount = bookings.filter(b => b.status === "Confirmé").length;
  const totalRevenue = bookings
    .filter(b => b.status === "Confirmé")
    .reduce((acc, b) => {
      const match = b.formula.match(/([0-9\s]+)\s*FCFA/i);
      if (match) {
        const val = parseInt(match[1].replace(/\s+/g, "")) || 0;
        return acc + val;
      }
      return acc + 15000;
    }, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col font-sans">
      
      {/* 1. HEADER ADMIN */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-36 h-10">
              <Image src="/logo.png" alt="BMW Photographe Admin" fill className="object-contain object-left" priority />
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-md">
              Dashboard Admin & PWA
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Notification PWA */}
            {!pushEnabled ? (
              <button
                onClick={requestNotificationPermission}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg hover:bg-amber-100 transition-colors"
                title="Activer les notifs sur téléphone"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span>Activer Notifs Mobile</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-lg">
                <Bell className="w-3 h-3 text-emerald-600" /> Notifs Actives
              </span>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-extrabold flex items-center gap-2 transition-all ${
          notification.type === "success" ? "bg-emerald-900 text-white border-emerald-800" : "bg-red-900 text-white border-red-800"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
          {notification.message}
        </div>
      )}

      {/* POPUP NOUVELLE RÉSERVATION TEMPS RÉEL */}
      {newBookingAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 max-w-md animate-bounce">
          <div className="w-10 h-10 bg-[--brand] rounded-full flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[--brand]">Nouvelle Réservation !</h4>
            <p className="text-sm font-bold truncate">{newBookingAlert.name} — {newBookingAlert.formula}</p>
            <p className="text-[11px] text-slate-400">{newBookingAlert.phone} ({newBookingAlert.location})</p>
          </div>
          <button onClick={() => setNewBookingAlert(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* STATISTIQUES RAPIDES */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">Total Réservations</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{totalBookingsCount}</span>
            </div>
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">En attente</span>
              <span className="text-3xl font-extrabold text-[--brand] mt-1 block">{pendingCount}</span>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-[--brand]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">Confirmées</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{confirmedCount}</span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">Chiffre d&apos;affaires</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">
                {totalRevenue.toLocaleString("fr-FR")} <small className="text-xs font-bold text-slate-400">FCFA</small>
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* NAVIGATION ONGLETS */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`py-4 px-6 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "reservations" ? "border-[--brand] text-[--brand]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Réservations ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab("sheet")}
            className={`py-4 px-6 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "sheet" ? "border-[--brand] text-[--brand]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Vue Tableur (Google Sheet)
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            className={`py-4 px-6 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "portfolio" ? "border-[--brand] text-[--brand]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Portfolio CRUD ({portfolio.length})
          </button>

          <button
            onClick={() => setActiveTab("prices")}
            className={`py-4 px-6 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "prices" ? "border-[--brand] text-[--brand]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            Tarifs & Grille
          </button>
        </div>

        {/* ── ONGLET 1 : VUE RÉSIDERATIONS CRM ── */}
        {activeTab === "reservations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher nom, téléphone, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-1.5 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
                {(["Tous", "En attente", "Confirmé", "Annulé"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 text-[11px] font-extrabold uppercase rounded-lg border transition-all shrink-0 ${
                      statusFilter === status
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:text-black"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-extrabold">
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Formule</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 space-y-1">
                            <div className="font-extrabold text-slate-900">
                              #{booking.id} — {booking.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-bold">{booking.phone}</div>
                          </td>

                          <td className="px-6 py-4 space-y-1">
                            <span className={`px-2.5 py-0.5 text-[9px] uppercase font-extrabold tracking-wider rounded-md ${
                              booking.location === "Studio" 
                                ? "bg-purple-50 text-purple-600 border border-purple-100" 
                                : booking.location === "Mariage"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-blue-50 text-blue-600 border border-blue-100"
                            }`}>
                              {booking.location}
                            </span>
                            <div className="text-slate-600 font-bold mt-1 truncate max-w-[220px]" title={booking.formula}>
                              {booking.formula}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold ${
                              booking.status === "Confirmé"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : booking.status === "En attente"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                booking.status === "Confirmé" ? "bg-emerald-500" : booking.status === "En attente" ? "bg-amber-500" : "bg-gray-400"
                              }`}></span>
                              {booking.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://wa.me/${booking.phone.replace(/\s+/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
                                title="Contacter sur WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>

                              {booking.status !== "Confirmé" && (
                                <button
                                  onClick={() => handleStatusChange(booking.id, "Confirmé")}
                                  disabled={isPending}
                                  className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-colors"
                                  title="Marquer comme Confirmé"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}

                              {booking.status !== "Annulé" && (
                                <button
                                  onClick={() => handleStatusChange(booking.id, "Annulé")}
                                  disabled={isPending}
                                  className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-colors"
                                  title="Marquer comme Annulé"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={isPending}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">
                          Aucune réservation trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET 2 : VUE TABLEUR / GOOGLE SHEET ── */}
        {activeTab === "sheet" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-950 text-white p-4 rounded-2xl shadow-sm gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-800/80 rounded-xl">
                  <TableIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Tableau de données type Google Sheets</h3>
                  <p className="text-[11px] text-emerald-300">Base de données en direct avec édition directe et export CSV</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchLatestData}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Actualiser
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Exporter en CSV
                </button>
              </div>
            </div>

            {/* Table Spreadsheet */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px] font-bold">
                      <th className="p-3 border-r border-slate-200 w-12 text-center">#</th>
                      <th className="p-3 border-r border-slate-200">ID</th>
                      <th className="p-3 border-r border-slate-200">Nom du Client</th>
                      <th className="p-3 border-r border-slate-200">Téléphone</th>
                      <th className="p-3 border-r border-slate-200">Lieu</th>
                      <th className="p-3 border-r border-slate-200">Formule Choisie</th>
                      <th className="p-3 border-r border-slate-200">Statut (Édit)</th>
                      <th className="p-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bookings.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-3 border-r border-slate-200 text-center font-bold text-slate-400 bg-slate-50">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-900">#{b.id}</td>
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{b.name}</td>
                        <td className="p-3 border-r border-slate-200 text-slate-600">{b.phone}</td>
                        <td className="p-3 border-r border-slate-200">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700">
                            {b.location}
                          </span>
                        </td>
                        <td className="p-3 border-r border-slate-200 text-slate-700 max-w-[200px] truncate" title={b.formula}>
                          {b.formula}
                        </td>
                        <td className="p-3 border-r border-slate-200">
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value as Booking["status"])}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-bold cursor-pointer focus:outline-none focus:border-[--brand]"
                          >
                            <option value="En attente">En attente</option>
                            <option value="Confirmé">Confirmé</option>
                            <option value="Annulé">Annulé</option>
                          </select>
                        </td>
                        <td className="p-3 text-right text-slate-400 text-[11px]">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString("fr-FR") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET 3 : PORTFOLIO MANAGER (CRUD COMPLET) ── */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulaire d'ajout ou d'édition */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm self-start">
              <h3 className="font-extrabold text-base mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {editingItem ? <Edit2 className="w-4 h-4 text-[--brand]" /> : <Plus className="w-4 h-4 text-[--brand]" />}
                  {editingItem ? "Modifier la Photo" : "Ajouter une Photo"}
                </span>
                {editingItem && (
                  <button onClick={() => setEditingItem(null)} className="text-xs text-red-500 hover:underline">
                    Annuler
                  </button>
                )}
              </h3>

              <form onSubmit={editingItem ? handleSaveEditPhoto : handleAddPhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Titre de la photo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Portrait Élégance Noir & Blanc"
                    value={editingItem ? editingItem.title : newPhoto.title}
                    onChange={(e) => {
                      if (editingItem) setEditingItem({ ...editingItem, title: e.target.value });
                      else setNewPhoto({ ...newPhoto, title: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs focus:outline-none font-semibold transition-colors"
                  />
                </div>

                {/* Upload Fichier Fichier Réel */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Téléverser une image (Fichier local)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-[--brand] transition-colors cursor-pointer bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, !!editingItem)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-slate-600">
                      {uploading ? "Téléversement en cours..." : "Cliquez ou glissez une image ici"}
                    </p>
                  </div>
                </div>

                {/* URL Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Ou URL / Chemin d&apos;accès *</label>
                  <input
                    type="text"
                    required
                    placeholder="/portfolio/real1.png"
                    value={editingItem ? editingItem.src : newPhoto.src}
                    onChange={(e) => {
                      if (editingItem) setEditingItem({ ...editingItem, src: e.target.value });
                      else setNewPhoto({ ...newPhoto, src: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs focus:outline-none font-semibold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Catégorie</label>
                    <select
                      value={editingItem ? editingItem.category : newPhoto.category}
                      onChange={(e) => {
                        const val = e.target.value as "studio" | "exterior";
                        if (editingItem) setEditingItem({ ...editingItem, category: val });
                        else setNewPhoto({ ...newPhoto, category: val });
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs font-bold focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="studio">Studio</option>
                      <option value="exterior">Extérieur / Domicile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Format Ratio</label>
                    <select
                      value={editingItem ? editingItem.aspectClass : newPhoto.aspectClass}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingItem) setEditingItem({ ...editingItem, aspectClass: val });
                        else setNewPhoto({ ...newPhoto, aspectClass: val });
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs font-bold focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="aspect-[3/4]">Vertical 3:4</option>
                      <option value="aspect-[4/5]">Vertical 4:5</option>
                      <option value="aspect-[2/3]">Vertical 2:3</option>
                      <option value="aspect-square">Carré 1:1</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || uploading}
                  className="w-full py-3 bg-[--brand] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:brightness-105 transition-all shadow-sm disabled:opacity-50 mt-2"
                >
                  {editingItem ? "Enregistrer les modifications" : "Ajouter au Portfolio"}
                </button>
              </form>
            </div>

            {/* Liste des photos existantes (Édition & Suppression) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base">
                Photos Actuelles du Portfolio ({portfolio.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm group relative">
                    <div className={`relative w-full ${item.aspectClass} bg-slate-100 rounded-lg overflow-hidden`}>
                      <Image src={item.src} alt={item.alt || item.title} fill className="object-cover" />
                      <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                        {item.title}
                      </p>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-slate-500 hover:text-[--brand] hover:bg-amber-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── ONGLET 4 : TARIFS & GRILLE TARIFAIRE ── */}
        {activeTab === "prices" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-[--brand]" />
                Modifier la Grille Tarifaire
              </h3>

              <form onSubmit={handleUpdatePrices} className="space-y-8">
                {/* SECTION STUDIO */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-purple-600 tracking-wider border-b border-gray-100 pb-2">
                    En Studio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { key: "studio_5" as const, label: "5 photos" },
                      { key: "studio_7" as const, label: "7 photos" },
                      { key: "studio_10" as const, label: "10 photos" },
                      { key: "studio_15" as const, label: "15 photos" },
                      { key: "studio_20" as const, label: "20 photos" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings[key]}
                            onChange={(e) => setSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                            className="w-full pr-12 pl-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs font-bold focus:outline-none transition-colors"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-gray-400 uppercase">FCFA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION EXTÉRIEUR */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-blue-600 tracking-wider border-b border-gray-100 pb-2">
                    En Extérieur
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "exterieur_5" as const, label: "5 photos" },
                      { key: "exterieur_10" as const, label: "10 photos" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings[key]}
                            onChange={(e) => setSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                            className="w-full pr-12 pl-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs font-bold focus:outline-none transition-colors"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-gray-400 uppercase">FCFA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION MARIAGE */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-emerald-600 tracking-wider border-b border-gray-100 pb-2">
                    Reportage Cérémonie
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "ceremonie_80" as const, label: "80 photos" },
                      { key: "ceremonie_100" as const, label: "100 photos" },
                      { key: "ceremonie_120" as const, label: "120 photos" },
                      { key: "ceremonie_tak_diaka" as const, label: "Pack Tak Diaka · 60 photos" },
                      { key: "option_video" as const, label: "Option Vidéo cinématique" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings[key]}
                            onChange={(e) => setSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                            className="w-full pr-12 pl-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F4912D] rounded-xl text-xs font-bold focus:outline-none transition-colors"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-gray-400 uppercase">FCFA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3.5 bg-slate-900 text-white hover:bg-[--brand] transition-colors rounded-xl text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Enregistrer la grille tarifaire
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
