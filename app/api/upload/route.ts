import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

// Config Cloudinary via variables d'environnement (avec fallback)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  const session = cookies().get("bmw_admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Type de fichier non autorisé" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Si les clés Cloudinary sont configurées, on envoie vers Cloudinary !
    const hasCloudinaryConfig = 
      (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinaryConfig) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "bmw-photographe-portfolio",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) reject(error || new Error("Erreur de téléversement Cloudinary"));
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({ success: true, src: uploadResult.secure_url, provider: "cloudinary" });
    }

    // Sinon, fallback d'enregistrement local dans /public/portfolio/
    const ext = path.extname(file.name) || ".png";
    const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "portfolio");

    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/portfolio/${filename}`;
    return NextResponse.json({ success: true, src: publicUrl, provider: "local" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Erreur upload" }, { status: 500 });
  }
}
