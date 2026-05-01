// ── 혼지쯔노 니홍고 Service Worker v7 ──
const CACHE = 'honjitsu-v7';
const ASSETS = ['./manifest.json', './icon.png'];

// ── 설치: 정적 자산만 미리 캐싱 (index.html 제외 → 항상 최신 버전)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// ── 활성화: 이전 캐시 전부 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── fetch 전략
//   HTML → 네트워크 우선 (항상 최신 index.html 로드)
//   기타 → 캐시 우선 (이미지·아이콘 등)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
  }
});

// ── 푸시 알림 수신
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

// ── 알림 클릭 → 앱 포커스 or 열기
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
