// SISTENFOX Offline Service Worker for Android & PWA
const CACHE_NAME = 'sistenfox-offline-v3';

// Core Application Shell precached on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell for Android offline use...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Some precache assets could not be loaded immediately:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      if (self.clients && typeof self.clients.claim === 'function') {
        return self.clients.claim();
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Non-GET requests (e.g. POST, PUT, DELETE) pass directly to network
  if (request.method !== 'GET') {
    return;
  }

  // 2. Navigation requests (HTML pages): Network-first with instant SPA fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[Service Worker] Offline on Android: serving cached SPA index.html for route:', url.pathname);
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html') || await cache.match('/');
          if (cachedIndex) {
            return cachedIndex;
          }
          return new Response(
            '<!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;"><h2>SISTENFOX Offline</h2><p>O aplicativo está pronto para uso offline no Android. Reconecte-se uma vez para sincronizar.</p><button onclick="window.location.reload()" style="background:#ffb300;color:#000;padding:10px 20px;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">Tentar Novamente</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Static Assets (Scripts, Styles, Fonts, Icons, Images): Stale-While-Revalidate / Cache-First
  const isStaticAsset = (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Fetch in background to update cache
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. API Requests (/api/*): Network-First with cached fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedApiResponse = await caches.match(request);
          if (cachedApiResponse) {
            return cachedApiResponse;
          }
          return new Response(
            JSON.stringify({ offline: true, message: 'Operando em modo offline no Android' }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          );
        })
    );
    return;
  }

  // 5. Default fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Broadcast offline sync status to connected windows
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Native Notification click handler (focuses existing tab or opens app window)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
