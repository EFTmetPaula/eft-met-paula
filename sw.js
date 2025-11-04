// Deze Service Worker is UITGESCHAKELD
// Hij verwijdert zichzelf en alle caches

self.addEventListener('install', event => {
  // Verwijder alle caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('SW: Verwijder alle caches');
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Unregister deze service worker
      return self.registration.unregister();
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.registration.unregister();
    })
  );
  self.clients.claim();
}); 