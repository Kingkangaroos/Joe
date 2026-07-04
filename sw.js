// Gamenfy — service worker (v7.2)
// Receives Web Push messages and shows them; tapping opens the app.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = { title: 'Gamenfy', body: 'Close your day.', url: '/index.html' };
  try { data = Object.assign(data, event.data.json()); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url },
      badge: undefined,
      tag: 'gamenfy-daily',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
