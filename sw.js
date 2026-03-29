const CACHE_NAME = 'ryadi-v1';
const ASSETS = [
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});

self.addEventListener('push', (e) => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=192&h=192&fit=crop',
        badge: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=96&h=96&fit=crop',
        vibrate: [200, 100, 200]
    });
});

self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.openWindow('/')
    );
});
