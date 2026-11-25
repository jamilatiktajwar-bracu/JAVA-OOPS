# Storyspace platform preview and build status

## Live preview (free GitHub Pages)\nAfter the repository owner enables **Settings → Pages → Build and deployment → GitHub Actions**, the web demo and showcase will be published at:\n- App: https://jamilatiktajwar-bracu.github.io/JAVA-OOPS/\n- Responsive showcase: https://jamilatiktajwar-bracu.github.io/JAVA-OOPS/platform-showcase.html\n\nA deployment workflow is included. The first deployment requires that Pages be switched to GitHub Actions in repository settings; no domain or paid hosting is required. This is a static front-end demo, so backend sign-in/media-host features need a separately configured backend.\n\n## What this page is
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
The 13 Demo Cinema entries are test/sample streams. They do not constitute a licensed commercial movie catalog. The sample entry **Tears of Steel** is identified as Blender Foundation material under CC BY 3.0; attribution must be retained when redistributed. Other sample clips should remain clearly labeled and be checked against their source terms before redistribution or commercial use. A PC-hosted media server is user-managed and needs suitable storage, bandwidth, and security.

## Downloading build artifacts
1. Open the repository's [GitHub Actions](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS/actions).
2. Select the latest successful workflow run for the target platform.
3. Download its artifact (Android APK, iOS Simulator build, or desktop package).
4. Android debug APKs may require enabling installation from the chosen file source. Do not treat debug builds as production release/signing.

**Status policy:** platform build green means the package was built by CI—not that it was installed or tested on a real device.
