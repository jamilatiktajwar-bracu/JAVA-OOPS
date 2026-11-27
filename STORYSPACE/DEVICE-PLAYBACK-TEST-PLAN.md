# Storyspace device playback validation

This matrix is intended for physical-device release checks. CI packaging and browser smoke tests do not substitute for a real handset/tablet run.

## Required device matrix

| Platform | Device/browser | Network transitions | Touch/seek checks |
| --- | --- | --- | --- |
| Android | Android 12+ phone, Chrome stable | Wi-Fi → airplane mode → Wi-Fi | Save offline, cold launch offline, seek in cached video, reconnect and resume |
| Android | Android tablet, Chrome stable | Wi-Fi → cellular → offline | Landscape/portrait, swipe seek, double-tap skip, vertical volume/brightness |
| iOS | iPhone, current Safari | Wi-Fi → Airplane Mode → Wi-Fi | Add to Home Screen/PWA launch, offline cache availability, background/foreground recovery |
| iPadOS | iPad, current Safari | Wi-Fi → offline → Wi-Fi | Split view/rotation, seek restoration, native control interaction |

## Pass criteria

1. Save only a complete HTTP 200 response; interrupted or partial responses must not appear as saved.
2. After force-closing the app/browser while offline, reopen and play a saved title without a network request.
3. Seek forward/backward while offline; the restored position must remain within the media's seekable range.
4. On reconnect, playback resumes at the prior position without duplicate audio, a blank frame, or an unexpected restart.
5. Quota exhaustion must preserve the currently playing title and evict only older saved entries; a failed save must show a recoverable message.
6. Touch gestures must not hijack native video controls, page scrolling outside the video, or text/input interactions. A cancelled pointer must never commit a seek.
7. Repeat the sequence at least five times per platform and record device model, OS/browser version, media size, network state, and any recovery delay.

## Evidence capture

Attach screen recordings for offline cold start, seek, reconnect, and quota recovery. Record the time from reconnect to first rendered frame and the restored playback position. Do not mark physical-device validation complete from emulator or CI results alone.
