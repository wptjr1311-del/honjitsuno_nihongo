// 혼지쯔노 니홍고 SW v9 — 최소화
const CACHE = 'honjitsu-v9';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request)); });
