"use server";

import { bookingSchema, BookingInput } from "../lib/schema";
import { getDb, writeDb, Booking, PricesSettings, PortfolioItem, EventPromo } from "../lib/db";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  redirectUrl?: string;
  message?: string;
};

// ── RÉSERVATION CLIENT ──

// Créneaux déjà réservés (hors annulations) pour une date donnée — utilisé
// par le formulaire client pour ne pas proposer un horaire déjà pris.
export async function getBookedSlots(date: string): Promise<string[]> {
  if (!date) return [];
  const db = await getDb();
  return db.bookings
    .filter((b) => b.date === date && b.status !== "Annulé" && b.time)
    .map((b) => b.time!);
}

export async function submitBooking(data: BookingInput): Promise<ActionState> {
  const result = bookingSchema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const v = result.data;
  const db = await getDb();

  const isSlotTaken = db.bookings.some(
    (b) => b.date === v.date && b.time === v.time && b.status !== "Annulé"
  );
  if (isSlotTaken) {
    return { success: false, errors: { time: ["Ce créneau est déjà réservé, choisissez-en un autre."] } };
  }

  const newBooking: Booking = {
    id: Math.random().toString(36).substring(2, 7).toUpperCase(),
    ...v,
    status: "En attente",
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  await writeDb(db);

  const whatsappPhone = process.env.WHATSAPP_PHONE || "221762588808";
  const dateTxt = v.date
    ? ` le ${new Date(v.date).toLocaleDateString("fr-FR")}${v.time ? ` à ${v.time}` : ""}`
    : "";
  const message = `Bonjour, c'est ${v.name}.

Je souhaite réserver la formule : ${v.formula} (${v.location})${dateTxt}.
Mon téléphone : ${v.phone}.

Ci-joint le reçu de mon paiement d'acompte.`;

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, redirectUrl: whatsappUrl };
}

// ── AUTH ADMIN ──
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Anti brute-force basique : quelques tentatives par IP sur une fenêtre glissante.
// Best-effort seulement (compteur en mémoire, non partagé entre instances serverless),
// mais suffisant pour décourager un brute force naïf sur ce trafic modeste.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function loginAdmin(password: string): Promise<{ success: boolean; message?: string }> {
  if (!ADMIN_PASSWORD) {
    console.error("[loginAdmin] ADMIN_PASSWORD n'est pas configuré — accès admin refusé.");
    return { success: false, message: "Connexion admin indisponible (configuration manquante)." };
  }

  const ip = getClientIp();
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && entry.resetAt > now && entry.count >= LOGIN_MAX_ATTEMPTS) {
    return { success: false, message: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  if (password === ADMIN_PASSWORD) {
    loginAttempts.delete(ip);
    cookies().set("bmw_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return { success: true };
  }

  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }

  return { success: false, message: "Mot de passe incorrect" };
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  cookies().delete("bmw_admin_session");
  return { success: true };
}

export async function checkAdminAuth(): Promise<boolean> {
  const session = cookies().get("bmw_admin_session");
  return session?.value === "authenticated";
}

async function ensureAdminAuth() {
  if (!(await checkAdminAuth())) throw new Error("Non autorisé");
}

// ── TARIFS ──
export async function updatePricesSettings(settings: PricesSettings): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    db.settings = settings;
    await writeDb(db);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Tarifs mis à jour" };
  } catch (e: any) {
    return { success: false, message: e.message || "Erreur" };
  }
}

// ── RÉSERVATIONS (ADMIN) ──
export async function updateBookingStatus(id: string, status: Booking["status"]): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    const i = db.bookings.findIndex((b) => b.id === id);
    if (i !== -1) {
      db.bookings[i].status = status;
      await writeDb(db);
      revalidatePath("/admin");
      return { success: true, message: `Statut → ${status}` };
    }
    return { success: false, message: "Introuvable" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function addBookingAdmin(data: Omit<Booking, "id"|"createdAt">): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    const newId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newBooking: Booking = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.bookings.unshift(newBooking);
    await writeDb(db);
    revalidatePath("/admin");
    return { success: true, message: "Réservation ajoutée", id: newId };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updateBookingFull(id: string, data: Omit<Booking, "id"|"createdAt">): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    const i = db.bookings.findIndex((b) => b.id === id);
    if (i !== -1) {
      db.bookings[i] = { ...db.bookings[i], ...data };
      await writeDb(db);
      revalidatePath("/admin");
      return { success: true, message: "Réservation modifiée avec succès" };
    }
    return { success: false, message: "Introuvable" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteBooking(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    db.bookings = db.bookings.filter((b) => b.id !== id);
    await writeDb(db);
    revalidatePath("/admin");
    return { success: true, message: "Supprimé" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// ── PORTFOLIO (ADMIN) ──
export async function addPortfolioItem(item: Omit<PortfolioItem, "id">): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    const newId = db.portfolio.length > 0 ? Math.max(...db.portfolio.map((p) => p.id)) + 1 : 1;
    db.portfolio.unshift({ id: newId, ...item });
    await writeDb(db);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Photo ajoutée" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deletePortfolioItem(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    db.portfolio = db.portfolio.filter((p) => p.id !== id);
    await writeDb(db);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Photo retirée" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updatePortfolioItem(id: number, item: Partial<Omit<PortfolioItem, "id">>): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    const index = db.portfolio.findIndex((p) => p.id === id);
    if (index !== -1) {
      db.portfolio[index] = { ...db.portfolio[index], ...item };
      await writeDb(db);
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true, message: "Photo mise à jour" };
    }
    return { success: false, message: "Photo introuvable" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// ── PROMO EXCLUSIVE (ADMIN) ──
export async function updatePromoOffer(promo: EventPromo): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureAdminAuth();
    const db = await getDb();
    db.promo = promo;
    await writeDb(db);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/tarifs");
    return { success: true, message: "Offre promo mise à jour" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
