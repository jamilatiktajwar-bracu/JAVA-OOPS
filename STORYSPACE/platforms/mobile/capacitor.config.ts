import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "io.storyspace.app",
  appName: "Storyspace",
  webDir: "../../web",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1600,
      backgroundColor: "#080d1b",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: { style: "DARK", backgroundColor: "#080d1b", overlaysWebView: false },
    Keyboard: { resize: "native", resizeOnFullScreen: true }
  }
};
export default config;