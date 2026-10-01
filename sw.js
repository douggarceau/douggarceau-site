// Amadeus School of Drums app: works offline with pages you've visited.
var V = 'amadeus-v1';
var CORE = ['/', '/offline.html', '/manifest.webmanifest', '/assets/app-icon-192.png', '/logo.jpg', '/favicon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.headers.get('range')) return; // audio/video range requests go straight to the network
  var fresh = r.mode === 'navigate' || /\.(html|json)$/.test(u.pathname) || u.pathname.endsWith('/') || u.pathname === '/sw.js';
  if (fresh) {
    // Network first so news and pages stay current; fall back to the saved copy offline.
    e.respondWith(fetch(r).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(V).then(function (c) { c.put(r, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(r, { ignoreSearch: r.mode === 'navigate' }).then(function (m) {
        return m || (r.mode === 'navigate' ? caches.match('/offline.html') : Response.error());
      });
    }));
    return;
  }
  // Sounds, images, scripts and styles: use the saved copy, refresh it in the background.
  e.respondWith(caches.match(r).then(function (m) {
    var net = fetch(r).then(function (res) {
      if (res.ok && res.status === 200) { var copy = res.clone(); caches.open(V).then(function (c) { c.put(r, copy); }); }
      return res;
    });
    return m || net;
  }));
});
