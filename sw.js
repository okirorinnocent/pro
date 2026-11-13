/* Service worker: offline-capable app shell.
   Bump VERSION whenever you deploy changes so users get fresh files. */
const VERSION = "v9";
const CACHE = "io-portfolio-" + VERSION;
const SHELL = ["./", "index.html", "pwa.js", "manifest.webmanifest", "profile.png", "school.webp",
  "project-images/portfolio.webp", "project-images/SafeShare.webp", "project-images/pharmacy.webp",
  "project-images/casmi26.webp", "project-images/basel.webp", "project-images/waste-sorter.webp",
  "icons/icon-192.png?v=2", "icons/icon-512.png?v=2", "icons/icon-maskable-512.png?v=2", "icons/apple-touch-icon.png"];

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
  if (req.method !== "GET" || url.origin !== location.origin || /^\/admin(\.html)?$/.test(url.pathname)) return;   // Supabase, GitHub API, fonts, admin: always live
  if (req.headers.has("range")) return;                      // let the browser stream PDFs/video itself

  const isHome = url.pathname === "/" || url.pathname === "/index.html";

  // Pages: network first. ONLY the real home page is stored as the offline copy
  // (so opening a PDF or a 404 can never overwrite it).
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      if (isHome && r.status === 200 && (r.headers.get("content-type") || "").includes("text/html")) {
        const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy));
      }
      return r;
    }).catch(() => caches.match(req).then(hit => hit ||
      (isHome || !/\.[a-z0-9]+$/i.test(url.pathname) ? caches.match("index.html").then(r => r || caches.match("./")) : Response.error()))));
    return;
  }

  // Images, certificates, scripts: serve cached copy instantly, refresh in background
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => hit || Response.error());
    return hit || net;
  }));
});
