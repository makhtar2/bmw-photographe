import { z } from "zod";

// Créneaux horaires proposés pour une séance (horaires d'ouverture du studio).
// Partagé entre le formulaire client et le planning admin pour rester cohérent.
export const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export const bookingSchema = z.object({
  name: z.string()
    .min(2, "Entrez votre nom")
    .max(80, "Nom trop long"),
  phone: z.string()
    .regex(/^(?:\+221)?\s?(70|75|76|77|78|33)\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/, "Numéro invalide (ex: 77 123 45 67)"),
  location: z.enum(["Studio", "Domicile", "Mariage"]),
  formula: z.string().min(1, "Choisissez une formule"),
  date: z.string().min(1, "Choisissez une date"),
  time: z.string().min(1, "Choisissez un créneau"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
