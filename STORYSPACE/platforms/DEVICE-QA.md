# Storyspace Device QA Checklist

Use this checklist with a signed-in test account and a non-production demo environment. The current Android download is a **debug APK**; the iOS workflow produces an **unsigned Simulator app**, not an installable IPA.

## Android phone — manual device test

### Install and launch
- [ ] Install the latest APK from the linked GitHub Actions artifact.
- [ ] Confirm the package installs and the Storyspace icon/name are correct.
- [ ] Launch from the launcher; confirm splash screen disappears and the home screen renders.
- [ ] Background the app for 30 seconds, return, and confirm the screen/session remains stable.
- [ ] Force-stop and relaunch; confirm saved preferences and My Universe still appear.
- [ ] Rotate portrait ↔ landscape; check for clipped navigation, dialogs, and player controls.
- [ ] Test on at least one lower-memory Android device and one current Android device.

### Login and profile
- [ ] Register a test account with a valid email and a strong password.
- [ ] Confirm invalid email and short password are rejected by client validation.
- [ ] Sign out and sign back in.
- [ ] Save genre, mood, language, and discovery-balance preferences.
- [ ] Add and remove a title from My Universe; restart and confirm persistence.
- [ ] Disable network, open the app, and verify cached/guest content remains usable.
- [ ] Restore network; verify the app does not silently discard a valid session after a temporary API outage.
- [ ] Verify an expired/invalid token asks the user to sign in again.

### Discovery, navigation, and accessibility
- [ ] Open each bottom navigation destination and use the Android system Back button.
- [ ] Search by title, genre, and partial text; clear the search and return home.
- [ ] Open and close title details using close button, backdrop, and system Back.
- [ ] Open preferences, account, membership, and admin surfaces as permitted.
- [ ] Confirm touch targets are comfortable and no text/buttons overlap at narrow widths.
- [ ] Connect a Bluetooth keyboard and test Tab, Shift+Tab, Enter, Escape, and arrow navigation.
- [ ] Enable Android large text/display scaling and verify no important controls disappear.
- [ ] Enable TalkBack and check labels, dialog announcement, and focus order.

### Player and performance
- [ ] Open the sample preview and confirm playback controls appear.
- [ ] Close the player while it is loading; verify no audio continues in the background.
- [ ] Rotate while the player is open; verify controls remain accessible.
- [ ] Test pause/resume, seek, mute/volume, and return to the catalog.
- [ ] Test Wi-Fi → mobile data → offline transitions and confirm the connection notice updates.
- [ ] Scroll every horizontal row repeatedly; check for jank, runaway memory use, and frozen gestures.
- [ ] Leave the app idle for two minutes; verify hero rotation pauses behind dialogs and when the app is backgrounded.

### Evidence and bug report
For each failure record:
- Device manufacturer/model, Android version, screen resolution, and display scale.
- APK commit SHA and installation date.
- Exact steps to reproduce and expected vs actual result.
- Screenshot or screen recording with personal information removed.
- Relevant adb logcat output around the failure.

Useful log command:

~~~bash
adb logcat -c
adb logcat | grep -iE 'storyspace|chromium|capacitor|AndroidRuntime'
~~~

## iOS Simulator
- [ ] Install/run the unsigned Simulator artifact in Xcode Simulator.
- [ ] Test login form keyboard resizing, safe areas, modal close/backdrop, and player playsinline behavior.
- [ ] Test portrait and landscape layouts, app background/foreground, and network changes.
- [ ] Do not treat Simulator success as proof of a signed iPhone IPA or physical-device compatibility.

## Android TV / living-room browser
- [ ] Open the web app in a TV browser with the query parameter tv=1.
- [ ] Navigate using only the remote D-pad and Select/Enter.
- [ ] On a native Android TV APK, press the first arrow key after launch; confirm it both activates TV mode and moves focus (regression test).
- [ ] Confirm visible focus ring, directional movement, and dialogs can be opened/closed.
- [ ] Check readable typography and card size at 1080p and 4K.
- [ ] Treat this as browser/D-pad support, not a native Android TV launcher application.

## Release gate

A CI build passing confirms the package can be generated. It does **not** confirm physical-device QA, store signing, production authentication, licensed playback, DRM, payments, subtitles, or production CDN delivery. Mark a checklist item complete only after a human tester reproduces and records the result on the target device.
