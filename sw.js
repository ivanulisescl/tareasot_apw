/* Service worker mínimo para PWA instalable, igual que Mareo.
 * Sin caché agresiva para que GitHub Pages actualice al recargar. */
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
