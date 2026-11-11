/* ClickNsit service worker — v2 */
const CACHE = 'clicknsit-v2';
const APP_SHELL = ['/', '/exams', '/login', '/signup'];

// Never cache signed-in pages: they contain personal data and go stale.
const PRIVATE_PREFIXES = ['/dashboard', '/admin', '/payment', '/api', '/otp'];

// In local development chunk URLs are not content-hashed, so cache-first would
// keep serving old JavaScript after every edit. Stay out of the way there.
const isDev = ['localhost', '127.0.0.1', '0.0.0.0'].includes(self.location.hostname);

const isPrivate = (pathname) => PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

self.addEventListener('install', (event) => {
  event.waitUntil(
    (isDev ? Promise.resolve() : caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url.pathname)) return;
  if (isDev) return;

  // Hashed build assets + static resources: cache-first (safe, versioned)
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Pages: network-first so users always get fresh data; cache only as offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/'))
        )
    );
  }
});
