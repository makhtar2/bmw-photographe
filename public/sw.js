const CACHE_NAME = 'bmw-photo-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/logo.png',
  '/logo-square.png',
  '/portfolio/studio1.png',
  '/portfolio/studio2.png',
  '/portfolio/studio3.png',
  '/portfolio/exterior1.png',
  '/portfolio/exterior2.png',
  '/portfolio/exterior3.png',
];

// Installation du Service Worker et mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mise en cache du shell de l\'application');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Cache First, fallback Network
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET et les requêtes vers l'admin ou les serveurs tiers (ex: WhatsApp, analytics)
  if (event.request.method !== 'GET' || event.request.url.includes('/admin') || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        // Mettre en cache les nouvelles requêtes d'images ou d'assets
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          (event.request.url.includes('/portfolio/') || event.request.url.includes('/logo') || event.request.url.includes('.css'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // En cas de panne de réseau hors ligne
        return new Response('Hors ligne');
      });
    })
  );
});
