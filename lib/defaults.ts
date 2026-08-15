import type { EventPromo, PackageLabels } from "./db";

// Valeurs par défaut de la promo événementielle — isolées de lib/db.ts
// (qui importe fs/promises) pour pouvoir être importées depuis des
// composants client sans embarquer de code serveur dans le bundle.
export const DEFAULT_PROMO: EventPromo = {
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
};

// Libellés par défaut de chaque formule — éditables depuis l'admin, au même
// titre que les prix (ex: renommer "5 photos" en "5 photos + 1 tirage").
export const DEFAULT_LABELS: PackageLabels = {
  studio_5: "5 photos",
  studio_7: "7 photos",
  studio_10: "10 photos",
  studio_15: "15 photos",
  studio_20: "20 photos",
  exterieur_5: "5 photos",
  exterieur_10: "10 photos",
  ceremonie_80: "80 photos",
  ceremonie_100: "100 photos",
  ceremonie_120: "120 photos",
  ceremonie_tak_diaka: "Pack Tak Diaka · 60 photos",
  option_video: "Vidéo cinématique",
};
