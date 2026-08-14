import os
from PIL import Image

def process_logo_to_icons():
    logo_path = "public/logo.png"
    if not os.path.exists(logo_path):
        print(f"Erreur: {logo_path} introuvable.")
        return

    # Ouvrir l'image du logo
    img = Image.open(logo_path)
    width, height = img.size
    
    # 1. CRÉER UN LOGO CARRÉ PADDÉ (PWA ICONS)
    # Déterminer la taille du carré
    square_size = max(width, height)
    
    # Créer une image carrée transparente
    square_img_trans = Image.new("RGBA", (square_size, square_size), (0, 0, 0, 0))
    # Centrer le logo original dans le carré
    offset_x = (square_size - width) // 2
    offset_y = (square_size - height) // 2
    square_img_trans.paste(img, (offset_x, offset_y))
    
    # Enregistrer la version carrée transparente originale
    square_img_trans.save("public/logo-square.png", "PNG")
    print("Généré: public/logo-square.png")
    
    # 2. GÉNÉRER LES ICONS DE TAILLE SPÉCIFIQUE
    # Icon 192x192
    icon_192 = square_img_trans.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save("public/icon-192.png", "PNG")
    print("Généré: public/icon-192.png")
    
    # Icon 512x512
    icon_512 = square_img_trans.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save("public/icon-512.png", "PNG")
    print("Généré: public/icon-512.png")
    
    # 3. MASKABLE ICON (avec fond de couleur unie, ex: blanc pour s'adapter à Android/iOS)
    maskable_size = 512
    maskable_img = Image.new("RGBA", (maskable_size, maskable_size), (250, 250, 250, 255)) # #FAFAFA
    
    # Redimensionner l'image originale avec marge pour qu'elle ne soit pas coupée par les masques circulaires (marge de 15%)
    padding = int(maskable_size * 0.15)
    logo_w_resized = maskable_size - (padding * 2)
    logo_h_resized = int(height * (logo_w_resized / width))
    
    logo_resized = img.resize((logo_w_resized, logo_h_resized), Image.Resampling.LANCZOS)
    
    offset_x = (maskable_size - logo_w_resized) // 2
    offset_y = (maskable_size - logo_h_resized) // 2
    
    # Coller le logo resized sur le fond uni
    maskable_img.paste(logo_resized, (offset_x, offset_y), logo_resized if logo_resized.mode == "RGBA" else None)
    maskable_img.save("public/icon-maskable.png", "PNG")
    print("Généré: public/icon-maskable.png")

if __name__ == "__main__":
    process_logo_to_icons()
