#!/usr/bin/env bash
set -euo pipefail

APK="${1:-STORYSPACE/platforms/mobile/android/app/build/outputs/apk/debug/app-debug.apk}"
SCREENSHOT="${2:-/tmp/storyspace-emulator-smoke.png}"
PACKAGE="io.storyspace.app"

if [[ ! -f "$APK" ]]; then
  echo "::error::Debug APK not found: $APK"
  exit 1
fi

adb wait-for-device
adb logcat -c
adb install -r "$APK"
adb shell monkey -p "$PACKAGE" 1
sleep 12

PID="$(adb shell pidof "$PACKAGE" | tr -d '\r')"
if [[ -z "$PID" ]]; then
  echo "::error::Storyspace process did not remain alive after launch."
  adb logcat -d -t 1000
  exit 1
fi

# Simulate living-room remote arrows on the Android emulator.
adb shell input keyevent KEYCODE_DPAD_RIGHT
adb shell input keyevent KEYCODE_DPAD_DOWN
adb shell input keyevent KEYCODE_DPAD_LEFT
sleep 2

CRASH_LOG="$(adb logcat -d -t 1800 | grep -E 'FATAL EXCEPTION|Fatal signal|Process: io.storyspace.app' || true)"
if [[ -n "$CRASH_LOG" ]]; then
  echo "::error::Android crash signature detected during app/D-pad smoke test."
  printf '%s\n' "$CRASH_LOG"
  exit 1
fi

mkdir -p "$(dirname "$SCREENSHOT")"
adb exec-out screencap -p > "$SCREENSHOT"
echo "Storyspace launched, stayed alive, accepted D-pad input, and screenshot captured: $SCREENSHOT"
