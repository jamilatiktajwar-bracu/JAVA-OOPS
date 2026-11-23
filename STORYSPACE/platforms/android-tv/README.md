# Android TV / Google TV support

The Android build now adds the optional Leanback feature declaration, a TV launcher category, and a landscape launcher banner to the generated Capacitor manifest. Touchscreen is marked optional, so the same debug APK can be installed on phones and TV devices.

The shared web client provides:
- D-pad spatial focus between visible buttons, links, navigation items, and story cards.
- Automatic TV presentation mode when a native Android device receives its first D-pad arrow key; the triggering key is handled immediately (regression-tested). Browser testing can force it with `?tv=1`.
- Focus is spatially moved between visible controls and story cards, and scrolls the focused item into view.
- Escape / Android Back handling for open dialogs and the player.

The build applies `prepare-android-tv.js` after Capacitor sync. The configuration smoke test runs the script against a temporary manifest twice to confirm that it is safe to re-run. APK CI verifies the Leanback launcher intent and checks the TV banner in the compiled resource table (not just the XML manifest dump). CI also launches the APK in an Android emulator, checks that the app process survives startup, sends remote-arrow key events, and captures a screenshot.

## Remaining TV validation

- [ ] Review the CI Android emulator screenshot and logs for launch/D-pad regressions.
- [ ] Install the APK on an Android TV / Google TV emulator and a physical TV device.
- [ ] Verify the launcher banner, app listing, remote D-pad focus, Select, and Back behavior.
- [ ] Check 1080p and 4K typography, focus contrast, and couch-distance readability.
- [ ] Verify Bluetooth keyboard and accessibility focus.
- [ ] Integrate Android Media3 only when authorized HLS/DASH streams and platform DRM requirements are available.

This is TV-capable Android packaging and browser-based navigation, not yet a dedicated native Leanback browse UI or streaming player.