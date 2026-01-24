/**
 * Service Worker for caching map tiles and static data
 * This makes the map load much faster on repeat visits
 */

const CACHE_NAME = 'nyc-ski-map-v1';

// Static files to cache immediately
const STATIC_ASSETS = [
  '/data/nyc-streets.json',
  '/data/nyc-traffic.json',
];

// Tile URL patterns to cache
const TILE_PATTERNS = [
  /^https:\/\/mt\d\.google\.com\/vt\/lyrs=/,
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch: serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Check if this is a tile request
  const isTile = TILE_PATTERNS.some((pattern) => pattern.test(url));

  // Check if this is our static data
  const isStaticData = STATIC_ASSETS.some((asset) => url.endsWith(asset));

  if (isTile || isStaticData) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version immediately
            // For tiles, also update cache in background
            if (isTile) {
              fetch(event.request).then((networkResponse) => {
                if (networkResponse.ok) {
                  cache.put(event.request, networkResponse);
                }
              }).catch(() => {});
            }
            return cachedResponse;
          }

          // Not in cache, fetch from network and cache it
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  }
});
