(() => {
  const cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const platform = native && cap.getPlatform ? cap.getPlatform() : "web";
  const plugin = name => cap?.Plugins?.[name];
  const bridge = {
    native, platform,
    async haptic(style = "light") {
      if (!native) return;
      try { await plugin("Haptics")?.impact?.({ style: style === "heavy" ? "HEAVY" : style === "medium" ? "MEDIUM" : "LIGHT" }); } catch {}
    async setup() {
      if (!native) return;
      try { await plugin("StatusBar")?.setStyle?.({ style: "DARK" }); } catch {}
      try { await plugin("StatusBar")?.setBackgroundColor?.({ color: "#080d1b" }); } catch {}
      try { await plugin("SplashScreen")?.hide?.(); } catch {}
      try { await plugin("Keyboard")?.setAccessoryBarVisible?.({ isVisible: false }); } catch {}
      try {
        const net = plugin("Network");
        const initial = await net?.getStatus?.();
        document.documentElement.dataset.online = initial?.connected === false ? "false" : "true";
        net?.addListener?.("networkStatusChange", state => {
          document.documentElement.dataset.online = state.connected ? "true" : "false";
          window.dispatchEvent(new CustomEvent("storyspace:network", { detail: state }));
        });
      } catch {}
      try {
        plugin("App")?.addListener?.("backButton", ({ canGoBack }) => {
          const overlays = ["playerBackdrop", "subscriptionBackdrop", "adminBackdrop", "authBackdrop", "preferencesBackdrop", "detailsBackdrop"];
          const visible = overlays.map(id => document.getElementById(id)).find(el => el && !el.hidden);
          if (visible) document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          else if (canGoBack) window.history.back();
          else plugin("App")?.exitApp?.();
        });
      } catch {}
    }
  };
  window.StoryspaceNative = bridge;
  document.addEventListener("DOMContentLoaded", () => bridge.setup());
  document.addEventListener("click", e => {
    if (native && e.target.closest("button,[role=button],.movie-card")) bridge.haptic("light");
  }, { passive: true });
})();