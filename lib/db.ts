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

export interface Database {
  settings: PricesSettings;
  portfolio: PortfolioItem[];
  bookings: Booking[];
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
      src: "/portfolio/real1.png",
      alt: "Portrait élégance traditionnelle blanche par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Élégance Blanche",
    },
    {
      id: 2,
      src: "/portfolio/real2.png",
      alt: "Séance couple en tenues traditionnelles par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Couple Tradition",
    },
    {
      id: 3,
      src: "/portfolio/real3.png",
      alt: "Séance portrait éclat traditionnel bleu par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Éclat Bleu & Or",
    },
    {
      id: 4,
      src: "/portfolio/real4.png",
      alt: "Portrait homme en kaftan noir par BMW Photographe",
      category: "exterior",
      aspectClass: "aspect-[2/3]",
      title: "Homme Kaftan Noir",
    },
    {
      id: 5,
      src: "/portfolio/real5.png",
      alt: "Robe traditionnelle mariage rouge par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Mariage Royal Rouge",
    },
    {
      id: 6,
      src: "/portfolio/real6.png",
      alt: "Robe de mariée blanche en dentelle par BMW Photographe",
      category: "exterior",
      aspectClass: "aspect-[2/3]",
      title: "Robe de Mariée Dentelle",
    },
    {
      id: 7,
      src: "/portfolio/real7.png",
      alt: "Séance de préparation en peignoir par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Préparatifs Beauté",
    },
    {
      id: 8,
      src: "/portfolio/real8.png",
      alt: "Détails henne et alliances par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-square",
      title: "Détails Henné",
    },
    {
      id: 9,
      src: "/portfolio/real9.png",
      alt: "Mariée voilée en tenue de noces par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Le Voile Blanc",
    },
    {
      id: 10,
      src: "/portfolio/real10.png",
      alt: "Émotion et recueillement de la mariée par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Émotion & Regard",
    },
    {
      id: 11,
      src: "/portfolio/real11.png",
      alt: "Portrait souriant en voile noir et rouge par BMW Photographe",
      category: "exterior",
      aspectClass: "aspect-[2/3]",
      title: "Sourire & Tradition",
    },
    {
      id: 12,
      src: "/portfolio/real12.png",
      alt: "Complicité et éclats de rire du couple par BMW Photographe",
      category: "studio",
      aspectClass: "aspect-[3/4]",
      title: "Complicité de Couple",
    },
  ],
  bookings: [],
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
    
    // Copy the 12 real uploaded photos
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786674950800.png", dest: "portfolio/real1.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786674985495.png", dest: "portfolio/real2.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786674990513.png", dest: "portfolio/real3.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786674996325.png", dest: "portfolio/real4.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675001669.jpg", dest: "portfolio/real5.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675039466.jpg", dest: "portfolio/real6.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675044561.png", dest: "portfolio/real7.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675049444.jpg", dest: "portfolio/real8.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675054923.jpg", dest: "portfolio/real9.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675071814.jpg", dest: "portfolio/real10.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675081032.png", dest: "portfolio/real11.png" },
    { src: "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786675086065.png", dest: "portfolio/real12.png" },
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

// Lire la base de données
export async function getDb(): Promise<Database> {
  // S'assurer que le dossier data et les assets existent
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await initAssets();
  
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    // Fichier inexistant, écrire la base par défaut
    await writeDb(defaultDatabase);
    return defaultDatabase;
  }
}

// Écrire dans la base de données
export async function writeDb(db: Database): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Erreur lors de l'écriture de la base de données:", err);
    return false;
  }
}
