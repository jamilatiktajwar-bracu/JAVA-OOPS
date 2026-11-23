const CACHE_PREFIX = "storyspace-";
const SHELL_CACHE = "storyspace-shell-v2";
const RUNTIME_CACHE = "storyspace-runtime-v2";
const SHELL = [
  "./", "./index.html", "./styles.css", "./app.js", "./native-bridge.js",
  "./manifest.webmanifest", "./assets/storyspace-icon.svg"
];
const MAX_RUNTIME_ENTRIES = 80;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function trimRuntimeCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_RUNTIME_ENTRIES) {
    await Promise.all(keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES).map(key => cache.delete(key)));
  }
}

async function updateRuntimeCache(request, response) {
  if (!response || !response.ok || response.type !== "basic") return;
  if (response.headers.get("Cache-Control")?.toLowerCase().includes("no-store")) return;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  await trimRuntimeCache(cache);
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache authenticated API responses or other dynamic application data.
  if (url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        const shell = await caches.open(SHELL_CACHE);\n        return (await shell.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith((async () => {
      const runtime = await caches.open(RUNTIME_CACHE);\n      const shell = await caches.open(SHELL_CACHE);\n      const cached = await runtime.match(request) || await shell.match(request);
      const refresh = fetch(request).then(response => updateRuntimeCache(request, response).then(() => response));
      if (cached) {
        event.waitUntil(refresh.catch(() => {}));
        return cached;
      }
      try { return await refresh; }
      catch { return (await runtime.match(request)) || (await shell.match(request)) || Response.error(); }
    })());
  }
});
