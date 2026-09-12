// Quiz-App v48 - Service Worker wird absichtlich stillgelegt.
// Diese Datei existiert nur, damit bereits registrierte alte Worker sich selbst
// aktualisieren, ihre Caches löschen und anschließend deregistrieren können.

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter(function (key) { return /^quiz-app-/i.test(key); })
        .map(function (key) { return caches.delete(key); }));
    } catch (e) {}

    try {
      await self.registration.unregister();
    } catch (e) {}

    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(function (client) {
        client.postMessage({ type: 'QUIZ_APP_SW_REMOVED' });
      });
    } catch (e) {}
  })());
});

// Bewusst kein fetch-Handler: Netzwerk/Browsercache wird direkt verwendet.
