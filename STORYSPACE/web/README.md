# Storyspace — adaptive discovery UI

The frontend is an original, provisional story-discovery concept. It is not affiliated with a streaming competitor.

## Run
Open `index.html` for offline/demo mode. For API-backed accounts, start the Java service in `../backend` on `http://localhost:8080`.

## Adaptive features
- Taste onboarding (genres, moods, languages, discovery balance)
- Feed re-ranking from preferences and recent interactions, with daily variation
- Story choices change the recommendations; a rotating featured story cycles through ranked candidates
- Personal saved list and browser-side preference/history persistence
- Optional backend sign-in: profile, preferences, catalog, recommendations, library sync
- Membership selector (demo-only), admin creator console (role-gated), preview player
- Responsive, keyboard-friendly controls and reduced-motion support

## API mode
If the backend is running, the app can register/sign in, sync account preferences and library, fetch its catalog, and use the per-account recommendation endpoint. The backend uses a local H2 file by default. Configure the API's admin bootstrap credentials via environment variables.

## Limitations / legal preparation
- Demo data only; titles and metadata are fictional sample entries.
- Preview playback uses a CC0 sample clip, not a title's actual footage.
- No licensed catalog, full video delivery, DRM, production payment processing, or commercial readiness.
- Packaged native sign-in requires a configured absolute HTTPS API endpoint; no production API host is currently configured in this repository.
- Remote imagery requires an asset-license review and replacement/clearance for commercial use.
- Storyspace is a working name, not trademark-cleared. Brand and design clearance is not represented as completed.

## Configure the API endpoint
The client reads the API base URL in this order: window.STORYSPACE_API_ROOT (set by an approved external bootstrap script), the storyspace-api-root meta tag in index.html, then the development default. Leave the meta tag empty for local web development. Set it to /api for a same-origin deployment, or to the absolute HTTPS API base URL for a separately hosted backend/Capacitor app. Do not put API secrets in client-side configuration.


## Upgrade batch: local profiles, advanced filters, player UX

- Local profiles (up to 8) keep independent watchlists, discovery preferences, recent activity and preview resume state on this device.
- My Universe: genre filter and sort by recently saved, title, rating or year.
- Search: filter by genre, format, maturity rating and year; reset filters and result counts are available.
- Preview player: ±10-second skips, playback speed, PiP (where supported), fullscreen and shortcut hints.
- Local profiles are not backend accounts and do not sync across devices. Preview media remains sample content only.


## Playback recovery

- The preview player shows a buffering/recovery overlay for delayed media data and provides a manual retry action when a source fails.
- A prolonged `stalled` event triggers one automatic source reload after 8.5 seconds, preserving the current playback position and attempting to resume playback.
- Automatic stall recovery is rate-limited to one attempt per 25 seconds to avoid repeated reload loops. If recovery fails, the manual retry remains available.


## Player seeking safeguards

- The timeline clamps seek input to a finite, valid seek window and ignores non-numeric slider values.
- Finite VOD media seeks from zero to its duration; live/DVR media uses the latest browser-reported seekable range and labels the timeline as LIVE.
- Seek previews use the same seek window as the player, so preview time and committed seek position stay aligned.
- Pointer cancellation clears the transient seek-preview state.


## Playback diagnostics

- The player status line reports the currently decoded video dimensions, media duration/live state, and buffered seconds ahead of the playhead.
- Network and ready-state labels help distinguish loading, metadata-only, frame-ready, and buffered playback states.
- When supported by the browser, dropped-frame counters expose rendering pressure; playback-rate changes are reflected immediately.
- Diagnostics use native media element APIs and gracefully omit unsupported frame-quality details.


## Shareable playback diagnostics

- The preview player includes a **Copy diagnostics** action below the live media status.
- The report captures source origin only (not the URL path, query or fragment), playback state, dimensions, playback position/duration, buffer ahead, ready/network state, playback rate, online status, dropped-frame support/count and browser user agent.\n- Avoid sharing the browser user-agent string if you prefer not to disclose device/browser details.
- Copy uses the Clipboard API when available and a legacy selection fallback otherwise. It is user-triggered; the report is not uploaded automatically.


## Buffer health hints

- Player diagnostics classify buffering as offline, loading media, waiting for data, low buffer (<2 seconds), building buffer (2–8 seconds), or healthy buffer (8 seconds or more). Paused/ended playback is not misclassified as a low buffer.
- The hint is descriptive only; it does not change bitrate, seek position, or playback automatically.


## Keyboard seeking for live/DVR

- Keyboard seek shortcuts (Left/Right, J/L) use the latest seekable DVR window when the source is live and does not expose a finite duration.
- Seeking is clamped to the available DVR window or VOD duration; unavailable seek windows are ignored safely.


## Restart shortcut for live/DVR

- Press **R** to restart from the beginning of VOD or the earliest point in the current DVR seek window; unavailable seek windows safely ignore the action.
