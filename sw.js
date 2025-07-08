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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
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