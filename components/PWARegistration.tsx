"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // En développement (localhost), désactiver et nettoyer le Service Worker pour rafraîchir instantanément
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
        return;
      }

      // Enregistrer le Service Worker en production uniquement
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker PWA actif sur scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Erreur Service Worker:", error);
        });
    }
  }, []);

  return null;
}

