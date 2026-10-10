// Service worker voor EFT met Paula
// Verhoog CACHE_VERSION bij elke wijziging van de app-bestanden.
const CACHE_VERSION = 'v11';
const CACHE_NAME = 'eft-paula-' + CACHE_VERSION;

const APP_SHELL = [
  '/', '/index.html', '/eft-tapping.html', '/eindpagina.html', '/kloppunten.html',
  '/wat-is-eft.html', '/extra-hulp.html', '/disclaimer.html', '/privacy.html', '/install-app.html',
  '/kloppunten/kloppunt-karatepunt.html', '/kloppunten/kloppunt-kruin.html',
  '/kloppunten/kloppunt-wenkbrauw.html', '/kloppunten/kloppunt-zijkant-oog.html',
  '/kloppunten/kloppunt-onder-oog.html', '/kloppunten/kloppunt-onder-neus.html',
  '/kloppunten/kloppunt-kin.html', '/kloppunten/kloppunt-sleutelbeen.html',
  '/kloppunten/kloppunt-onder-arm.html',
  '/styles.css', '/eft-formatter.js', '/eft-speech.js', '/pwa.js', '/a11y.css', '/fontawesome-subset.css', '/fonts/fa-solid-subset.woff2', '/fonts/fa-brands-subset.woff2', '/manifest.json',
  '/logo/logo-avatar-zonderbg.png', '/logo/favicon.png',
  '/icons/app-icon-192.png', '/icons/app-icon-512.png', '/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('eft-paula-') && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // externe bestanden niet cachen
  if (url.pathname.endsWith('.mp4')) return;               // video niet cachen

  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Netwerk eerst, zodat je altijd de nieuwste versie krijgt; offline uit de cache
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Overige bestanden: uit de cache, op de achtergrond bijwerken
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
