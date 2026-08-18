"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin, updatePricesSettings, updateBookingStatus, deleteBooking, addBookingAdmin, updateBookingFull, addPortfolioItem, deletePortfolioItem, updatePortfolioItem, updatePromoOffer } from "../app/actions";
import { PricesSettings, PricePackage, Booking, PortfolioItem, EventPromo } from "../lib/db";
import { TIME_SLOTS } from "../lib/schema";
import { DEFAULT_PROMO } from "../lib/defaults";
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
  Star,
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
  const [promo, setPromo] = useState<EventPromo>(initialPromo || DEFAULT_PROMO);

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
  // N'affiche que les réservations sans date/heure — utile pour retrouver les
  // réservations créées avant l'ajout du créneau horaire, à compléter à la main.
  const [missingDateOnly, setMissingDateOnly] = useState(false);

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

  // POLLING EN TEMPS RÉEL — garde la dernière valeur de l'onglet actif sans
  // provoquer un nouvel abonnement de l'intervalle à chaque changement d'onglet.
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

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
      // Le portfolio n'a pas d'état "brouillon" attaché aux cartes affichées :
      // on peut toujours le resynchroniser sans risque d'écraser une saisie en cours.
      if (data.portfolio) setPortfolio(data.portfolio);

      // Les tarifs et la promo sont liés à des formulaires éditables : on ne les
      // resynchronise que si l'admin n'est pas en train de les modifier, pour ne
      // jamais écraser une saisie en cours sur l'onglet "Tarifs".
      if (activeTabRef.current !== "prices") {
        if (data.settings) setSettings(data.settings);
        if (data.promo) setPromo(data.promo);
      }
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

  type PriceCategory = "studio" | "exterieur" | "ceremonie";

  const updatePackage = (category: PriceCategory, id: string, patch: Partial<PricePackage>) => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category].map(p => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const addPackage = (category: PriceCategory) => {
    const newPkg: PricePackage = {
      id: `${category}_${Date.now().toString(36)}`,
      label: "Nouvelle formule",
      price: 0,
    };
    setSettings(prev => ({ ...prev, [category]: [...prev[category], newPkg] }));
  };

  const removePackage = (category: PriceCategory, id: string) => {
    setSettings(prev => ({ ...prev, [category]: prev[category].filter(p => p.id !== id) }));
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

  // Tarif promo par formule : un champ laissé vide retire la clé de promoPrices
  // (pas de promo sur cet article) plutôt que d'y stocker le prix normal ou 0.
  const setPromoPackagePrice = (id: string, raw: string) => {
    setPromo(prev => {
      if (raw === "") {
        const rest = { ...prev.promoPrices };
        delete rest[id];
        return { ...prev, promoPrices: rest };
      }
      const numVal = parseInt(raw, 10);
      return { ...prev, promoPrices: { ...prev.promoPrices, [id]: Number.isNaN(numVal) ? 0 : numVal } };
    });
  };

  const setPromoVideoPrice = (raw: string) => {
    setPromo(prev => ({ ...prev, promoOptionVideoPrice: raw === "" ? undefined : (parseInt(raw, 10) || 0) }));
  };

  const clearAllPromoPrices = () => {
    setPromo(prev => ({ ...prev, promoPrices: {}, promoOptionVideoPrice: undefined }));
  };

  const PROMO_CATEGORIES: { category: PriceCategory; title: string; color: string }[] = [
    { category: "studio", title: "En Studio", color: "text-[--brand]" },
    { category: "exterieur", title: "En Extérieur", color: "text-blue-600" },
    { category: "ceremonie", title: "Mariage & Baptême", color: "text-purple-600" },
  ];

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

  // Créneaux déjà pris à la date sélectionnée (hors annulations et hors la
  // réservation en cours d'édition, pour ne pas se griser soi-même).
  const bookedSlotsForForm = bookings
    .filter((b) => b.date === bookingForm.date && b.status !== "Annulé" && b.time && b.id !== editingBookingId)
    .map((b) => b.time!);

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
          // Évite qu'un poll dans les 4s suivantes ne déclenche une fausse
          // alerte "Nouveau client" pour la réservation qu'on vient de créer soi-même.
          lastBookingCountRef.current += 1;
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

  const handleToggleFeatured = async (item: PortfolioItem) => {
    const nextFeatured = !item.featured;
    setPortfolio(prev => prev.map(p => p.id === item.id ? { ...p, featured: nextFeatured } : p));
    startTransition(async () => {
      const res = await updatePortfolioItem(item.id, { featured: nextFeatured });
      if (res.success) {
        triggerNotification("success", nextFeatured ? "Photo mise en avant dans le Hero !" : "Photo retirée du Hero.");
      } else {
        setPortfolio(prev => prev.map(p => p.id === item.id ? { ...p, featured: item.featured } : p));
        triggerNotification("error", res.message || "Erreur");
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
    const matchDate = !missingDateOnly || !b.date;
    return matchQuery && matchStatus && matchDate;
  });

  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "En attente").length;
  const confirmedCount = bookings.filter(b => b.status === "Confirmé").length;
  // Anciennes réservations créées avant l'ajout du choix de date/heure : cette
  // info n'a jamais été enregistrée et ne peut pas être retrouvée automatiquement,
  // il faut la compléter à la main (ex: en consultant la conversation WhatsApp).
  const missingDateCount = bookings.filter(b => !b.date).length;
  const totalRevenue = bookings
    .filter(b => b.status === "Confirmé")
    .reduce((acc, b) => {
      const match = b.formula.match(/([0-9\s]+)\s*FCFA/i);
      if (match) {
        const val = parseInt(match[1].replace(/\s+/g, "")) || 0;
        return acc + val;
      }
      // Formule libre sans prix détectable (ex: réservation manuelle) : on ne
      // devine pas un montant, pour ne pas fausser silencieusement le total.
      return acc;
    }, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 md:pb-12">

      {/* 1. HEADER ADMIN MOBILE & DESKTOP */}
      {/* 1. HEADER ADMIN MOBILE & DESKTOP (ULTRA LUXURY DESIGN) */}
      <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-28 sm:w-36 h-9 sm:h-10 brightness-0 invert opacity-95">
              <Image src="/logo.png" alt="BMW Photographe Admin" fill className="object-contain object-left" priority />
            </div>
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-extrabold text-amber-400 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Studio Live
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={requestNotificationPermission}
              className="relative p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-all cursor-pointer group active:scale-95"
              title={pushEnabled ? "Notifications en direct activées" : "Activer les notifications instantanées"}
            >
              <Bell className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors shrink-0" />
              {pushEnabled ? (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
              ) : (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-slate-950 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400 text-slate-300 text-[11px] font-extrabold rounded-full transition-all group cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 shrink-0" />
              <span className="hidden sm:inline">Quitter</span>
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

            {missingDateCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-800">
                    {missingDateCount} réservation{missingDateCount > 1 ? "s" : ""} sans date/heure — créée{missingDateCount > 1 ? "s" : ""} avant l&apos;ajout du choix de créneau, cette info n&apos;a jamais été enregistrée. Retrouvez-la via WhatsApp puis complétez-la avec &quot;Modifier&quot;.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMissingDateOnly(v => !v)}
                  className={`shrink-0 self-start sm:self-auto px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-xl border transition-all ${missingDateOnly
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
                    }`}
                >
                  {missingDateOnly ? "Voir toutes les réservations" : "Voir uniquement celles-ci"}
                </button>
              </div>
            )}

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
                        className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-w-0"
                      >
                        <CalendarPlus className="w-4 h-4 text-[--brand] shrink-0" />
                        <span className="truncate">Google Calendar</span>
                      </a>

                      <a
                        href={getWhatsAppReminderUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-2 bg-emerald-600 text-white text-[11px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-w-0"
                      >
                        <Send className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Rappel WhatsApp</span>
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
            <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Planning Studio</span>
                <h3 className="text-base sm:text-xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                  <CalendarIcon className="w-5 h-5 text-[--brand] shrink-0" /> Agenda des Séances Photo
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">Visualisez votre calendrier mensuel ou vue chronologique.</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={openAddBookingModal}
                  className="w-full md:w-auto bg-[--brand] text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 transition-all shadow-md active:scale-95 min-w-0"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="truncate">Planifier un Rendez-vous</span>
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
                  Aujourd’hui
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

                          {/* Grille des créneaux du jour — vert = libre, coloré = pris */}
                          <div className="grid grid-cols-3 gap-[3px] mt-1">
                            {TIME_SLOTS.map((t) => {
                              const slotBooking = dayBookings.find((b) => b.time === t);
                              return (
                                <div
                                  key={t}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (slotBooking) {
                                      openEditBookingModal(slotBooking);
                                    } else {
                                      setBookingForm({ name: "", phone: "", location: "Studio", formula: "Studio — 5 photos", status: "Confirmé", date: dateStr, time: t });
                                      setIsBookingModalOpen(true);
                                    }
                                  }}
                                  title={slotBooking ? `${t} — ${slotBooking.name} (${slotBooking.status})` : `${t} — libre`}
                                  className={`h-3.5 sm:h-4 rounded-[3px] border text-[6px] sm:text-[7px] font-extrabold flex items-center justify-center leading-none cursor-pointer ${slotBooking
                                      ? slotBooking.status === "Confirmé"
                                        ? "bg-emerald-500 border-emerald-600 text-white"
                                        : slotBooking.status === "En attente"
                                          ? "bg-amber-400 border-amber-500 text-white"
                                          : "bg-slate-300 border-slate-400 text-white"
                                      : "bg-slate-50 border-slate-200 text-slate-300 hover:border-[--brand] hover:bg-[--brand]/5"
                                    }`}
                                >
                                  {slotBooking ? t.slice(0, 2) : ""}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return cells;
                  })()}
                </div>

                {/* Légende de la grille de créneaux */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-slate-50 border border-slate-200"></span> Créneau libre</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-amber-400 border border-amber-500"></span> En attente</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500 border border-emerald-600"></span> Confirmé</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-slate-300 border border-slate-400"></span> Annulé</span>
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
                        className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 min-w-0"
                      >
                        <CalendarPlus className="w-4 h-4 text-[--brand] shrink-0" />
                        <span className="truncate">Google Calendar</span>
                      </a>

                      <a
                        href={getWhatsAppReminderUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 min-w-0"
                      >
                        <Send className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Rappel WhatsApp Client</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[--brand] shrink-0" /> Portfolio ({portfolio.length})
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                  Gérez et organisez votre galerie photo. Cliquez sur <Star className="w-3 h-3 inline text-[--brand] fill-current" /> pour choisir les photos du diaporama Hero de la page d’accueil (5 max affichées).
                </p>
              </div>

              <button
                onClick={openAddPhotoModal}
                className="w-full sm:w-auto bg-[--brand] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-900 shadow-md transition-all shrink-0 min-w-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Ajouter une photo</span>
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
                      {item.featured && (
                        <span className="absolute top-2 right-2 bg-[--brand] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> Hero
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs font-extrabold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">ID #{item.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-2 rounded-xl transition-colors ${item.featured ? "text-[--brand] bg-[--brand]/10 hover:bg-[--brand]/20" : "text-slate-400 hover:text-[--brand] hover:bg-[--brand]/10"}`}
                        title={item.featured ? "Retirer du Hero de la page d'accueil" : "Mettre en avant dans le Hero de la page d'accueil"}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-current" : ""}`} />
                      </button>
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
          <div className="bg-white border border-slate-200 p-4 sm:p-8 rounded-2xl shadow-sm w-full max-w-6xl mx-auto">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Tarifs &amp; Gestion</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Grille Tarifaire du Studio</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Modifiez directement vos tarifs ci-dessous. Les changements s’appliquent instantanément sur le site.</p>
            </div>

            <form onSubmit={handleUpdatePrices} className="space-y-8">
              {([
                { category: "studio" as const, title: "En Studio", color: "text-[--brand]" },
                { category: "exterieur" as const, title: "En Extérieur", color: "text-blue-600" },
                { category: "ceremonie" as const, title: "Mariage & Baptême", color: "text-purple-600" },
              ]).map(({ category, title, color }) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className={`text-xs uppercase font-extrabold tracking-wider ${color}`}>
                      {title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => addPackage(category)}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-[--brand] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter une formule
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {settings[category].map((pkg) => (
                      <div key={pkg.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => removePackage(category, pkg.id)}
                          className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-full flex items-center justify-center shadow-sm transition-colors"
                          title="Supprimer cette formule"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => updatePackage(category, pkg.id, { label: e.target.value })}
                          placeholder="Libellé (ex: 5 photos)"
                          className="w-full mb-1.5 px-0.5 py-0.5 bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-[--brand] text-xs font-extrabold text-slate-600 focus:outline-none transition-colors"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={pkg.price === 0 ? "" : pkg.price}
                            onChange={(e) => {
                              const val = e.target.value;
                              updatePackage(category, pkg.id, { price: val === "" ? 0 : parseInt(val, 10) || 0 });
                            }}
                            className="w-full pr-14 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none transition-colors"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-extrabold text-slate-400 uppercase">FCFA</span>
                        </div>
                      </div>
                    ))}
                    {settings[category].length === 0 && (
                      <p className="text-xs text-slate-400 font-semibold italic col-span-full">Aucune formule dans cette catégorie — ajoutez-en une.</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-amber-600 tracking-wider border-b border-slate-100 pb-2">
                  Option
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      value={settings.optionVideoLabel}
                      onChange={(e) => setSettings(prev => ({ ...prev, optionVideoLabel: e.target.value }))}
                      placeholder="Libellé (ex: Vidéo cinématique)"
                      className="w-full mb-1.5 px-0.5 py-0.5 bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-[--brand] text-xs font-extrabold text-slate-600 focus:outline-none transition-colors"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.optionVideoPrice === 0 ? "" : settings.optionVideoPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings(prev => ({ ...prev, optionVideoPrice: val === "" ? 0 : parseInt(val, 10) || 0 }));
                        }}
                        className="w-full pr-14 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none transition-colors"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-extrabold text-slate-400 uppercase">FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-4 bg-slate-900 text-white hover:bg-[--brand] transition-all rounded-xl text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-w-0"
              >
                <span className="truncate">Enregistrer la grille tarifaire</span>
              </button>
            </form>

            {/* ════════ GESTIONNAIRE D'ÉVÉNEMENTS & PROMOS DYNAMIQUES ════════ */}
            <div className="mt-12 pt-8 border-t border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Événements &amp; Saisons</span>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                    <Tag className="w-5 h-5 text-[--brand]" /> Promo Événementielle (ex: Gamou, Tabaski, Korité...)
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Configurez vos offres de saison et ajustez vos tarifs directement pour l’ensemble du studio.</p>
                </div>

                <label className="relative inline-flex items-center gap-2 cursor-pointer bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shrink-0 self-start sm:self-auto">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${promo.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="text-xs font-extrabold text-slate-700">
                    {promo.enabled ? "Offre active" : "Offre inactive"}
                  </span>
                  <input
                    type="checkbox"
                    checked={promo.enabled}
                    onChange={(e) => handleTogglePromo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[--brand]"></div>
                </label>
              </div>

              <form onSubmit={handleSavePromo} className="space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Nom de l’événement *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Spécial Gamou"
                      value={promo.eventName}
                      onChange={(e) => setPromo({ ...promo, eventName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Badge d’affichage *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: PROMO GAMOU"
                      value={promo.badgeText}
                      onChange={(e) => setPromo({ ...promo, badgeText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold uppercase focus:outline-none placeholder:normal-case"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">Sous-titre / message bannière</label>
                  <input
                    type="text"
                    value={promo.subtitle}
                    onChange={(e) => setPromo({ ...promo, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-bold focus:outline-none"
                    placeholder="Ex: Profitez de réductions exclusives sur vos séances photo !"
                  />
                </div>

                {/* Aperçu en direct de la bannière affichée sur le site */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Aperçu de la bannière</p>
                  {promo.eventName || promo.badgeText || promo.subtitle ? (
                    <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 rounded-xl px-4 py-2.5 overflow-hidden">
                      <p className="font-extrabold text-[11px] uppercase tracking-widest truncate">
                        ✨ {promo.badgeText && <strong>[{promo.badgeText}]</strong>} {promo.eventName} {promo.subtitle && `— ${promo.subtitle}`} ✨
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl px-4 py-2.5 border border-dashed border-slate-300 text-[11px] font-semibold text-slate-400">
                      Renseignez le nom de l’événement pour voir l’aperçu de la bannière ici.
                    </div>
                  )}
                </div>

                {/* Saisie des tarifs promo pour chaque formule */}
                <div className="space-y-5 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-[--brand] tracking-wider">
                        Tarifs réduits pendant l’événement
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        Laissez un champ vide pour garder le tarif normal sur cette formule.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllPromoPrices}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Effacer tous les tarifs promo
                    </button>
                  </div>

                  {PROMO_CATEGORIES.map(({ category, title, color }) => (
                    <div key={category} className="space-y-2.5">
                      <h5 className={`text-[10px] uppercase font-extrabold tracking-wider ${color}`}>{title}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {settings[category].map((pkg) => {
                          const promoVal = promo.promoPrices[pkg.id];
                          const hasDiscount = promoVal !== undefined && promoVal > 0 && promoVal < pkg.price;
                          const pct = hasDiscount ? Math.round((1 - promoVal / pkg.price) * 100) : 0;
                          return (
                            <div key={pkg.id} className={`p-3 rounded-xl border transition-colors ${hasDiscount ? "bg-[--brand]/5 border-[--brand]/30" : "bg-white border-slate-200"}`}>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <label className="text-[11px] font-extrabold text-slate-600 truncate">{pkg.label}</label>
                                {hasDiscount && (
                                  <span className="shrink-0 text-[9px] font-extrabold text-white bg-[--brand] px-1.5 py-0.5 rounded-full">-{pct}%</span>
                                )}
                              </div>
                              <p className="text-[10px] font-semibold text-slate-400 mb-1.5">Prix normal : {pkg.price.toLocaleString("fr-FR")} FCFA</p>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={promoVal ?? ""}
                                  onChange={(e) => setPromoPackagePrice(pkg.id, e.target.value)}
                                  placeholder={`${pkg.price.toLocaleString("fr-FR")} FCFA`}
                                  className="w-full pr-12 pl-3 py-2 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none"
                                />
                                <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[9px] font-extrabold text-slate-400">FCFA</span>
                              </div>
                            </div>
                          );
                        })}
                        {settings[category].length === 0 && (
                          <p className="text-xs text-slate-400 font-semibold italic col-span-full">Aucune formule dans cette catégorie.</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2.5">
                    <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-amber-600">Option</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(() => {
                        const promoVideoVal = promo.promoOptionVideoPrice;
                        const hasDiscount = promoVideoVal !== undefined && promoVideoVal > 0 && promoVideoVal < settings.optionVideoPrice;
                        const pct = hasDiscount ? Math.round((1 - promoVideoVal / settings.optionVideoPrice) * 100) : 0;
                        return (
                          <div className={`p-3 rounded-xl border transition-colors ${hasDiscount ? "bg-[--brand]/5 border-[--brand]/30" : "bg-white border-slate-200"}`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <label className="text-[11px] font-extrabold text-slate-600 truncate">{settings.optionVideoLabel}</label>
                              {hasDiscount && (
                                <span className="shrink-0 text-[9px] font-extrabold text-white bg-[--brand] px-1.5 py-0.5 rounded-full">-{pct}%</span>
                              )}
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 mb-1.5">Prix normal : {settings.optionVideoPrice.toLocaleString("fr-FR")} FCFA</p>
                            <div className="relative">
                              <input
                                type="number"
                                value={promoVideoVal ?? ""}
                                onChange={(e) => setPromoVideoPrice(e.target.value)}
                                placeholder={`${settings.optionVideoPrice.toLocaleString("fr-FR")} FCFA`}
                                className="w-full pr-12 pl-3 py-2 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none"
                              />
                              <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[9px] font-extrabold text-slate-400">FCFA</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 px-4 bg-[--brand] text-white hover:bg-slate-900 transition-all rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-w-0"
                >
                  <Tag className="w-4 h-4 shrink-0" />
                  <span className="truncate">Enregistrer l’offre promo</span>
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

                <div className="space-y-3 bg-[--brand]/5 p-3 rounded-2xl border border-[--brand]/20">
                  <div>
                    <label className="block text-xs font-extrabold text-[--brand] mb-1">Date de Séance</label>
                    <input type="date" value={bookingForm.date || ""} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[--brand] rounded-xl text-xs font-extrabold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[--brand] mb-1">Heure de Séance</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TIME_SLOTS.map((t) => {
                        const isTaken = bookedSlotsForForm.includes(t);
                        const isSelected = bookingForm.time === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={isTaken}
                            onClick={() => setBookingForm({ ...bookingForm, time: t })}
                            title={isTaken ? "Créneau déjà réservé" : undefined}
                            className={`py-2 rounded-lg text-[11px] font-extrabold border transition-all ${
                              isTaken
                                ? "bg-red-50 border-red-100 text-red-300 line-through cursor-not-allowed"
                                : isSelected
                                  ? "bg-[--brand] border-[--brand] text-white shadow-sm"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-[--brand]"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
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
