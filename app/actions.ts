"use server";

import { bookingSchema, BookingInput } from "../lib/schema";
import { getDb, writeDb, Booking, PricesSettings, PortfolioItem } from "../lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  redirectUrl?: string;
  message?: string;
};

// ── RÉSERVATION CLIENT ──
export async function submitBooking(data: BookingInput): Promise<ActionState> {
  const result = bookingSchema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const v = result.data;
  const db = await getDb();

  const newBooking: Booking = {
    id: Math.random().toString(36).substring(2, 7).toUpperCase(),
    ...v,
    status: "En attente",
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  await writeDb(db);

  const whatsappPhone = "221762588808";
  const message = `Salam, je suis ${v.name}.
Je veux réserver : ${v.formula}
Lieu : ${v.location}
Mon numéro : ${v.phone}

Voici la capture de mon paiement 👇`;

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, redirectUrl: whatsappUrl };
}

// ── AUTH ADMIN ──
const ADMIN_PASSWORD = "bmw2026";

export async function loginAdmin(password: string): Promise<{ success: boolean; message?: string }> {
  if (password === ADMIN_PASSWORD) {
    cookies().set("bmw_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return { success: true };
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
