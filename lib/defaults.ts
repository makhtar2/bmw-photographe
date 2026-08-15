import type { EventPromo } from "./db";

// Valeurs par défaut de la promo événementielle — isolées de lib/db.ts
// (qui importe fs/promises) pour pouvoir être importées depuis des
// composants client sans embarquer de code serveur dans le bundle.
// Les clés de promoPrices correspondent aux identifiants des formules par
// défaut (voir defaultDatabase dans lib/db.ts) — si l'admin ajoute ou
// supprime des formules, les nouvelles n'ont simplement pas de prix promo
// tant qu'il n'en définit pas un.
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
  },
  promoOptionVideoPrice: 12000,
};
