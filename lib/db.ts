import fs from "fs/promises";
import path from "path";

// Définition du chemin du fichier JSON de base de données
const DB_FILE = path.join(process.cwd(), "data", "db.json");

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

export interface EventPromo {
  enabled: boolean;
  eventName: string;
  subtitle: string;
  badgeText: string;
  promoPrices: Partial<PricesSettings>;
}

export interface Database {
  settings: PricesSettings;
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
  promo: {
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
    },
  },
};

// Initialisation automatique des assets (logo et images)
async function initAssets() {
  const publicDir = path.join(process.cwd(), "public");
  const portfolioDir = path.join(publicDir, "portfolio");
  
  // S'assurer que les dossiers existent
  await fs.mkdir(portfolioDir, { recursive: true });
  
  const filesToCopy = [
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786667862052.png", dest: "logo.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786667862052.png", dest: "logo-square.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786667862052.png", dest: "icon-192.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786667862052.png", dest: "icon-512.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786667862052.png", dest: "icon-maskable.png" },
  ];
  
  for (const file of filesToCopy) {
    const destPath = path.join(publicDir, file.dest);
    try {
      await fs.access(destPath);
    } catch {
      try {
        await fs.copyFile(file.src, destPath);
        console.log(`[AutoSetup] Copié : ${file.src} -> ${destPath}`);
      } catch (err) {
        console.error(`[AutoSetup] Erreur de copie de ${file.src} vers ${destPath}:`, err);
      }
    }
  }
}

const TMP_DB_FILE = path.join("/tmp", "bmw_db.json");

// Lire la base de données
export async function getDb(): Promise<Database> {
  await initAssets();
  
  // 1. Essayer de lire depuis /tmp (pour la persistance Vercel serverless)
  try {
    const tmpData = await fs.readFile(TMP_DB_FILE, "utf-8");
    return JSON.parse(tmpData);
  } catch {
    // 2. Sinon lire depuis le fichier initial data/db.json
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return defaultDatabase;
    }
  }
}

// Écrire dans la base de données
export async function writeDb(db: Database): Promise<boolean> {
  const content = JSON.stringify(db, null, 2);
  let saved = false;

  // 1. Écrire dans /tmp (toujours autorisé sur Vercel serverless)
  try {
    await fs.writeFile(TMP_DB_FILE, content, "utf-8");
    saved = true;
  } catch (err) {
    console.error("[WriteDb /tmp Error]", err);
  }

  // 2. Écrire dans data/db.json (dev local)
  try {
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    await fs.writeFile(DB_FILE, content, "utf-8");
    saved = true;
  } catch {
    // Système de fichier en lecture seule sur Vercel production
  }

  return saved;
}
