# Storyspace platform preview and build status

## What this page is
Open \`web/platform-showcase.html\` in a browser to preview the **real web app** at phone, tablet, and desktop/TV viewport sizes. These are responsive web layouts in a device frame—not native OS screenshots and not proof of physical-device testing.

## Platform build targets
| Platform | Current project target | What CI build proves | What still needs hands-on QA |
|---|---|---|---|
| Web / PWA | Browser + service worker shell | Static checks and web assets | Browser matrix, offline/online behavior, actual streaming |
| Android | WebView/native bridge APK | Debug APK packaging | Install on phone, permissions, gestures, media playback |
| iOS | Simulator app build | Simulator build compiles/packages | Physical iPhone, signing, App Store readiness, playback |
| Desktop | Windows, macOS, Linux packages | CI packaging targets | Install/run each package, hardware/media compatibility |

## Prototype features
- Browse, search, genre/year/format filters, featured hero, discovery rails.
- My Universe/watchlist, local profiles and saved preferences.
- Continue Watching/resume UI and player controls.
- Caption/audio preferences, keyboard shortcuts, touch gestures and TV navigation.
- Kids/family features, queue/autoplay and demo sample video shelf as they are merged into the current main branch.
- Self-hosted media upload/streaming requires the backend host to be configured and online.

## Sample media disclaimer
The Demo Cinema clips are test/sample streams. They do not constitute a licensed commercial movie catalog. A PC-hosted media server is user-managed and needs suitable storage, bandwidth, and security.

## Downloading build artifacts
1. Open the repository's [GitHub Actions](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS/actions).
2. Select the latest successful workflow run for the target platform.
3. Download its artifact (Android APK, iOS Simulator build, or desktop package).
4. Android debug APKs may require enabling installation from the chosen file source. Do not treat debug builds as production release/signing.

**Status policy:** platform build green means the package was built by CI—not that it was installed or tested on a real device.
