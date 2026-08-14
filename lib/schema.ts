import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string()
    .min(2, "Entrez votre nom")
    .max(80, "Nom trop long"),
  phone: z.string()
    .regex(/^(?:\+221)?\s?(70|75|76|77|78|33)\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/, "Numéro invalide (ex: 77 123 45 67)"),
  location: z.enum(["Studio", "Domicile", "Mariage"]),
  formula: z.string().min(1, "Choisissez une formule"),
  date: z.string().optional(),
  time: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
