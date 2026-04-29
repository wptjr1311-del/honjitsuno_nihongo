// ── 혼지쯔노 니홍고 Service Worker ──
const CACHE_NAME = 'honjitsu-nihongo-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 설치: 핵심 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {}) // 오프라인 환경에서도 설치 실패 없이 진행
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 네트워크 요청: 캐시 우선, 실패 시 네트워크
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          // 성공한 응답을 캐시에 저장
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached) // 네트워크도 실패하면 캐시 반환
      )
  );
});

// 푸시 알림 수신
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '혼지쯔노 니홍고 🇯🇵', {
      body: data.body || '오늘의 일본어 표현을 확인해보세요!',
      icon: './icon.png',
      badge: './icon.png',
      vibrate: [200, 100, 200]
    })
  );
});

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        // 없으면 새 창 열기
        return clients.openWindow('./index.html');
      })
  );
});
