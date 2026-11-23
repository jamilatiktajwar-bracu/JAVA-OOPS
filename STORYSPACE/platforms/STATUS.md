# Storyspace platform build status

This repository contains a shared web client and platform shells. The current cross-platform PRs are development milestones, not public store releases.

| Platform | Foundation | CI build | Release readiness |
| --- | --- | --- | --- |
| Web / PWA | Responsive client, manifest, offline shell | Syntax + configuration smoke checks | Needs hosted API, QA, deployment |
| Android phone | Capacitor shell, native lifecycle/network/back/haptic plugins | Debug APK workflow | Debug-signed only; physical-device QA required |
| iOS / iPadOS | Capacitor native shell | Unsigned iOS Simulator workflow | Simulator archive only; signing and device QA pending |
| Windows | Electron shell | NSIS package workflow | Unsigned developer installer |
| macOS | Electron shell | DMG package workflow | Unsigned; notarization/signing pending |
| Linux | Electron shell | AppImage package workflow | Developer package |
| Android TV / Google TV | Optional Leanback launcher metadata/banner; D-pad auto TV mode | Same Android APK includes TV launcher support | Emulator/physical TV QA and TV-specific UX pending |
| Apple TV / tvOS | SwiftUI starter | No project build pipeline yet | Native app integration and provisioning pending |
| PlayStation | Browser-first compatibility approach | No native build | Sony SDK/partner access and certification required |

## CI artifacts
- **Android:** `storyspace-android-debug` → debug APK for phone and TV sideload testing.
- **iOS:** `storyspace-ios-simulator` → unsigned simulator app archive.
- **Desktop:** `storyspace-windows`, `storyspace-macos`, and `storyspace-linux` → development packages.

Artifacts are only available for successful runs and expire after 14 days. They are not signed production releases.

## API endpoint configuration
Set the repository variable `STORYSPACE_API_ROOT` to the absolute HTTPS base URL of the deployed Storyspace API (for example, `https://api.example.com/api`). Android, iOS Simulator, and desktop build workflows inject this value into the web client before packaging. Never place API credentials or signing secrets in this variable. When it is unset, native sign-in shows a configuration message instead of attempting to call the packaged app's local WebView origin. Local web development still defaults to `http://localhost:8080/api`.

## Release blockers
1. Deploy the backend and set `STORYSPACE_API_ROOT`; finish production CORS, HTTPS, secrets, database, monitoring, backups, and deployment.
2. Complete secure session refresh/revocation, device limits, and account security before public release.
3. Integrate licensed media delivery, HLS/DASH, CDN, DRM, subtitles, and audio tracks.
4. Integrate a compliant billing provider and subscription lifecycle.
5. Configure platform signing, store accounts, review, notarization, and physical-device QA.
6. Complete Android TV, tvOS, and console-specific UX and approvals.
