/* Service worker: offline-capable app shell.
   Bump VERSION whenever you deploy changes so users get fresh files. */
const VERSION = "v1";
const CACHE = "io-portfolio-" + VERSION;
const SHELL = ["./", "index.html", "pwa.js", "manifest.webmanifest", "profile.png", "school.png",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(SHELL.map(u => c.add(u).catch(() => {})))   // a missing file won't break install
  ).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k.startsWith("io-portfolio-") && k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;   // Supabase, GitHub API, fonts: always live

  // Pages: network first, fall back to cache when offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r;
    }).catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }

  // Images, certificates, scripts: serve cached copy instantly, refresh in background
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
