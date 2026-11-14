/* Service worker: makes the app work offline.
   Strategy: serve from cache instantly, refresh the cache in the background
   (stale-while-revalidate), so updates appear on the next launch. */
const CACHE = 'changes-v18';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/styles.css', 'js/theory.js', 'js/render.js', 'js/audio.js', 'js/app.js', 'js/pwa.js', 'js/learn.js', 'js/theme.js', 'js/glossary.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'css/fonts.css', 'fonts/archivo-normal-latin.woff2', 'fonts/archivo-normal-latin-ext.woff2', 'fonts/fraunces-normal-latin.woff2', 'fonts/fraunces-normal-latin-ext.woff2', 'fonts/fraunces-italic-latin.woff2', 'fonts/fraunces-italic-latin-ext.woff2', 'fonts/inter-normal-latin.woff2', 'fonts/inter-normal-latin-ext.woff2', 'fonts/noto-music-normal-latin.woff2', 'fonts/noto-music-normal-latin-ext.woff2', 'fonts/noto-music-normal-music.woff2',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' bypasses the browser's HTTP cache so a new version never caches old files
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // ignoreSearch so "?source=pwa" style URLs still hit the cached page
      const cached = await cache.match(req, { ignoreSearch: sameOrigin });
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        e.waitUntil(network);
        return cached;
      }
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') return cache.match('index.html');
      return Response.error();
    })
  );
});
