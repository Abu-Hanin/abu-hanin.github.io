// ==========================================
// 1) OneSignal SDK - لازم يكون في الأول
// ==========================================
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ==========================================
// 2) كود الـ PWA الخاص بتطبيقك
// ==========================================
const CACHE_NAME = 'blotrade-v32';
const urlsToCache = [
  './',
  './index.html',
  './icon-144.png',
  './icon-192.png',
  './icon-512.png'
];

// التثبيت
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// التفعيل
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// الجلب (Network First)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // ⚠️ مهم جدًا: استبعاد طلبات OneSignal من الكاش
  // عشان الإشعارات ما تتعطلش
  if (event.request.url.includes('onesignal.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
