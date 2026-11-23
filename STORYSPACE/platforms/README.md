# Storyspace multi-platform development

## Cross-platform strategy
- **Web / PWA:** installable web client, offline shell cache, responsive layouts.
- **Windows/macOS/Linux:** Electron wrapper scaffold using the shared web client.
- **iOS / Android:** Capacitor shells; native project generation and signing are SDK-dependent.
- **Android TV / Google TV:** native TV integration milestone; web fallback includes D-pad navigation.
- **Apple TV (tvOS):** SwiftUI starter shell; API/catalog/playback integration and provisioning remain native tasks.
- **PlayStation:** browser-compatible experience is the practical starting point. Native builds require Sony partner approval, SDK access, certification, and cannot be built/tested from this repository alone.

## Shared requirements
The backend remains authoritative for profile, preferences, library, entitlement, and playback progress. Add refresh-token/session management before public release. Licensed media needs HLS/DASH, CDN, platform DRM, subtitles/audio tracks, device limits, and playback telemetry. Never embed secrets in client apps.

## Local web/PWA
Serve the web folder (service workers do not work from arbitrary file URLs):
```bash
cd STORYSPACE/web
python3 -m http.server 5173
```
Open http://localhost:5173; use browser install option if available.

## Desktop wrapper
Run the desktop shell locally:
```bash
cd STORYSPACE/platforms/desktop
npm install
npm start
```

Cross-platform package generation:
```bash
npm run dist
```
A GitHub Actions matrix builds Windows NSIS installer, macOS DMG, and Linux AppImage packages. Download the matching artifact from the `Storyspace Desktop Packages` workflow. These CI packages are unsigned development builds; Windows signing, macOS signing/notarization, and store distribution still require release credentials and validation.

## Mobile app polish
The mobile shell includes native plugin setup for app lifecycle/back handling, haptic taps, connectivity monitoring, status bar, splash screen, keyboard resize, safe-area padding, and bottom tab navigation on narrow screens. Browser fallback remains active without native plugins.

## Android debug APK
A GitHub Actions workflow automatically generates a temporary Android project, syncs Capacitor/web assets, and builds a debug APK:
- Workflow: `.github/workflows/storyspace-android.yml`
- Run manually from GitHub Actions using **Run workflow**, or trigger it by pushing relevant changes / opening a PR.
- After a successful run, download the `storyspace-android-debug` artifact from the workflow run. It contains `app-debug.apk` (debug-signed; for testing only).
- Workflow build does not create a Play Store release or signed production package.

Local build (Android SDK/JDK 21 required):
```bash
cd STORYSPACE/platforms/mobile
npm install
npm run android:generate
npm run android:build
```
APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## iOS
```bash
cd STORYSPACE/platforms/mobile
npm install
npx cap add ios
npx cap sync ios
```
Requires macOS/Xcode, Apple signing, device testing, and review for release.

## TV
Android TV needs Android Studio/emulator validation. tvOS requires macOS/Xcode and provisioning. PlayStation SDK/certification is restricted by Sony.
