const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
for (const p of ["web/manifest.webmanifest", "platforms/desktop/package.json", "platforms/mobile/package.json"]) JSON.parse(read(p));
const html = read("web/index.html");
for (const asset of ["manifest.webmanifest", "styles.css", "app.js", "native-bridge.js", "assets/storyspace-icon.svg"]) if (!html.includes(asset)) throw new Error("Missing HTML reference: " + asset);
if (!html.includes('rel="manifest"')) throw new Error("PWA manifest not linked");
if (!read("web/sw.js").includes("CACHE_NAME")) throw new Error("Service worker cache missing");
if (!read("web/sw.js").includes("native-bridge.js")) throw new Error("Native bridge missing from offline cache");
const mobile = JSON.parse(read("platforms/mobile/package.json"));
for (const plugin of ["@capacitor/app", "@capacitor/haptics", "@capacitor/network", "@capacitor/status-bar", "@capacitor/keyboard", "@capacitor/splash-screen", "@capacitor/android", "@capacitor/ios"]) if (!mobile.dependencies[plugin]) throw new Error("Missing Capacitor dependency " + plugin);
if (!read("platforms/mobile/capacitor.config.ts").includes("SplashScreen")) throw new Error("Native splash config missing");
if (!mobile.devDependencies.typescript) throw new Error("TypeScript dependency is required to load capacitor.config.ts");
const desktop = JSON.parse(read("platforms/desktop/package.json"));
if (!desktop.devDependencies["electron-builder"] || !desktop.scripts.dist) throw new Error("Desktop package scripts are missing");
if (!desktop.build.extraResources?.some(resource => resource.from === "../../web")) throw new Error("Desktop build must bundle the shared web client");

const { execFileSync } = require("node:child_process");
const os = require("node:os");
const nativeBridgePath = path.join(root, "web", "native-bridge.js");
execFileSync(process.execPath, ["--check", nativeBridgePath], { stdio: "pipe" });
execFileSync(process.execPath, ["--check", path.join(root, "web", "sw.js")], { stdio: "pipe" });

const tvScript = path.join(__dirname, "android-tv", "prepare-android-tv.js");
if (!fs.existsSync(tvScript)) throw new Error("Android TV manifest setup script missing");
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "storyspace-tv-manifest-"));
try {
  const manifestPath = path.join(fixtureRoot, "app", "src", "main", "AndroidManifest.xml");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, \`<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:label="Storyspace">
    <activity android:name=".MainActivity" android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>\`);
  execFileSync(process.execPath, [tvScript, fixtureRoot], { stdio: "pipe" });
  execFileSync(process.execPath, [tvScript, fixtureRoot], { stdio: "pipe" });
  const manifest = fs.readFileSync(manifestPath, "utf8");
  const banner = path.join(fixtureRoot, "app", "src", "main", "res", "drawable", "storyspace_tv_banner.xml");
  if (!manifest.includes('android:name="android.software.leanback"')) throw new Error("Android TV leanback feature missing");
  if (!manifest.includes('android.intent.category.LEANBACK_LAUNCHER')) throw new Error("Android TV launcher category missing");
  if (!manifest.includes('android:banner="@drawable/storyspace_tv_banner"') || !fs.existsSync(banner)) throw new Error("Android TV banner missing");
  if ((manifest.match(/android.intent.category.LEANBACK_LAUNCHER/g) || []).length !== 1) throw new Error("Android TV manifest setup is not idempotent");
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("PWA + native mobile + desktop configuration checks passed.");