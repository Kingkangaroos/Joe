// Gamenfy — service worker (v7.3)
// Receives typed Web Push messages and shows them; tapping opens the app.
// Backward compatible: payloads without `type` remain ordinary daily pushes.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function safeAppUrl(value, fallback) {
  const url = typeof value === 'string' ? value.trim() : '';
  return /^\/(?!\/)/.test(url) ? url : fallback;
}

function normalizePushEnvelope(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const isBuilderInput = input.type === 'builder_input';
  const fallbackUrl = isBuilderInput ? '/lab.html#builder-input' : '/index.html';
  return {
    type: isBuilderInput ? 'builder_input' : 'daily',
    title: String(input.title || (isBuilderInput ? 'Gamenfy heeft je nodig' : 'Gamenfy')).slice(0, 80),
    body: String(input.body || (isBuilderInput ? 'We hebben echt je input nodig voordat we veilig verder kunnen.' : 'Close your day.')).slice(0, 220),
    url: safeAppUrl(input.url, fallbackUrl),
    requestId: typeof input.requestId === 'string' ? input.requestId.slice(0, 120) : '',
    tag: isBuilderInput ? 'gamenfy-builder-input' : 'gamenfy-daily',
  };
}

self.addEventListener('push', (event) => {
  let raw = {};
  try { raw = event.data ? event.data.json() : {}; } catch (e) {}
  const data = normalizePushEnvelope(raw);
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url, type: data.type, requestId: data.requestId },
      badge: undefined,
      tag: data.tag,
      renotify: data.type === 'builder_input',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = safeAppUrl(event.notification.data && event.notification.data.url, '/index.html');
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
