const CACHE_NAME = 'eft-paula-v2';
const urlsToCache = [
  './',
  './index.html',
  './wat-is-eft.html',
  './kloppunten.html',
  './eft-tapping.html',
  './eindpagina.html',
  './extra-hulp.html',
  './disclaimer.html',
  './styles.css',
  './manifest.json',
  './logo/logo-avatar-zonderbg.png',
  './avatar/karatepunt.jpg',
  './avatar/kruin.jpg',
  './avatar/wenkbrauw.jpg',
  './avatar/zijkant-oog.jpg',
  './avatar/onder-oog.jpg',
  './avatar/onder-neus.jpg',
  './avatar/kin.jpg',
  './avatar/sleutelbeen.jpg',
  './avatar/onder-arm.jpg',
  './avatar/logo-avatar.jpg',
  './avatar/uitleg-eft.mp4'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Zorg ervoor dat de root URL altijd naar index.html gaat
  if (url.pathname === '/' || url.pathname === '/eft-met-paula/' || url.pathname === '/eft-met-paula') {
    event.respondWith(
      caches.match('./index.html')
        .then(response => {
          return response || fetch('./index.html');
        })
    );
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
      .catch(() => {
        // Fallback voor offline gebruik
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 