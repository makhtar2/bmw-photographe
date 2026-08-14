"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Enregistrer le service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré avec succès, scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Échec de l'enregistrement du Service Worker:", error);
        });
    }
  }, []);

  return null;
}
