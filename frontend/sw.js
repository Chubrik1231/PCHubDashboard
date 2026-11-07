/**
 * CYBER // PC Telemetry HUD - Progressive Web App Service Worker
 * Network-first navigation with instant cache fallback, stale-while-revalidate for local assets,
 * and offline application shell support.
 */

const CACHE_NAME = 'pc-telemetry-hud-v5';

const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg'
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// ---------------------------------------------------------------------------
// Install Event: Pre-cache Essential Shell & CDN Assets
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache critical local assets (fail-safe)
      try {
        await cache.addAll(STATIC_SHELL_ASSETS);
      } catch (err) {
        console.warn('[SW] Warning caching local assets:', err);
      }

      // 2. Pre-cache CDN dependencies
      for (const cdnUrl of CDN_ASSETS) {
        try {
          const res = await fetch(cdnUrl, { mode: 'cors' });
          if (res && res.status === 200) {
            await cache.put(cdnUrl, res);
          }
        } catch (cdnErr) {
          console.warn('[SW] Could not pre-cache CDN URL:', cdnUrl, cdnErr);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate Event: Evict Outdated Caches & Claim Clients
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch Event: Network-First with Cache Fallback for Navigation
// Stale-While-Revalidate for Static Assets & CDNs
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests
  if (req.method !== 'GET') {
    return;
  }

  // Pass-through WebSocket signaling and raw data streams
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // 1. API Calls: Network-Only with Offline JSON Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            status: 'offline',
            error: 'Host PC unreachable. Connect to the same local Wi-Fi.',
            timestamp: new Date().toISOString()
          }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 2. HTML Navigation Requests (The Application Shell)
  // Network-First with strict 2.5s timeout; instant Cache fallback on LAN disconnect
  const isNavigate = req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
  if (isNavigate) {
    event.respondWith(
      (async () => {
        try {
          // Timeout network fetch after 2.5s so mobile doesn't hang on dead LAN routes
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2500);

          const networkResponse = await fetch(req, { signal: controller.signal });
          clearTimeout(timer);

          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('/index.html', networkResponse.clone());
            cache.put('/', networkResponse.clone());
            return networkResponse;
          }
        } catch (fetchErr) {
          // Network failed or timed out (offline / wrong Wi-Fi)
        }

        // Return cached application shell
        const cachedResponse = await caches.match('/index.html') || await caches.match('/');
        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response('PC Telemetry HUD shell offline. Please load once while on Wi-Fi.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })()
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Fonts, Icons) & CDNs: Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      // Background update (Stale-While-Revalidate)
      const fetchPromise = fetch(req).then(async (networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      }).catch(() => {
        // Network failed in background - ignore if we already had cached
      });

      // If already in cache, serve immediately for instantaneous load
      if (cached) {
        event.waitUntil(fetchPromise);
        return cached;
      }

      // If not in cache, wait for network
      return fetchPromise;
    })
  );
});