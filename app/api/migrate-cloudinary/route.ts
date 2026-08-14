import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { getDb, writeDb } from "../../../lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET() {
  try {
    const db = await getDb();
    const publicDir = path.join(process.cwd(), "public");
    
    let migratedCount = 0;
    const results = [];

    for (const item of db.portfolio) {
      if (item.src.startsWith("/portfolio/")) {
        try {
          const filePath = path.join(publicDir, item.src);
          const buffer = await fs.readFile(filePath);

          const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "bmw-photographe-portfolio", resource_type: "image" },
              (error, result) => {
                if (error || !result) reject(error || new Error("Upload error"));
                else resolve(result);
              }
            );
            stream.end(buffer);
          });

          item.src = uploadResult.secure_url;
          migratedCount++;
          results.push({ id: item.id, newSrc: item.src });
        } catch (err: any) {
          console.error(`Failed to migrate item ${item.id}:`, err);
          results.push({ id: item.id, error: err.message });
        }
      }
    }

    if (migratedCount > 0) {
      await writeDb(db);
    }

    return NextResponse.json({ success: true, migratedCount, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
