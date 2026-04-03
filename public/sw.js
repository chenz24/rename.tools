// Rename.Tools Service Worker - Offline PWA Support
const CACHE_VERSION = 'v1.1';
const STATIC_CACHE = `rename-tools-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `rename-tools-dynamic-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache during install
const PRECACHE_ASSETS = [
  '/',
  '/en',
  '/en/app',
  '/zh',
  '/zh/app',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.svg',
  '/manifest.webmanifest',
];

// Install: pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for existing SW to finish
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('rename-tools-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE
            );
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// Helper: is this a navigation request?
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Helper: is this a static asset?
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp)$/)
  );
}

// Helper: is this an API or internal Next.js request?
function isApiOrInternal(url) {
  return (
    url.pathname.startsWith('/api/') ||
    (url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/_next/static/'))
  );
}

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests (Cache API only supports GET)
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  // Skip API and internal Next.js data requests
  if (isApiOrInternal(url)) return;

  // Strategy 1: Cache First for static assets (immutable, hashed filenames)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Strategy 2: Network First for navigation (HTML pages)
  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  // Strategy 3: Stale While Revalidate for everything else
  event.respondWith(staleWhileRevalidate(event.request));
});

// Cache First: try cache, fallback to network, cache the response
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // If both cache and network fail, return a basic fallback
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

// Network First for navigation: try network, cache successful responses, fallback to cache
async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Last resort: show offline page
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// Stale While Revalidate: return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cloned = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, cloned);
        });
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
