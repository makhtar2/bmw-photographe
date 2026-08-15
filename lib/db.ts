import { Redis } from "@upstash/redis";
import { DEFAULT_PROMO, DEFAULT_LABELS } from "./defaults";

export interface PortfolioItem {
  id: number;
  src: string;
  alt: string;
  category: "studio" | "exterior";
  aspectClass: string;
  title: string;
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

export interface PricesSettings {
  studio_5: number;
  studio_7: number;
  studio_10: number;
  studio_15: number;
  studio_20: number;
  exterieur_5: number;
  exterieur_10: number;
  ceremonie_80: number;
  ceremonie_100: number;
  ceremonie_120: number;
  ceremonie_tak_diaka: number;
  option_video: number;
}

// Libellé affiché pour chaque formule (ex: "5 photos"), éditable depuis
// l'admin indépendamment du prix.
export type PackageLabels = Record<keyof PricesSettings, string>;

export interface EventPromo {
  enabled: boolean;
  eventName: string;
  subtitle: string;
  badgeText: string;
  promoPrices: Partial<PricesSettings>;
}

export interface Database {
  settings: PricesSettings;
  labels: PackageLabels;
  portfolio: PortfolioItem[];
  bookings: Booking[];
  promo?: EventPromo;
}

const defaultDatabase: Database = {
  settings: {
    studio_5: 10000,
    studio_7: 15000,
    studio_10: 20000,
    studio_15: 30000,
    studio_20: 50000,
    exterieur_5: 25000,
    exterieur_10: 40000,
    ceremonie_80: 110000,
    ceremonie_100: 125000,
    ceremonie_120: 150000,
    ceremonie_tak_diaka: 85000,
    option_video: 15000,
  },
  labels: DEFAULT_LABELS,
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

// Lire la base de données depuis Redis (partagée entre toutes les instances
// serverless — contrairement à un fichier local, qui n'est pas fiable sur
// Vercel car chaque instance a son propre système de fichiers éphémère).
export async function getDb(): Promise<Database> {
  const redis = getRedis();
  const data = await redis.get<Database>(DB_KEY);

  if (data) {
    // Rétrocompatibilité : les entrées écrites avant l'ajout des libellés
    // de formules n'ont pas ce champ.
    if (!data.labels) data.labels = DEFAULT_LABELS;
    return data;
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
