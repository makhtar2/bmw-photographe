import { Redis } from "@upstash/redis";
import { DEFAULT_PROMO } from "./defaults";

export interface PortfolioItem {
  id: number;
  src: string;
  alt: string;
  category: "studio" | "exterior";
  aspectClass: string;
  title: string;
  featured?: boolean; // affichée dans le diaporama Hero de la page d'accueil
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  location: "Studio" | "Domicile" | "Mariage";
  formula: string;
  status: "En attente" | "Confirmé" | "Annulé";
  createdAt: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

// Une formule tarifaire (ex: "5 photos" à 10 000 FCFA). L'admin peut en
// ajouter, en supprimer ou en modifier librement dans chaque catégorie —
// rien n'est figé à un nombre fixe de formules.
export interface PricePackage {
  id: string;
  label: string;
  price: number;
}

export interface PricesSettings {
  studio: PricePackage[];
  exterieur: PricePackage[];
  ceremonie: PricePackage[];
  optionVideoLabel: string;
  optionVideoPrice: number;
}

export interface EventPromo {
  enabled: boolean;
  eventName: string;
  subtitle: string;
  badgeText: string;
  // Prix promo par identifiant de formule (PricePackage.id)
  promoPrices: Record<string, number>;
  promoOptionVideoPrice?: number;
}

export interface Database {
  settings: PricesSettings;
  portfolio: PortfolioItem[];
  bookings: Booking[];
  promo?: EventPromo;
}

const defaultDatabase: Database = {
  settings: {
    studio: [
      { id: "studio_5", label: "5 photos", price: 10000 },
      { id: "studio_7", label: "7 photos", price: 15000 },
      { id: "studio_10", label: "10 photos", price: 20000 },
      { id: "studio_15", label: "15 photos", price: 30000 },
      { id: "studio_20", label: "20 photos", price: 50000 },
    ],
    exterieur: [
      { id: "exterieur_5", label: "5 photos", price: 25000 },
      { id: "exterieur_10", label: "10 photos", price: 40000 },
    ],
    ceremonie: [
      { id: "ceremonie_80", label: "80 photos", price: 110000 },
      { id: "ceremonie_100", label: "100 photos", price: 125000 },
      { id: "ceremonie_120", label: "120 photos", price: 150000 },
      { id: "ceremonie_tak_diaka", label: "Pack Tak Diaka · 60 photos", price: 85000 },
    ],
    optionVideoLabel: "Vidéo cinématique",
    optionVideoPrice: 15000,
  },
  portfolio: [
    {
      id: 1,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721392/bmw-photographe-portfolio/idecilzcz1wtnnftftsz.png",
      alt: "Portrait élégance traditionnelle blanche par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Élégance Blanche",
    },
    {
      id: 2,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721395/bmw-photographe-portfolio/orgjgabje4dgxta6nicd.png",
      alt: "Séance couple en tenues traditionnelles par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Couple Tradition",
    },
    {
      id: 3,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721397/bmw-photographe-portfolio/dk9fv87fjd7gufgtmt0d.png",
      alt: "Séance portrait éclat traditionnel bleu par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Éclat Bleu & Or",
    },
    {
      id: 4,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721358/bmw-photographe-portfolio/mzp7f4pfnl7asczpiqef.png",
      alt: "Portrait homme en kaftan noir par BMW Photographe",
      category: "exterior",
      aspectClass: "aspect-[2/3]",
      title: "Homme Kaftan Noir",
    },
    {
      id: 5,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721359/bmw-photographe-portfolio/pjrumgnxzky88oriikby.jpg",
      alt: "Robe traditionnelle mariage rouge par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Mariage Royal Rouge",
    },
    {
      id: 6,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721360/bmw-photographe-portfolio/zzruma8ffcv5ps6uzb4p.jpg",
      alt: "Robe de mariée blanche en dentelle par BMW Photographe",
      category: "exterior",
      aspectClass: "aspect-[2/3]",
      title: "Robe de Mariée Dentelle",
    },
    {
      id: 7,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721362/bmw-photographe-portfolio/ldf8tzbn7u6zkwchb1ah.png",
      alt: "Séance de préparation en peignoir par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Préparatifs Beauté",
    },
    {
      id: 8,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721364/bmw-photographe-portfolio/kucjcfltzzlfd6he9rd1.jpg",
      alt: "Détails henne et alliances par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-square",
      title: "Détails Henné",
    },
    {
      id: 9,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721366/bmw-photographe-portfolio/hwk2dsplqauoor8oasmx.jpg",
      alt: "Mariée voilée en tenue de noces par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Le Voile Blanc",
    },
    {
      id: 10,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721367/bmw-photographe-portfolio/s14qw9bpxayjcl4ejihq.jpg",
      alt: "Émotion et recueillement de la mariée par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Émotion & Regard",
    },
    {
      id: 11,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721371/bmw-photographe-portfolio/tnekogp2wwsnzcutzhzk.png",
      alt: "Portrait souriant en voile noir et rouge par BMW Photographe",
      category: "exterior",
      aspectClass: "aspect-[2/3]",
      title: "Sourire & Tradition",
    },
    {
      id: 12,
      src: "https://res.cloudinary.com/fe55mqsh/image/upload/v1786721374/bmw-photographe-portfolio/or3zzxm9daptwceljpqb.png",
      alt: "Complicité et éclats de rire du couple par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Complicité de Couple",
    },
  ],
  bookings: [],
  promo: DEFAULT_PROMO,
};

const DB_KEY = "bmw-photographe:db";

// Client Redis initialisé de façon paresseuse : un import au niveau module
// planterait `next build` si les variables d'environnement Upstash ne sont
// pas encore configurées (ex: avant provisionnement du Marketplace).
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

// Ancien libellés par défaut (formats précédents), utilisés uniquement
// comme repli lors de la migration de données existantes.
const LEGACY_DEFAULT_LABELS: Record<string, string> = {
  studio_5: "5 photos", studio_7: "7 photos", studio_10: "10 photos",
  studio_15: "15 photos", studio_20: "20 photos",
  exterieur_5: "5 photos", exterieur_10: "10 photos",
  ceremonie_80: "80 photos", ceremonie_100: "100 photos", ceremonie_120: "120 photos",
  ceremonie_tak_diaka: "Pack Tak Diaka · 60 photos",
  option_video: "Vidéo cinématique",
};

// Migre les anciens formats de `settings` (nombre fixe de formules codées en
// dur, avec ou sans `labels` séparés) vers le format actuel en tableaux
// libres. Les identifiants sont conservés à l'identique, donc les prix promo
// existants (déjà indexés par ces mêmes identifiants) restent valides sans
// transformation.
function migrateSettings(raw: any): PricesSettings {
  if (raw && Array.isArray(raw.studio)) {
    return raw as PricesSettings;
  }

  const oldSettings = raw || {};
  const oldLabels = raw?.__labels || {};

  const pkg = (id: string, fallbackLabel: string, fallbackPrice: number): PricePackage => ({
    id,
    label: oldLabels[id] || LEGACY_DEFAULT_LABELS[id] || fallbackLabel,
    price: typeof oldSettings[id] === "number" ? oldSettings[id] : fallbackPrice,
  });

  return {
    studio: [
      pkg("studio_5", "5 photos", 10000),
      pkg("studio_7", "7 photos", 15000),
      pkg("studio_10", "10 photos", 20000),
      pkg("studio_15", "15 photos", 30000),
      pkg("studio_20", "20 photos", 50000),
    ],
    exterieur: [
      pkg("exterieur_5", "5 photos", 25000),
      pkg("exterieur_10", "10 photos", 40000),
    ],
    ceremonie: [
      pkg("ceremonie_80", "80 photos", 110000),
      pkg("ceremonie_100", "100 photos", 125000),
      pkg("ceremonie_120", "120 photos", 150000),
      pkg("ceremonie_tak_diaka", "Pack Tak Diaka · 60 photos", 85000),
    ],
    optionVideoLabel: oldLabels.option_video || LEGACY_DEFAULT_LABELS.option_video,
    optionVideoPrice: typeof oldSettings.option_video === "number" ? oldSettings.option_video : 15000,
  };
}

// Lire la base de données depuis Redis (partagée entre toutes les instances
// serverless — contrairement à un fichier local, qui n'est pas fiable sur
// Vercel car chaque instance a son propre système de fichiers éphémère).
export async function getDb(): Promise<Database> {
  const redis = getRedis();
  const data = await redis.get<any>(DB_KEY);

  if (data) {
    // Rétrocompatibilité : migre à la volée les anciens formats de tarifs
    // (les `labels` séparés, s'ils existent, servent de repli puis sont
    // absorbés dans chaque formule).
    const settings = migrateSettings({ ...data.settings, __labels: data.labels });
    const { labels, ...rest } = data;
    return { ...rest, settings } as Database;
  }

  // Première utilisation : on amorce Redis avec la base par défaut.
  await redis.set(DB_KEY, defaultDatabase);
  return defaultDatabase;
}

// Écrire dans la base de données
export async function writeDb(db: Database): Promise<boolean> {
  const redis = getRedis();
  await redis.set(DB_KEY, db);
  return true;
}
