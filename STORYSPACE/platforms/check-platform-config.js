const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
for (const p of ["web/manifest.webmanifest", "platforms/desktop/package.json", "platforms/mobile/package.json"]) JSON.parse(read(p));
const html = read("web/index.html");
for (const asset of ["manifest.webmanifest", "styles.css", "app.js", "native-bridge.js", "assets/storyspace-icon.svg"]) if (!html.includes(asset)) throw new Error("Missing HTML reference: " + asset);
if (!html.includes('rel="manifest"')) throw new Error("PWA manifest not linked");
if (!html.includes('name="storyspace-api-root"')) throw new Error("CSP-compatible API root setting missing");
if (!html.includes("connect-src") || !html.includes("https:")) throw new Error("CSP does not allow HTTPS API connections");
if (!read("web/sw.js").includes("SHELL_CACHE")) throw new Error("Service worker cache missing");
if (!read("web/sw.js").includes("native-bridge.js")) throw new Error("Native bridge missing from offline cache");
const mobile = JSON.parse(read("platforms/mobile/package.json"));
for (const plugin of ["@capacitor/app", "@capacitor/haptics", "@capacitor/network", "@capacitor/status-bar", "@capacitor/keyboard", "@capacitor/splash-screen", "@capacitor/android", "@capacitor/ios"]) if (!mobile.dependencies[plugin]) throw new Error("Missing Capacitor dependency " + plugin);
if (!read("platforms/mobile/capacitor.config.ts").includes("SplashScreen")) throw new Error("Native splash config missing");
if (!mobile.devDependencies.typescript) throw new Error("TypeScript dependency is required to load capacitor.config.ts");
for (const script of ["api:configure", "android:tv:prepare", "android:release:prepare"]) if (!mobile.scripts[script]) throw new Error("Missing mobile helper script " + script);
const desktop = JSON.parse(read("platforms/desktop/package.json"));
if (!desktop.devDependencies["electron-builder"] || !desktop.scripts.dist) throw new Error("Desktop package scripts are missing");
if (!desktop.build.extraResources?.some(resource => resource.from === "../../web")) throw new Error("Desktop build must bundle the shared web client");

const { execFileSync } = require("node:child_process");
const os = require("node:os");
const nativeBridgePath = path.join(root, "web", "native-bridge.js");
execFileSync(process.execPath, ["--check", nativeBridgePath], { stdio: "pipe" });
execFileSync(process.execPath, ["--check", path.join(root, "web", "sw.js")], { stdio: "pipe" });

const apiConfigScript = path.join(__dirname, "mobile", "configure-api-root.js");
if (!fs.existsSync(apiConfigScript)) throw new Error("Native API configuration script missing");
execFileSync(process.execPath, ["--check", apiConfigScript], { stdio: "pipe" });
const corsSource = read("backend/src/main/java/io/storyspace/config/CorsConfig.java");
const backendConfig = read("backend/src/main/resources/application.yml");
const backendPom = read("backend/pom.xml");
if (!backendPom.includes("<artifactId>postgresql</artifactId>")) throw new Error("PostgreSQL runtime driver missing");
if (!backendConfig.includes("DATABASE_URL") || backendConfig.includes("driver-class-name:") || !backendConfig.includes("JPA_DDL_AUTO") || !backendConfig.includes("DB_POOL_SIZE")) throw new Error("Database URL and pool settings must be environment configurable with URL-based driver detection");
const tokenService = read("backend/src/main/java/io/storyspace/security/TokenService.java");
if (corsSource.includes('List.of("*")') || corsSource.includes('setAllowedOriginPatterns')) throw new Error("CORS must use explicit origins, not wildcard patterns");
if (!backendConfig.includes("CORS_ALLOWED_ORIGINS")) throw new Error("CORS origin configuration must be environment-driven");
if (!tokenService.includes('Production must provide a unique TOKEN_SECRET.')) throw new Error("Production token secret guard missing");
const webClient = read("web/app.js");
execFileSync(process.execPath, ["--check", path.join(root, "web", "app.js")], { stdio: "pipe" });
if (!webClient.includes("storyspace-user-data")) throw new Error("User data export/import support missing");
if (!webClient.includes("storyspace.resumePoints") || !webClient.includes('playerVideo.addEventListener("timeupdate"')) throw new Error("Continue-watching progress persistence missing");
if (!webClient.includes("remoteProgressPercent") || !webClient.includes('api("/library/"+encodeURIComponent(title.apiId)+"/progress"')) throw new Error("Cross-device watch progress sync missing");
if (!webClient.includes('$("playerRestart").addEventListener("click"')) throw new Error("Player restart control missing");
if (!webClient.includes("activityPanel")) throw new Error("Recent activity panel missing");
const webHtml = read("web/index.html");
if (!webHtml.includes('class="skip-link"') || !webHtml.includes('aria-labelledby="playerTitle"')) throw new Error("Skip navigation and player dialog labels missing");
if (!webClient.includes("beforeinstallprompt") || !webClient.includes("Add to Home Screen")) throw new Error("Cross-browser PWA install guidance missing");
if (!webClient.includes("matchesTerms&&matchesGenre&&matchesMood&&matchesLanguage&&matchesType")) throw new Error("Structured search filters missing");
if (!webClient.includes("row.replaceChildren()") || webClient.includes('row.innerHTML=`<span class="avatar"')) throw new Error("Profile details must be rendered with safe text nodes");
const serviceWorker = read("web/sw.js");
execFileSync(process.execPath, ["--check", path.join(root, "web", "sw.js")], { stdio: "pipe" });
if (!serviceWorker.includes('key.startsWith(CACHE_PREFIX)')) throw new Error("Service worker must not delete unrelated app caches");
if (!serviceWorker.includes('url.pathname.includes("/api/")')) throw new Error("Authenticated API responses must not enter the offline cache");
if (!/window\.StoryspaceTV\.enable\(\);\s*tvMode\s*=\s*true;/.test(webClient)) throw new Error("Native Android TV mode must preserve the first D-pad key");
if (!webClient.includes("event.preventDefault(); moveFocus(event.key);")) throw new Error("TV D-pad navigation handler missing");
if (!webClient.includes('new URLSearchParams(location.search).get("tv") === "1')) throw new Error("TV browser override missing");
const androidWorkflow = read("../.github/workflows/storyspace-android.yml");
if (!androidWorkflow.includes("debug-apk:") || !androidWorkflow.includes("runs-on: ubuntu-latest") || !androidWorkflow.includes("emulator-smoke:") || !androidWorkflow.includes("runs-on: macos-14") || !androidWorkflow.includes("continue-on-error: true")) throw new Error("APK build must be required while emulator smoke is isolated and non-blocking");
if (!androidWorkflow.includes("cancel-in-progress: false")) throw new Error("Android APK and emulator jobs must not be cancelled mid-build");
if (!androidWorkflow.includes("Capture emulator diagnostics")) throw new Error("Android emulator failure diagnostics step missing");
if (!androidWorkflow.includes('dump resources app/build/outputs/apk/debug/app-debug.apk')) throw new Error("Android TV banner must be verified through the APK resource table");
for (const workflowPath of ["../.github/workflows/storyspace.yml", "../.github/workflows/storyspace-desktop.yml", "../.github/workflows/storyspace-ios.yml"]) if (!read(workflowPath).includes("cancel-in-progress: true")) throw new Error("Superseded Storyspace CI runs must be cancelled");
const emulatorSmoke = path.join(__dirname, "android-tv", "emulator-smoke.sh");
if (!fs.existsSync(emulatorSmoke)) throw new Error("Android emulator smoke script missing");
execFileSync("bash", ["-n", emulatorSmoke], { stdio: "pipe" });
if (!androidWorkflow.includes("reactivecircus/android-emulator-runner@v2")) throw new Error("Android emulator launch smoke test missing from CI");
const tvScript = path.join(__dirname, "android-tv", "prepare-android-tv.js");
if (!fs.existsSync(tvScript)) throw new Error("Android TV manifest setup script missing");
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "storyspace-tv-manifest-"));
try {
  const manifestPath = path.join(fixtureRoot, "app", "src", "main", "AndroidManifest.xml");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:label="Storyspace">
    <activity android:name=".MainActivity" android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>`);
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


const releaseGradleScript = path.join(__dirname, "mobile", "prepare-release-gradle.js");
if (!fs.existsSync(releaseGradleScript)) throw new Error("Android release signing helper missing");
execFileSync(process.execPath, ["--check", releaseGradleScript], { stdio: "pipe" });

const gradleFixture = fs.mkdtempSync(path.join(os.tmpdir(), "storyspace-gradle-signing-"));
try {
  const appGradle = path.join(gradleFixture, "app", "build.gradle");
  fs.mkdirSync(path.dirname(appGradle), { recursive: true });
  fs.writeFileSync(appGradle, "android {\n    buildTypes {\n        release {\n            minifyEnabled false\n        }\n    }\n}\n");
  execFileSync(process.execPath, [releaseGradleScript, appGradle], { stdio: "pipe" });
  execFileSync(process.execPath, [releaseGradleScript, appGradle], { stdio: "pipe" });
  const gradle = fs.readFileSync(appGradle, "utf8");
  if ((gradle.match(/signingConfigs\s*\{/g) || []).length !== 1) throw new Error("Android signing config should be inserted once");
  if (!/signingConfig\s+signingConfigs\.release/.test(gradle)) throw new Error("Release build type is not configured to use the signing key");
} finally {
  fs.rmSync(gradleFixture, { recursive: true, force: true });
}

console.log("PWA + native mobile + desktop configuration checks passed.");