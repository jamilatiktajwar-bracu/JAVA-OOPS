# Storyspace multi-platform development

See [STATUS.md](STATUS.md) for the current platform matrix and remaining release blockers.

## Cross-platform strategy
- **Web / PWA:** installable web client, offline shell cache, responsive layouts.
- **Windows/macOS/Linux:** Electron wrapper scaffold using the shared web client.
- **iOS / Android:** Capacitor shells; native project generation and signing are SDK-dependent.
- **Android TV / Google TV:** the Android APK receives optional Leanback launcher metadata/banner and D-pad navigation. Emulator and physical-TV QA remain pending.
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
The mobile shell includes native plugin setup for app lifecycle/back handling, haptic taps, connectivity monitoring, status bar, splash screen, keyboard resize, safe-area padding, and bottom tab navigation on narrow screens. The Android TV launcher metadata is applied during the Android CI build; D-pad navigation activates TV mode on native Android devices.

## API endpoint for packaged builds

Set the GitHub repository variable `STORYSPACE_API_ROOT` to the absolute HTTPS API base URL before creating a connected mobile or desktop build. The workflows write this value into the CSP-compatible `storyspace-api-root` meta tag before packaging. If it is unset, native sign-in remains explicitly unavailable rather than sending requests to the WebView's local origin. Do not put credentials in this variable.

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

## iOS simulator build
A GitHub Actions workflow generates and builds an unsigned iOS Simulator app:
- Workflow: `.github/workflows/storyspace-ios.yml`
- After success, download the `storyspace-ios-simulator` artifact.
- This is a simulator app archive, not a signed iPhone/iPad IPA.

Local generation:
```bash
cd STORYSPACE/platforms/mobile
npm install
npx cap add ios
npx cap sync ios
```
Requires macOS/Xcode. Real-device distribution requires Apple signing/provisioning, device QA, and review.

## Signed release artifacts

- Android signed Play Store App Bundle: see [ANDROID-RELEASE.md](ANDROID-RELEASE.md) and the manual `Storyspace Android Signed AAB` workflow. Requires a user-provided keystore and password secrets.
- iOS signed IPA: see [IOS-RELEASE.md](IOS-RELEASE.md) and the manual `Storyspace iOS Signed IPA` workflow. Requires an Apple Distribution P12, App Store provisioning profile, and Team ID secrets.

Neither workflow publishes an app to an app store. A signed build must still pass device QA and store review.

## TV
Android TV needs Android Studio/emulator validation. tvOS requires macOS/Xcode and provisioning. PlayStation SDK/certification is restricted by Sony.
## Device QA checklist

Use [DEVICE-QA.md](DEVICE-QA.md) to execute and record manual Android phone, iOS Simulator, accessibility, player, performance, and Android TV/D-pad checks. A green CI build does not count as physical-device QA.
