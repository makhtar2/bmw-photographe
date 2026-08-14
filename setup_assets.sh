#!/bin/bash
# Script pour copier les assets (logo et images du portfolio) dans le projet Next.js

mkdir -p public/portfolio

# Copie du logo fourni par l'utilisateur
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/media__1786667862052.png" "public/logo.png"

# Copie des images générées pour le portfolio (Studio & Extérieur)
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/portfolio_studio_1_1786667418901.png" "public/portfolio/studio1.png"
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/portfolio_studio_2_1786667458265.png" "public/portfolio/studio2.png"
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/portfolio_studio_3_1786667504005.png" "public/portfolio/studio3.png"
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/portfolio_exterior_1_1786667435641.png" "public/portfolio/exterior1.png"
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/portfolio_exterior_2_1786667479042.png" "public/portfolio/exterior2.png"
cp "/home/almuxtaar/.gemini/antigravity/brain/93d24a8d-6093-46f5-8bcd-743fc734d0c1/portfolio_exterior_3_1786667531299.png" "public/portfolio/exterior3.png"

# Génération des icônes PWA à partir du logo
if command -v python3 &>/dev/null; then
  echo "Génération des icônes PWA..."
  python3 process_icons.py
else
  # Fallback si python3 n'est pas présent
  cp "public/logo.png" "public/logo-square.png"
  cp "public/logo.png" "public/icon-192.png"
  cp "public/logo.png" "public/icon-512.png"
  cp "public/logo.png" "public/icon-maskable.png"
  echo "⚠️ python3 introuvable. Remplacement temporaire des icônes par le logo original."
fi

echo "========================================================="
echo "🎉 Tous les assets ont été copiés et traités avec succès !"
echo "👉 Logo : public/logo.png"
echo "👉 Icônes PWA : public/icon-192.png, public/icon-512.png, public/icon-maskable.png"
echo "👉 Portfolio : public/portfolio/ (6 images haute qualité)"
echo "========================================================="
