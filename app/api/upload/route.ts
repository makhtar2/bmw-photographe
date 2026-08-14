import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

// Config Cloudinary via variables d'environnement (avec fallback)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "Aucun fichier fourni" }, { status: 400 });
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
