// 혼지쯔노 니홍고 Service Worker v8
const CACHE = 'honjitsu-v8';

// 캐싱할 파일 목록
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 설치: 모든 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// fetch: 캐시 우선, 없으면 네트워크
// (단순하고 안정적 — 무한로딩 없음)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        })
      )
  );
});

// 푸시 알림
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '혼지쯔노 니홍고 🇯🇵', {
      body: data.body || '오늘의 일본어 표현을 확인해보세요!',
      icon: './icon.png',
      badge: './icon.png',
      vibrate: [200, 100, 200],
      tag: 'daily-study',
      renotify: true
    })
  );
});

// 알림 클릭
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        for (const c of list) {
          if ('focus' in c) return c.focus();
        }
        return clients.openWindow('./index.html');
      })
  );
});
