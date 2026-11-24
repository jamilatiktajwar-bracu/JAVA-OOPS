(() => {
  const cap = window.Capacitor;
  const native = !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
  const platform = native && typeof cap.getPlatform === "function" ? cap.getPlatform() : "web";
  const plugin = name => cap?.Plugins?.[name];
  let setupStarted = false;

  const bridge = {
    native,
    platform,
    async haptic(style = "light") {
      if (!native) return;
      const impactStyle = style === "heavy" ? "HEAVY" : style === "medium" ? "MEDIUM" : "LIGHT";
      try {
        await plugin("Haptics")?.impact?.({ style: impactStyle });
      } catch {
        // Haptics are an optional enhancement; do not block navigation.
      }
    },
    async setup() {
      if (!native || setupStarted) return;
      setupStarted = true;

      try { await plugin("StatusBar")?.setStyle?.({ style: "DARK" }); } catch {}
      try { await plugin("StatusBar")?.setBackgroundColor?.({ color: "#080d1b" }); } catch {}
      try { await plugin("SplashScreen")?.hide?.(); } catch {}
      try { await plugin("Keyboard")?.setAccessoryBarVisible?.({ isVisible: false }); } catch {}

      try {
        const net = plugin("Network");
        const initial = await net?.getStatus?.();
        document.documentElement.dataset.online = initial?.connected === false ? "false" : "true";
        await net?.addListener?.("networkStatusChange", state => {
          document.documentElement.dataset.online = state.connected ? "true" : "false";
          window.dispatchEvent(new CustomEvent("storyspace:network", { detail: state }));
        });
      } catch {
        // Browser online/offline events remain as a fallback.
      }

      try {
        await plugin("App")?.addListener?.("backButton", ({ canGoBack }) => {
          const overlays = [
            "playerBackdrop",
            "subscriptionBackdrop",
            "adminBackdrop",
            "authBackdrop",
            "profilesBackdrop",
            "preferencesBackdrop",
            "modalBackdrop"
          ];
          const visible = overlays
            .map(id => document.getElementById(id))
            .find(element => element && !element.hidden);

          if (visible) {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          } else if (canGoBack) {
            window.history.back();
          } else {
            plugin("App")?.exitApp?.();
          }
        });
      } catch {
        // The platform back gesture remains available if the App plugin is absent.
      }
    }
  };

  window.StoryspaceNative = bridge;
  document.addEventListener("DOMContentLoaded", () => { void bridge.setup(); }, { once: true });

  const notice = () => document.getElementById("nativeNetworkNotice");
  window.addEventListener("storyspace:network", event => {
    const element = notice();
    if (element) element.hidden = !!event.detail?.connected;
  });
  window.addEventListener("offline", () => {
    const element = notice();
    if (element) element.hidden = false;
  });
  window.addEventListener("online", () => {
    const element = notice();
    if (element) element.hidden = true;
  });

  document.addEventListener("click", event => {
    if (native && event.target?.closest?.("button,[role=button],.movie-card")) {
      void bridge.haptic("light");
    }
  }, { passive: true });
})();