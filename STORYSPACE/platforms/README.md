# Storyspace multi-platform development

## Cross-platform strategy
- **Web / PWA:** installable web client, offline shell cache, responsive layouts.
- **Windows/macOS/Linux:** Electron wrapper scaffold using the shared web client.
- **iOS / Android:** Capacitor scaffold; native project generation/signing is SDK-dependent.
- **Android TV / Google TV:** native TV app integration milestone; web fallback includes D-pad navigation.
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
```bash
cd STORYSPACE/platforms/desktop
npm install
npm start
```
Developer wrapper only; release installers need platform-specific packaging, signing, and notarization.

## Mobile app polish milestone
The mobile shell now includes native plugin setup for app lifecycle/back handling, haptic taps, connectivity monitoring, status bar, splash screen, keyboard resize, safe-area padding, and bottom tab navigation on narrow screens. Browser fallback remains active without native plugins.

## Mobile packaging
```bash
cd STORYSPACE/platforms/mobile
npm install
npx cap add android
npx cap add ios
npx cap sync
```
Android requires Android Studio/SDK. iOS requires macOS/Xcode, Apple signing, and review.

## TV
Android TV needs Android Studio/emulator validation. tvOS requires macOS/Xcode and provisioning. PlayStation SDK/certification is restricted by Sony.