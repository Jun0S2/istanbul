const CACHE = "istanbul-2026-v3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Firestore 실시간 채널은 절대 가로채지 않는다
const SKIP = /firestore\.googleapis\.com|identitytoolkit|securetoken|googleapis\.com\/google\.firestore/;

self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (e.request.method !== "GET" || SKIP.test(url)) return;

  // Firebase SDK(gstatic) 는 런타임 캐시 — 첫 온라인 로드 후 오프라인에서도 뜸
  if (url.includes("gstatic.com/firebasejs")) {
    e.respondWith(
      caches.match(e.request).then(hit => hit ||
        fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        }).catch(() => hit))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then(hit => hit || fetch(e.request).catch(() => caches.match("./index.html")))
  );
});
