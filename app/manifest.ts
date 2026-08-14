import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BMW Photographe Studio",
    short_name: "BMW Photo",
    description: "Séances photo professionnelles à Thiès - Studio & Extérieur",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#F4912D",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/logo-square.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-square.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
