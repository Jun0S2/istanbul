const CACHE = "istanbul-2026-v4";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Firestore / 인증 실시간 채널은 절대 가로채지 않는다
const SKIP = /firestore\.googleapis\.com|identitytoolkit|securetoken/;

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = req.url;
  if (req.method !== "GET" || SKIP.test(url)) return;

  // 1) HTML 문서는 네트워크 우선 — 새 버전이 항상 먼저 뜬다
  const isDoc = req.mode === "navigate" ||
                (req.headers.get("accept") || "").includes("text/html");
  if (isDoc) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 2) Firebase SDK는 캐시 우선 + 런타임 저장 (오프라인 대비)
  if (url.includes("gstatic.com/firebasejs")) {
    e.respondWith(
      caches.match(req).then(hit => hit ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => hit))
    );
    return;
  }

  // 3) 아이콘 등 나머지는 캐시 우선
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req))
  );
});