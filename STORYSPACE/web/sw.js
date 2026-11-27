const CACHE_PREFIX = "storyspace-";
const SHELL_CACHE = "storyspace-shell-v85";
const RUNTIME_CACHE = "storyspace-runtime-v3";
const SHELL = [
  "./", "./index.html", "./styles.css", "./app.js", "./enhancements.css", "./enhancements.js", "./cinematic.css", "./cinematic.js",
  "./player-gestures.css", "./player-gestures.js", "./player-shortcuts.css", "./player-shortcuts.js", "./player-settings.css", "./player-settings.js", "./tv-navigation.js", "./player-next.js", "./player-mini.js", "./player-queue.js", "./player-ux.js", "./player-controls.js", "./player-resilience.js", "./player-media-info.js", "./player-playback-diagnostics.js", "./player-resilience.css", "./player-controls.css", "./interaction-polish.css", "./watch-later.css", "./watch-later.js", "./resume-hub.css", "./resume-hub.js", "./command-palette.css", "./command-palette.js", "./quick-discovery.css", "./quick-discovery.js", "./media-uploads.js", "./collections.css", "./collections.js", "./native-bridge.js",
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
        const shell = await caches.open(SHELL_CACHE);
        return (await shell.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    const runtimePromise = caches.open(RUNTIME_CACHE);
    const shellPromise = caches.open(SHELL_CACHE);
    const refresh = fetch(request).then(async response => {
      try { await updateRuntimeCache(request, response); } catch { /* Cache quota must not block a network response. */ }
      return response;
    });
    // Extend the service-worker lifetime before the event handler returns.
    event.waitUntil(refresh.then(() => undefined).catch(() => {}));
    event.respondWith((async () => {
      const [runtime, shell] = await Promise.all([runtimePromise, shellPromise]);
      const cached = await runtime.match(request) || await shell.match(request);
      if (cached) return cached;
      try { return await refresh; }
      catch { return (await runtime.match(request)) || (await shell.match(request)) || Response.error(); }
    })());
  }
});
