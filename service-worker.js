// ============================================================
// service-worker.js — Cache-First PWA Service Worker
// ルートに配置することでアプリ全体のスコープをカバー
// ============================================================

const CACHE_NAME = 'musicmind-v3';

// キャッシュするアセット (Cache First)
const PRECACHE = [
  '/musicmind/',
  '/musicmind/index.html',
  '/musicmind/styles.css',
  '/musicmind/app.js',
  '/musicmind/instrument.config.js',
  '/musicmind/components/timer.js',
  '/musicmind/components/chat.js',
  '/musicmind/components/calendar.js',
  '/musicmind/components/theory.js',
  '/musicmind/components/rhythm.js',
  '/musicmind/components/score.js',
  '/musicmind/utils/storage.js',
  '/musicmind/utils/date.js',
  '/musicmind/utils/api.js',
  '/musicmind/pwa/manifest.json',
  '/musicmind/icons/icon-192.png',
  '/musicmind/icons/icon-512.png',
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
            return caches.match('/musicmind/index.html');
          }
        });
    })
  );
});
