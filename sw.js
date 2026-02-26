/* Service worker mínimo para que la PWA sea instalable. Cambiar VERSION al publicar. */
const CACHE = 'tareasot-v1.43';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (name) { return name !== CACHE; }).map(function (name) {
          return caches.delete(name);
        })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
