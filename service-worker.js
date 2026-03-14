// ============================================================
// service-worker.js — Cache-First PWA Service Worker
// ルートに配置することでアプリ全体のスコープをカバー
// ============================================================

const CACHE_NAME = 'musicmind-v2';

// キャッシュするアセット (Cache First)
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/instrument.config.js',
  '/components/timer.js',
  '/components/chat.js',
  '/components/calendar.js',
  '/components/theory.js',
  '/components/rhythm.js',
  '/components/score.js',
  '/utils/storage.js',
  '/utils/date.js',
  '/utils/api.js',
  '/pwa/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ---- Install ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ---- Activate ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ---- Fetch (Cache First) ----
self.addEventListener('fetch', (event) => {
  // API呼び出し（Anthropic等）はキャッシュしない
  if (event.request.url.includes('anthropic.com')) return;
  // POST はキャッシュしない
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => {
          // オフライン時: HTMLリクエストはindexを返す
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
