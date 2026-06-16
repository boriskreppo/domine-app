// Minimalni Service Worker za PWA instalaciju
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through bez keširanja kako bi real-time Firebase radio normalno
  e.respondWith(fetch(e.request));
});
