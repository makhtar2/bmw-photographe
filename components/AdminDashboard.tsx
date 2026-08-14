"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin, updatePricesSettings, updateBookingStatus, deleteBooking, addBookingAdmin, updateBookingFull, addPortfolioItem, deletePortfolioItem, updatePortfolioItem, updatePromoOffer } from "../app/actions";
import { PricesSettings, Booking, PortfolioItem, EventPromo } from "../lib/db";
import {
  LogOut,
  Settings,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Bell,
  BellRing,
  Edit2,
  Upload,
  Sparkles,
  CalendarPlus,
  Send,
  Smartphone,
  Tag,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Download,
  Share,
  X
} from "lucide-react";
import Image from "next/image";

interface AdminDashboardProps {
  initialSettings: PricesSettings;
  initialBookings: Booking[];
  initialPortfolio: PortfolioItem[];
  initialPromo?: EventPromo;
  currentRoute?: string;
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
  } catch (e) { }
}

function addToCalendar(b: Booking) {
  const startDateStr = b.date || new Date().toISOString().slice(0, 10);
  const startTimeStr = b.time || "15:00";
  const cleanDate = startDateStr.replace(/-/g, "");
  const cleanTime = startTimeStr.replace(/:/g, "") + "00";

  const endHour = (parseInt(startTimeStr.split(":")[0]) + 1).toString().padStart(2, "0");
  const cleanEndTime = `${endHour}3000`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BMW Photographe Studio//iPhone Calendar//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:Séance Photo - ${b.name}`,
    `DESCRIPTION:Client: ${b.name}\\nTéléphone: ${b.phone}\\nFormule: ${b.formula}\\nLieu: ${b.location}\\nStatut: ${b.status}`,
    `LOCATION:${b.location === "Studio" ? "BMW Photographe Studio Thiès" : b.location}`,
    `DTSTART:${cleanDate}T${cleanTime}`,
    `DTEND:${cleanDate}T${cleanEndTime}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Rappel: Séance photo dans 2h !",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Rappel: Séance photo demain !",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsLines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `seance-${b.name.replace(/\s+/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getWhatsAppReminderUrl(b: Booking) {
  const cleanPhone = b.phone.replace(/\s+/g, "");
  const dateTxt = b.date ? `prévue le ${new Date(b.date).toLocaleDateString("fr-FR")} à ${b.time || "15:00"}` : "prévue très prochainement";
  const text = `Bonjour ${b.name},

C'est BMW Photographe. Je vous contacte pour vous rappeler votre séance photo "${b.formula}" ${dateTxt}.

Lieu : ${b.location === "Studio" ? "Studio BMW Photographe - Thiès Médina Fall" : b.location}.

Merci de bien vouloir me confirmer votre présence.

Bien cordialement,
BMW Photographe`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export default function AdminDashboard({ initialSettings, initialBookings, initialPortfolio, initialPromo, currentRoute }: AdminDashboardProps) {
  const pathname = usePathname();
  const activeTab = (currentRoute || pathname) === "/admin/agenda"
    ? "calendar"
    : (currentRoute || pathname) === "/admin/portfolio"
      ? "portfolio"
      : (currentRoute || pathname) === "/admin/tarifs"
        ? "prices"
        : "reservations";

  const [settings, setSettings] = useState<PricesSettings>(initialSettings);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolio);
  const [promo, setPromo] = useState<EventPromo>(initialPromo || {
    enabled: true,
    eventName: "Spécial Gamou",
    subtitle: "Profitez de réductions exclusives sur vos séances photo pour le Gamou !",
    badgeText: "PROMO GAMOU",
    promoPrices: {
      studio_5: 8000,
      studio_7: 12000,
      studio_10: 16000,
      studio_15: 25000,
      studio_20: 42000,
      exterieur_5: 20000,
      exterieur_10: 35000,
      ceremonie_80: 95000,
      ceremonie_100: 110000,
      ceremonie_120: 135000,
      ceremonie_tak_diaka: 75000,
      option_video: 12000,
    }
  });

  const [isPending, startTransition] = useTransition();

  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandaloneApp = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
      setIsStandalone(isStandaloneApp);

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
        triggerNotification("success", "Application Admin installée sur votre téléphone !");
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Notifications navigateur
  const [pushEnabled, setPushEnabled] = useState(false);

  // Agenda State
  const [agendaView, setAgendaView] = useState<"grid" | "list">("grid");
  const [agendaDate, setAgendaDate] = useState<Date>(new Date());

  // Filtres réservations
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "En attente" | "Confirmé" | "Annulé">("Tous");

  // Notification Toast
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Alerte Nouveau Client
  const [newBookingAlert, setNewBookingAlert] = useState<Booking | null>(null);
  const lastBookingCountRef = useRef(initialBookings.length);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Formulaire Portfolio & Édition Image
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    src: "",
    category: "studio" as "studio" | "exterior",
    aspectClass: "aspect-[3/4]",
    alt: "",
  });

  // CRUD Réservations
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<Omit<Booking, "id" | "createdAt">>({
    name: "", phone: "", location: "Studio", formula: "", status: "En attente", date: "", time: "15:00"
  });

  // Permission notifications
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
        triggerNotification("success", "Notifications activées sur votre appareil !");
        new Notification("BMW Photographe Admin", {
          body: "Vous recevrez les nouvelles réservations directement !",
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
          new Notification(`Nouvelle réservation de ${newest.name}`, {
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
    } catch (e) { }
  }, []);

  function getGoogleCalendarUrl(b: Booking) {
    const startDateStr = b.date || new Date().toISOString().slice(0, 10);
    const startTimeStr = b.time || "15:00";
    const cleanDate = startDateStr.replace(/-/g, "");
    const cleanTime = startTimeStr.replace(/:/g, "") + "00";
    const endHour = (parseInt(startTimeStr.split(":")[0]) + 1).toString().padStart(2, "0");
    const cleanEndTime = `${endHour}3000`;

    const title = encodeURIComponent(`Séance Photo - ${b.name}`);
    const details = encodeURIComponent(`Client: ${b.name}\nTéléphone: ${b.phone}\nFormule: ${b.formula}\nLieu: ${b.location}\nStatut: ${b.status}`);
    const location = encodeURIComponent(b.location === "Studio" ? "BMW Photographe Studio Thiès Médina Fall" : b.location);
    const dates = `${cleanDate}T${cleanTime}/${cleanDate}T${cleanEndTime}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  }

  useEffect(() => {
    pollingRef.current = setInterval(fetchLatestData, 4000);
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

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.reload();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedSettings = localStorage.getItem("bmw_custom_settings");
      if (cachedSettings) {
        try {
          const parsed = JSON.parse(cachedSettings);
          if (parsed && typeof parsed === "object") {
            setSettings(prev => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    }
  }, []);

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("bmw_custom_settings", JSON.stringify(settings));
    }
    startTransition(async () => {
      const res = await updatePricesSettings(settings);
      if (res.success) {
        triggerNotification("success", "Tarifs enregistrés et mis à jour !");
      } else {
        triggerNotification("error", res.message || "Erreur de mise à jour");
      }
    });
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updatePromoOffer(promo);
      if (res.success) {
        triggerNotification("success", "Offre promo enregistrée avec succès !");
      } else {
        triggerNotification("error", res.message || "Erreur lors de la sauvegarde");
      }
    });
  };

  const handleTogglePromo = async (newEnabled: boolean) => {
    const updatedPromo = { ...promo, enabled: newEnabled };
    setPromo(updatedPromo);
    startTransition(async () => {
      const res = await updatePromoOffer(updatedPromo);
      if (res.success) {
        triggerNotification("success", newEnabled ? "Offre promo activée avec succès !" : "Offre promo désactivée.");
      } else {
        triggerNotification("error", res.message || "Erreur lors de la sauvegarde");
      }
    });
  };

  const handleStatusChange = async (id: string, newStatus: Booking["status"]) => {
    startTransition(async () => {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        triggerNotification("success", `Statut changé en "${newStatus}"`);
      } else {
        triggerNotification("error", res.message || "Erreur");
      }
    });
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm(`Supprimer la réservation #${id} ?`)) return;
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

  const openAddBookingModal = () => {
    setEditingBookingId(null);
    setBookingForm({
      name: "",
      phone: "",
      location: "Studio",
      formula: "",
      status: "En attente",
      date: new Date().toISOString().slice(0, 10),
      time: "15:00"
    });
    setIsBookingModalOpen(true);
  };

  const openEditBookingModal = (b: Booking) => {
    setEditingBookingId(b.id);
    setBookingForm({
      name: b.name,
      phone: b.phone,
      location: b.location,
      formula: b.formula,
      status: b.status,
      date: b.date || "",
      time: b.time || "15:00"
    });
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingBookingId) {
        const res = await updateBookingFull(editingBookingId, bookingForm);
        if (res.success) {
          triggerNotification("success", "Réservation modifiée !");
          setBookings(prev => prev.map(b => b.id === editingBookingId ? { ...b, ...bookingForm } : b));
          setIsBookingModalOpen(false);
        } else triggerNotification("error", res.message || "Erreur");
      } else {
        const res = await addBookingAdmin(bookingForm);
        if (res.success && res.id) {
          triggerNotification("success", "Séance planifiée avec succès !");
          setBookings([{ id: res.id, ...bookingForm, createdAt: new Date().toISOString() }, ...bookings]);
          setIsBookingModalOpen(false);
        } else triggerNotification("error", res.message || "Erreur");
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    const objectUrl = URL.createObjectURL(file);
    if (isEdit && editingItem) {
      setEditingItem(prev => prev ? { ...prev, src: objectUrl } : null);
    } else {
      setNewPhoto(prev => ({ ...prev, src: objectUrl }));
    }

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
        setUploadSuccess(true);
        triggerNotification("success", "Photo ajoutée au portfolio !");
      } else {
        triggerNotification("error", data.message || "Échec du téléversement");
      }
    } catch (err) {
      triggerNotification("error", "Erreur lors de l'envoi de l'image");
    } finally {
      setUploading(false);
    }
  };

  const openAddPhotoModal = () => {
    setEditingItem(null);
    setNewPhoto({ title: "", src: "", category: "studio", aspectClass: "aspect-[3/4]", alt: "" });
    setUploadSuccess(false);
    setIsPhotoModalOpen(true);
  };

  const openEditPhotoModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setUploadSuccess(false);
    setIsPhotoModalOpen(true);
  };

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
        triggerNotification("success", "Photo ajoutée au Portfolio !");
        setNewPhoto({ title: "", src: "", category: "studio", aspectClass: "aspect-[3/4]", alt: "" });
        setIsPhotoModalOpen(false);
        fetchLatestData();
      } else {
        triggerNotification("error", res.message || "Erreur d'ajout");
      }
    });
  };

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
        setIsPhotoModalOpen(false);
        fetchLatestData();
      } else {
        triggerNotification("error", res.message || "Erreur lors de la mise à jour");
      }
    });
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm("Supprimer cette photo du portfolio ?")) return;
    startTransition(async () => {
      const res = await deletePortfolioItem(id);
      if (res.success) {
        setPortfolio(prev => prev.filter(p => p.id !== id));
        triggerNotification("success", "Photo supprimée !");
      } else {
        triggerNotification("error", res.message || "Erreur de suppression");
      }
    });
  };

  const filteredBookings = bookings.filter((b) => {
    const matchQuery =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.formula.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === "Tous" || b.status === statusFilter;
    return matchQuery && matchStatus;
  });

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 md:pb-12">

      {/* 1. HEADER ADMIN MOBILE & DESKTOP */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-28 sm:w-36 h-9 sm:h-10">
              <Image src="/logo.png" alt="BMW Photographe Admin" fill className="object-contain object-left" priority />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[--brand]/10 border border-[--brand]/20 rounded-full text-[11px] font-extrabold text-[--brand]">
              <Sparkles className="w-3.5 h-3.5" /> Administration Studio
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!pushEnabled ? (
              <button
                onClick={requestNotificationPermission}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold rounded-xl hover:bg-amber-100 transition-all shadow-sm"
                title="Activer les notifs"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span className="hidden sm:inline">Rappels</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-xl">
                <Bell className="w-3 h-3 text-emerald-600" /> Notifs On
              </span>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed top-20 sm:top-24 right-4 sm:right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-extrabold flex items-center gap-2 transition-all anim-rise ${notification.type === "success" ? "bg-slate-900 text-white border-slate-800" : "bg-red-900 text-white border-red-800"
          }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[--brand]" /> : <XCircle className="w-4 h-4 text-red-400" />}
          {notification.message}
        </div>
      )}

      {/* POPUP NOUVELLE RÉSERVATION TEMPS RÉEL */}
      {newBookingAlert && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 max-w-md animate-bounce">
          <div className="w-9 h-9 bg-[--brand] rounded-full flex items-center justify-center shrink-0 shadow-lg">
            <BellRing className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[--brand]">Nouveau client !</h4>
            <p className="text-xs font-extrabold truncate text-white">{newBookingAlert.name} — {newBookingAlert.formula}</p>
          </div>
          <button onClick={() => setNewBookingAlert(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">

        {/* NAVIGATION ONGLETS DESKTOP MULTI-PAGES */}
        <div className="hidden md:flex bg-slate-200/60 p-1.5 rounded-2xl gap-2 overflow-x-auto no-scrollbar">
          <Link
            href="/admin"
            className={`flex-1 py-3 px-5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "reservations" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <CalendarIcon className="w-4 h-4 text-[--brand]" />
            Réservations ({bookings.length})
          </Link>

          <Link
            href="/admin/agenda"
            className={`flex-1 py-3 px-5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "calendar" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <CalendarPlus className="w-4 h-4 text-[--brand]" />
            Agenda &amp; Planning
          </Link>

          <Link
            href="/admin/portfolio"
            className={`flex-1 py-3 px-5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "portfolio" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <ImageIcon className="w-4 h-4 text-[--brand]" />
            Portfolio ({portfolio.length})
          </Link>

          <Link
            href="/admin/tarifs"
            className={`flex-1 py-3 px-5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "prices" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Settings className="w-4 h-4 text-[--brand]" />
            Tarifs
          </Link>
        </div>

        {/* ── ONGLET 1 : RÉSIDERATIONS CRM & DASHBOARD CLIENT ── */}
        {activeTab === "reservations" && (
          <div className="space-y-6">
            {/* TABLEAU DE BORD KPI CLIENTS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[--brand]">Gestion Studio</p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Tableau de bord <span className="font-serif italic text-[--brand]">BMW Photo</span>
                  </h1>
                </div>
                <button
                  onClick={openAddBookingModal}
                  className="md:hidden bg-[--brand] text-white p-3 rounded-2xl shadow-lg hover:brightness-105 transition-all flex items-center gap-1 text-xs font-extrabold"
                >
                  <Plus className="w-4 h-4" /> Séance
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Réservations</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{totalBookingsCount}</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">En attente</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Confirmées</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">{confirmedCount}</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Chiffre d&apos;affaires</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {totalRevenue.toLocaleString("fr-FR")} <span className="text-xs font-bold text-slate-400">FCFA</span>
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={openAddBookingModal}
                  className="hidden md:flex bg-[--brand] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider items-center gap-2 hover:bg-slate-900 shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" /> Planifier une Séance
                </button>
                <div className="relative flex-1 sm:w-72 w-full">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Recherche client, tel, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(["Tous", "En attente", "Confirmé", "Annulé"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider rounded-xl border transition-all shrink-0 ${statusFilter === status
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* VUE CARTE MOBILE POUR LES RÉSERVATIONS */}
            <div className="md:hidden space-y-3">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">#{b.id}</span>
                        <h3 className="font-extrabold text-slate-900 text-base">{b.name}</h3>
                        <p className="text-xs font-semibold text-slate-500">{b.phone}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${b.status === "Confirmé"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : b.status === "En attente"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-extrabold tracking-wider text-[--brand]">{b.location}</span>
                        {b.date && (
                          <span className="text-[10px] font-extrabold text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[--brand]" /> {b.date} {b.time ? `à ${b.time}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-900">{b.formula}</p>
                    </div>

                    {/* BOUTONS ACTIONS RAPIDES IPHONE */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <a
                        href={getGoogleCalendarUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        title="Ajouter à Google Calendar"
                        className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <CalendarPlus className="w-4 h-4 text-[--brand]" /> Ajouter à Google Calendar
                      </a>

                      <a
                        href={getWhatsAppReminderUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 bg-emerald-600 text-white text-[11px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" /> Rappel WhatsApp
                      </a>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      {b.status !== "Confirmé" && (
                        <button
                          onClick={() => handleStatusChange(b.id, "Confirmé")}
                          disabled={isPending}
                          className="p-2 bg-emerald-500 text-white rounded-xl"
                          title="Confirmer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditBookingModal(b)}
                        className="p-2 bg-slate-100 text-slate-700 rounded-xl"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        disabled={isPending}
                        className="p-2 text-red-500 bg-red-50 rounded-xl"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs">
                  Aucune réservation.
                </div>
              )}
            </div>

            {/* VUE TABLEUR DESKTOP */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Formule &amp; Lieu</th>
                      <th className="px-6 py-4">Séance Prévue</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Calendrier &amp; WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 space-y-1">
                            <div className="font-extrabold text-slate-900 text-sm">
                              {booking.name} <span className="text-[11px] text-slate-400 font-bold">#{booking.id}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-bold">{booking.phone}</div>
                          </td>

                          <td className="px-6 py-4 space-y-1.5">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] uppercase font-extrabold tracking-wider rounded-md border ${booking.location === "Studio"
                                ? "bg-[--brand]/10 text-[--brand] border-[--brand]/20"
                                : booking.location === "Mariage"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                              {booking.location}
                            </span>
                            <div className="text-slate-800 font-extrabold text-xs truncate max-w-[200px]" title={booking.formula}>
                              {booking.formula}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {booking.date ? (
                              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[--brand]" />
                                {new Date(booking.date).toLocaleDateString("fr-FR")} à {booking.time || "15:00"}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Non spécifiée</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${booking.status === "Confirmé"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : booking.status === "En attente"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${booking.status === "Confirmé" ? "bg-emerald-500" : booking.status === "En attente" ? "bg-amber-500" : "bg-slate-400"
                                }`}></span>
                              {booking.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getGoogleCalendarUrl(booking)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-slate-900 text-white hover:bg-[--brand] rounded-xl transition-colors text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                                title="Ajouter à Google Calendar"
                              >
                                <CalendarPlus className="w-3.5 h-3.5 text-[--brand]" /> Google Calendar
                              </a>

                              <a
                                href={getWhatsAppReminderUrl(booking)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors text-xs font-extrabold flex items-center gap-1.5"
                                title="Envoyer rappel WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" /> Rappel
                              </a>

                              <button
                                onClick={() => openEditBookingModal(booking)}
                                className="p-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={isPending}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
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

        {/* ── ONGLET 2 : AGENDA VISUEL INTERACTIF ── */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Planning Studio</span>
                <h3 className="text-xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                  <CalendarIcon className="w-5 h-5 text-[--brand]" /> Agenda des Séances Photo
                </h3>
                <p className="text-xs text-slate-400 font-semibold">Visualisez votre calendrier mensuel ou basculez en vue chronologique.</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={openAddBookingModal}
                  className="w-full md:w-auto bg-[--brand] text-white px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Planifier un Rendez-vous
                </button>
              </div>
            </div>

            {/* Barre de navigation du mois & sélecteur de mode */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Controls de mois */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAgendaDate(new Date(agendaDate.getFullYear(), agendaDate.getMonth() - 1, 1))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  title="Mois précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h4 className="text-base font-extrabold text-slate-900 capitalize min-w-[140px] text-center">
                  {agendaDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </h4>

                <button
                  onClick={() => setAgendaDate(new Date(agendaDate.getFullYear(), agendaDate.getMonth() + 1, 1))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  title="Mois suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAgendaDate(new Date())}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-colors"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* Mode d'affichage Grid / List */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setAgendaView("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${agendaView === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <Grid className="w-3.5 h-3.5" /> Grille Mensuelle
                </button>
                <button
                  onClick={() => setAgendaView("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${agendaView === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <List className="w-3.5 h-3.5" /> Vue Liste ({bookings.length})
                </button>
              </div>
            </div>

            {/* VUE GRILLE MENSUELLE */}
            {agendaView === "grid" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
                {/* En-tête des jours de la semaine */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                {/* Grille des jours */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {(() => {
                    const year = agendaDate.getFullYear();
                    const month = agendaDate.getMonth();
                    const firstDay = new Date(year, month, 1);
                    let startDayIndex = firstDay.getDay() - 1;
                    if (startDayIndex === -1) startDayIndex = 6;
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    const cells = [];

                    // Case vides du début
                    for (let i = 0; i < startDayIndex; i++) {
                      cells.push(<div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[110px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-100"></div>);
                    }

                    // Jours du mois
                    const todayStr = new Date().toISOString().slice(0, 10);

                    for (let d = 1; d <= daysInMonth; d++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const isToday = dateStr === todayStr;

                      // Filtrer les réservations de cette date
                      const dayBookings = bookings.filter((b) => b.date === dateStr);

                      cells.push(
                        <div
                          key={`day-${d}`}
                          onClick={() => {
                            setBookingForm({ name: "", phone: "", location: "Studio", formula: "Studio — 5 photos", status: "Confirmé", date: dateStr, time: "15:00" });
                            setIsBookingModalOpen(true);
                          }}
                          className={`min-h-[80px] sm:min-h-[110px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:border-[--brand] hover:shadow-sm ${isToday ? "bg-amber-50/60 border-[--brand]" : "bg-white border-slate-200"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${isToday ? "bg-[--brand] text-white" : "text-slate-700 group-hover:bg-slate-100"
                              }`}>
                              {d}
                            </span>
                            {dayBookings.length > 0 && (
                              <span className="bg-slate-900 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {dayBookings.length} RDV
                              </span>
                            )}
                          </div>

                          {/* Liste des séances du jour */}
                          <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px]">
                            {dayBookings.map((b) => (
                              <div
                                key={b.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditBookingModal(b);
                                }}
                                className={`px-1.5 py-1 rounded-lg text-[9px] font-extrabold truncate border ${b.status === "Confirmé"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : b.status === "En attente"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                title={`${b.name} (${b.time || "15:00"}) — ${b.formula}`}
                              >
                                {b.time || "15:00"} {b.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return cells;
                  })()}
                </div>
              </div>
            )}

            {/* VUE LISTE / CHRONOLOGIQUE */}
            {agendaView === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 hover:border-[--brand] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">#{b.id}</span>
                        <h4 className="text-base font-extrabold text-slate-900">{b.name}</h4>
                        <p className="text-xs font-semibold text-slate-500">{b.phone}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${b.status === "Confirmé"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : b.status === "En attente"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 font-extrabold">
                        <span className="flex items-center gap-1 text-[--brand]">
                          <Clock className="w-3.5 h-3.5" />
                          {b.date ? `${new Date(b.date).toLocaleDateString("fr-FR")} à ${b.time || "15:00"}` : "Date à fixer"}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">{b.location}</span>
                      </div>
                      <p className="font-extrabold text-slate-900 truncate">{b.formula}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <a
                        href={getGoogleCalendarUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        <CalendarPlus className="w-4 h-4 text-[--brand]" /> Ajouter à Google Calendar
                      </a>

                      <a
                        href={getWhatsAppReminderUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" /> Rappel WhatsApp Client
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET 3 : PORTFOLIO CLOUDINARY ── */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[--brand]" /> Portfolio ({portfolio.length})
                </h3>
                <p className="text-xs text-slate-500 font-semibold">Gérez et organisez les photographies de votre galerie professionnelle.</p>
              </div>

              <button
                onClick={openAddPhotoModal}
                className="bg-[--brand] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-900 shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Ajouter une photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm group relative flex flex-col justify-between">
                  <div>
                    <div className={`relative w-full ${item.aspectClass} bg-slate-100 rounded-xl overflow-hidden`}>
                      <Image src={item.src} alt={item.alt || item.title} fill className="object-cover" />
                      <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-extrabold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">ID #{item.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditPhotoModal(item)}
                        className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                        title="Modifier l'image"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
        )}

        {/* ── ONGLET 4 : GRILLE TARIFAIRE ── */}
        {activeTab === "prices" && (
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Tarifs</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Grille Tarifaire du Studio</h3>
            </div>

            <form onSubmit={handleUpdatePrices} className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-[--brand] tracking-wider border-b border-slate-100 pb-2">
                  En Studio
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "studio_5" as const, label: "5 photos" },
                    { key: "studio_7" as const, label: "7 photos" },
                    { key: "studio_10" as const, label: "10 photos" },
                    { key: "studio_15" as const, label: "15 photos" },
                    { key: "studio_20" as const, label: "20 photos" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-extrabold text-slate-600 mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={settings[key] === 0 ? "" : (settings[key] ?? "")}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, [key]: val === "" ? 0 : parseInt(val, 10) || 0 }));
                          }}
                          className="w-full pr-14 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none transition-colors"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-extrabold text-slate-400 uppercase">FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-blue-600 tracking-wider border-b border-slate-100 pb-2">
                  En Extérieur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "exterieur_5" as const, label: "5 photos" },
                    { key: "exterieur_10" as const, label: "10 photos" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-extrabold text-slate-600 mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={settings[key] === 0 ? "" : (settings[key] ?? "")}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, [key]: val === "" ? 0 : parseInt(val, 10) || 0 }));
                          }}
                          className="w-full pr-14 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none transition-colors"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-extrabold text-slate-400 uppercase">FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-purple-600 tracking-wider border-b border-slate-100 pb-2">
                  Mariage &amp; Baptême
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "ceremonie_80" as const, label: "80 photos" },
                    { key: "ceremonie_100" as const, label: "100 photos" },
                    { key: "ceremonie_120" as const, label: "120 photos" },
                    { key: "ceremonie_tak_diaka" as const, label: "Pack Tak Diaka" },
                    { key: "option_video" as const, label: "Option Vidéo" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-extrabold text-slate-600 mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={settings[key] === 0 ? "" : (settings[key] ?? "")}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, [key]: val === "" ? 0 : parseInt(val, 10) || 0 }));
                          }}
                          className="w-full pr-14 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none transition-colors"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-extrabold text-slate-400 uppercase">FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-slate-900 text-white hover:bg-[--brand] transition-all rounded-xl text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                Enregistrer la grille tarifaire
              </button>
            </form>

            {/* ════════ GESTIONNAIRE D'ÉVÉNEMENTS & PROMOS DYNAMIQUES ════════ */}
            <div className="mt-12 pt-8 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Événements &amp; Saisons</span>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                    <Tag className="w-5 h-5 text-[--brand]" /> Promo Événementielle (ex: Gamou, Tabaski, Korité...)
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Configurez vos offres de saison (Gamou, Tabaski, Magal) et ajustez vos tarifs directement pour l'ensemble du studio.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promo.enabled}
                    onChange={(e) => handleTogglePromo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[--brand]"></div>
                  <span className="ml-2 text-xs font-extrabold text-slate-700">
                    {promo.enabled ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>

              <form onSubmit={handleSavePromo} className="space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Nom de l'Événement *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Promo Spéciale Gamou"
                      value={promo.eventName}
                      onChange={(e) => setPromo({ ...promo, eventName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Badge d'Affichage *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: PROMO GAMOU, PROMO TABASKI"
                      value={promo.badgeText}
                      onChange={(e) => setPromo({ ...promo, badgeText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Sous-titre / Message Bannière</label>
                  <input
                    type="text"
                    value={promo.subtitle}
                    onChange={(e) => setPromo({ ...promo, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none"
                    placeholder="Message d'accroche pour les clients..."
                  />
                </div>

                {/* Saisie des tarifs promo pour chaque formule */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs uppercase font-extrabold text-[--brand] tracking-wider">
                    Tarifs réduits pendant l'événement (en FCFA)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { key: "studio_5" as const, label: `Studio 5 photos (Normal: ${(settings.studio_5 || 10000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "studio_7" as const, label: `Studio 7 photos (Normal: ${(settings.studio_7 || 15000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "studio_10" as const, label: `Studio 10 photos (Normal: ${(settings.studio_10 || 20000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "studio_15" as const, label: `Studio 15 photos (Normal: ${(settings.studio_15 || 30000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "studio_20" as const, label: `Studio 20 photos (Normal: ${(settings.studio_20 || 50000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "exterieur_5" as const, label: `Extérieur 5 photos (Normal: ${(settings.exterieur_5 || 25000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "exterieur_10" as const, label: `Extérieur 10 photos (Normal: ${(settings.exterieur_10 || 40000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "ceremonie_80" as const, label: `Mariage 80 photos (Normal: ${(settings.ceremonie_80 || 110000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "ceremonie_100" as const, label: `Mariage 100 photos (Normal: ${(settings.ceremonie_100 || 125000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "ceremonie_120" as const, label: `Mariage 120 photos (Normal: ${(settings.ceremonie_120 || 150000).toLocaleString("fr-FR")} FCFA)` },
                      { key: "ceremonie_tak_diaka" as const, label: `Tak Diaka (Normal: ${(settings.ceremonie_tak_diaka || 85000).toLocaleString("fr-FR")} FCFA)` },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">{label}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={(promo.promoPrices[key] ?? settings[key]) === 0 ? "" : (promo.promoPrices[key] ?? settings[key] ?? "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              const numVal = val === "" ? 0 : parseInt(val, 10) || 0;
                              setPromo(prev => ({
                                ...prev,
                                promoPrices: { ...prev.promoPrices, [key]: numVal }
                              }));
                            }}
                            className="w-full pr-12 pl-3 py-2 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none"
                          />
                          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[9px] font-extrabold text-slate-400">FCFA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 bg-[--brand] text-white hover:bg-slate-900 transition-all rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Tag className="w-4 h-4" /> Enregistrer la Promo Événementielle
                </button>
              </form>

            </div>
          </div>
        )}

        {/* MODAL RÉSERVATION AVEC DATE & HEURE */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 anim-rise">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4 text-[--brand]" />
                  {editingBookingId ? "Modifier la Séance Photo" : "Planifier une Séance Photo"}
                </h3>
                <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveBooking} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Nom du client *</label>
                  <input type="text" required value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Téléphone WhatsApp *</label>
                  <input type="tel" required value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[--brand]/5 p-3 rounded-2xl border border-[--brand]/20">
                  <div>
                    <label className="block text-xs font-extrabold text-[--brand] mb-1">Date de Séance</label>
                    <input type="date" value={bookingForm.date || ""} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[--brand] mb-1">Heure de Séance</label>
                    <input type="time" value={bookingForm.time || "15:00"} onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Lieu *</label>
                    <select value={bookingForm.location} onChange={e => setBookingForm({ ...bookingForm, location: e.target.value as any })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none cursor-pointer">
                      <option value="Studio">Studio</option>
                      <option value="Domicile">Domicile / Extérieur</option>
                      <option value="Mariage">Mariage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Statut *</label>
                    <select value={bookingForm.status} onChange={e => setBookingForm({ ...bookingForm, status: e.target.value as any })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none cursor-pointer">
                      <option value="En attente">En attente</option>
                      <option value="Confirmé">Confirmé</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Formule choisie *</label>
                  <input type="text" required placeholder="Ex: 5 photos - 10 000 FCFA" value={bookingForm.formula} onChange={e => setBookingForm({ ...bookingForm, formula: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-extrabold rounded-xl text-xs hover:bg-slate-200 transition-colors">Annuler</button>
                  <button type="submit" disabled={isPending} className="flex-1 py-3 bg-[--brand] text-white font-extrabold rounded-xl text-xs shadow-md hover:bg-slate-900 transition-all disabled:opacity-50">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PORTFOLIO PHOTO */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 anim-rise">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[--brand]" />
                  {editingItem ? "Modifier l'image Portfolio" : "Ajouter une nouvelle image"}
                </h3>
                <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={editingItem ? handleSaveEditPhoto : handleAddPhoto} className="p-6 space-y-4">
                {/* APERÇU DE L'IMAGE ET BOUTON DE REMPLACEMENT */}
                {editingItem || newPhoto.src ? (
                  <div className="relative w-full h-52 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
                    <Image
                      src={editingItem ? editingItem.src : newPhoto.src}
                      alt="Aperçu photo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <label className="bg-white text-slate-900 px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-[--brand] hover:text-white transition-all">
                        <Upload className="w-4 h-4" />
                        {uploading ? "Transfert en cours..." : "Changer l'image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, !!editingItem)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Photo à publier *</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[--brand] transition-colors cursor-pointer bg-slate-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, !!editingItem)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-[--brand] mx-auto mb-1" />
                      <p className="text-xs font-extrabold text-slate-700">
                        {uploading ? "Chargement de la photo..." : "Sélectionner une photo depuis vos fichiers"}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Titre de la photo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Élégance Studio Thiès"
                    value={editingItem ? editingItem.title : newPhoto.title}
                    onChange={(e) => {
                      if (editingItem) setEditingItem({ ...editingItem, title: e.target.value });
                      else setNewPhoto({ ...newPhoto, title: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none transition-colors"
                  />
                </div>


                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Catégorie</label>
                    <select
                      value={editingItem ? editingItem.category : newPhoto.category}
                      onChange={(e) => {
                        const val = e.target.value as "studio" | "exterior";
                        if (editingItem) setEditingItem({ ...editingItem, category: val });
                        else setNewPhoto({ ...newPhoto, category: val });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none cursor-pointer"
                    >
                      <option value="studio">Studio</option>
                      <option value="exterior">Extérieur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Format Ratio</label>
                    <select
                      value={editingItem ? editingItem.aspectClass : newPhoto.aspectClass}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingItem) setEditingItem({ ...editingItem, aspectClass: val });
                        else setNewPhoto({ ...newPhoto, aspectClass: val });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none cursor-pointer"
                    >
                      <option value="aspect-[3/4]">Vertical 3:4</option>
                      <option value="aspect-[4/5]">Vertical 4:5</option>
                      <option value="aspect-[2/3]">Vertical 2:3</option>
                      <option value="aspect-square">Carré 1:1</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-extrabold rounded-xl text-xs hover:bg-slate-200 transition-colors">Annuler</button>
                  <button type="submit" disabled={isPending || uploading} className="flex-1 py-3 bg-[--brand] text-white font-extrabold rounded-xl text-xs shadow-md hover:bg-slate-900 transition-all disabled:opacity-50">
                    {editingItem ? "Enregistrer Modifications" : "Ajouter au Portfolio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ════════ DOCK NAVIGATION FIXE MOBILE MULTI-PAGES ════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2.5 flex items-center justify-around text-white shadow-2xl">
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === "reservations" ? "text-[--brand] font-extrabold scale-105" : "text-slate-400 hover:text-white font-semibold"
            }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px]">Client</span>
        </Link>

        <Link
          href="/admin/agenda"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === "calendar" ? "text-[--brand] font-extrabold scale-105" : "text-slate-400 hover:text-white font-semibold"
            }`}
        >
          <CalendarPlus className="w-5 h-5" />
          <span className="text-[10px]">Agenda</span>
        </Link>

        <Link
          href="/admin/portfolio"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === "portfolio" ? "text-[--brand] font-extrabold scale-105" : "text-slate-400 hover:text-white font-semibold"
            }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[10px]">Photos</span>
        </Link>

        <Link
          href="/admin/tarifs"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === "prices" ? "text-[--brand] font-extrabold scale-105" : "text-slate-400 hover:text-white font-semibold"
            }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Tarifs</span>
        </Link>
      </nav>

    </div>
  );
}
