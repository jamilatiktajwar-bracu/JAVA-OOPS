# Storyspace platform build status

This repository contains a shared web client and platform shells. The current cross-platform PRs are development milestones, not public store releases.

| Platform | Foundation | CI build | Release readiness |
| --- | --- | --- | --- |
| Web / PWA | Responsive client, manifest, offline shell | Syntax + smoke checks | Needs hosted API, QA, deployment |
| Android | Capacitor native shell/plugins | Debug APK workflow | Unsigned debug only; device QA required |
| iOS / iPadOS | Capacitor native shell | iOS Simulator workflow | Simulator build only; signing and device QA pending |
| Windows | Electron shell | NSIS package workflow | Unsigned developer installer |
| macOS | Electron shell | DMG package workflow | Unsigned; notarization/signing pending |
| Linux | Electron shell | AppImage package workflow | Developer package |
| Android TV / Google TV | Web D-pad/focus foundation | Android APK build can be emulator-tested | TV launcher metadata, remote QA, and TV-specific UI pending |
| Apple TV / tvOS | SwiftUI starter | No project build pipeline yet | Native app integration and provisioning pending |
| PlayStation | Browser-first compatibility approach | No native build | Sony SDK/partner access and certification required |

## CI artifacts
- **Android:** `storyspace-android-debug` → debug APK for sideload testing.
- **iOS:** `storyspace-ios-simulator` → unsigned simulator app archive.
- **Desktop:** `storyspace-windows`, `storyspace-macos`, and `storyspace-linux` → development packages.

Artifacts are only available for runs that finish successfully. They are not signed production releases and expire after 14 days.

## Release blockers
1. Production API deployment and configurable API URL.
2. Real streaming pipeline, licensed content, HLS/DASH, CDN, DRM, subtitles, audio tracks.
3. Session refresh/revocation, device limits, account security and production observability.
4. Billing provider integration and subscription compliance.
5. Platform-specific signing, store accounts, review, and physical-device QA.
6. TV/tvOS UX and platform-specific native integration.
