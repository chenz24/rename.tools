// Generated as /sw.js by scripts/build.mjs. Never cache Flight/RSC responses.
const RELEASE = '__RENAME_RELEASE__';
const STATIC_CACHE = 'rename-tools-static-v2';
const DYNAMIC_CACHE = `rename-tools-pages-${RELEASE}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_ASSETS = [OFFLINE_URL, '/icon-192.png', '/icon-512.png', '/logo.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS)));
  // A waiting update is offered to the user; never reload an active rename session.
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      // Remove old HTML/Flight data, but retain hashed JS needed by existing tabs.
      if ((name.startsWith('rename-tools-dynamic-') || name.startsWith('rename-tools-pages-')) && name !== DYNAMIC_CACHE) {
        await caches.delete(name);
      }
    }
    await self.clients.claim();
  })());
});

function isFlight(request, url) {
  return url.searchParams.has('_rsc') || request.headers.has('RSC') ||
    request.headers.has('Next-Router-State-Tree') || request.headers.has('Next-Router-Prefetch') ||
    request.headers.has('Next-Router-Segment-Prefetch') ||
    (request.headers.get('Accept') || '').includes('text/x-component');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== 'GET') return;
  // The independent repair page must always reach the network, including probes.
  if (url.pathname === '/repair.html' || url.pathname === '/repair' || url.pathname === '/sw.js' ||
      url.pathname.startsWith('/api/') || isFlight(request, url)) return;
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheAsset(request, event));
  } else if (request.mode === 'navigate') {
    event.respondWith(navigate(request, event));
  } else if (PRECACHE_ASSETS.includes(url.pathname) ||
      url.pathname.startsWith('/screenshots/optimized/') ||
      url.pathname.startsWith('/guides/screenshots/optimized/')) {
    event.respondWith(cacheAsset(request, event, false));
  }
  // All other requests use the network; no generic stale-while-revalidate cache.
});

async function cacheAsset(request, event, allowLegacy = true) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    // Only immutable Next assets may be read from the legacy cache, never HTML/RSC.
    if (allowLegacy) {
      const old = await caches.match(request, { cacheName: 'rename-tools-static-v1.1' });
      if (old) return old;
    }
  } catch { /* Restricted storage must not prevent online loading. */ }
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {}));
  }
  // Preserve HTTP errors so the page's chunk failure handler can offer repair.
  return response;
}

async function navigate(request, event) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 10000);
  try {
    const response = await fetch(request, { signal: abort.signal });
    if (response.ok && (response.headers.get('Content-Type') || '').includes('text/html')) {
      const copy = response.clone();
      event.waitUntil(caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {}));
    }
    return response;
  } catch {
    try {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = (await cache.match(request)) ||
        (await caches.match(OFFLINE_URL, { cacheName: STATIC_CACHE }));
      if (cached) return cached;
    } catch { /* Offline and storage unavailable: return an explicit failure. */ }
    return new Response('Offline. Reconnect and reload.', { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
