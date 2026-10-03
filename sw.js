/**
 * X-29 — Production PWA Service Worker
 * Architecture: Tiered Cache-First for static assets, Network-First for HTML navigation,
 * and strict Network-Only bypass for Firebase Auth, Firestore, and dynamic API endpoints.
 */

const CACHE_NAME = 'x29-static-v1.0.2';

// Critical static assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/manifest.json',
  '/css/tailwind.css',
  '/icons/logo-sticker.png',
  '/js/core/app.js',
  '/js/state.js',
  '/js/firebase.js',
  '/js/utils/dom.js',
  '/js/services/auth.js',
  '/router/router.js'
];

// Domains and endpoints that must NEVER be intercepted or cached
const BYPASS_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseapp.com',
  'googleapis.com'
];

/**
 * 1. Install Lifecycle: Pre-cache core application shell
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static application shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/**
 * 2. Activate Lifecycle: Purge legacy caches and claim active clients
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * 3. Fetch Lifecycle: Route-aware proxying
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // A. Only handle GET requests with HTTP(S) protocol
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // B. Strictly bypass Firebase Auth, Firestore, Google APIs, and local dynamic API endpoints
  if (BYPASS_HOSTS.some(host => url.hostname.includes(host)) || url.pathname.startsWith('/api/')) {
    return; // Pass through to browser default network stack
  }

  // C. HTML Navigation Requests: Network-First with Cache Fallback for offline support
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // D. Static Assets (CSS, JS, Images, Icons, Fonts): Stale-While-Revalidate
  const isStaticAsset = (
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/pages/') ||
    url.pathname.startsWith('/router/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.json')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Return cached immediately if available, while fetching update in background
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {/* Ignore network fetch errors during background revalidation */});

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
