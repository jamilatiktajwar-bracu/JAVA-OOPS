# Install and build Storyspace Android

Storyspace currently ships an Android **debug APK** through GitHub Actions. This is an installable test build, not a signed production release.

## Download an APK (no computer build required)

1. Open [Android APK workflow runs](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS/actions/workflows/storyspace-android.yml).
2. Select the newest run marked **Success** (a PR run may not include an artifact if it was cancelled or failed).
3. In the run's Artifacts section, download **storyspace-android-debug**.
4. Extract the ZIP; locate `app-debug.apk`.
5. Transfer the APK to your Android phone and open it from Files/Downloads.
6. If Android asks, allow installing unknown apps **only for the file manager/browser you used**. Install, then disable that permission again if you don't need it.

If the run has no artifact, use the workflow's **Run workflow** button on the default branch, wait for a successful build, then download the artifact.

## Build locally

Prerequisites: Node.js 20+, Java 21, Android SDK (platform 35/build-tools 35.0.0), and an internet connection for dependencies.

```bash
cd STORYSPACE/platforms/mobile
npm install
npx cap add android   # only if android/ is not generated yet
node configure-api-root.js
npx cap sync android
node ../android-tv/prepare-android-tv.js "$PWD/android"
cd android
./gradlew assembleDebug
```

The APK is generated at `STORYSPACE/platforms/mobile/android/app/build/outputs/apk/debug/app-debug.apk`. On Windows, use `gradlew.bat assembleDebug`.

## Troubleshooting

- **Install blocked:** Android settings → Install unknown apps → allow for the app that opened the APK. Avoid enabling this globally.
- **App shows offline/error:** the bundled web experience can run in demo/offline mode; backend-backed sign-in and sync require a configured reachable HTTPS API. No production API host is included by default.
- **Video won't play:** sample clips depend on network/source availability. This prototype is not a licensed streaming service and does not include DRM or production media delivery.
- **Artifact expired:** workflow artifacts are retained for 14 days; run the workflow again to generate a fresh debug APK.

## Release safety

Debug APKs are not production signed. Before public release, configure a protected signing key, verify app identity/versioning, review permissions and privacy disclosures, test physical devices, and distribute through a trusted channel.
