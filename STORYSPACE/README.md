# Storyspace product

An independent original streaming/discovery product concept. The working brand is provisional.

## Launch locally
```bash
cd STORYSPACE/backend
mvn spring-boot:run
```
Then open `STORYSPACE/web/index.html` in your browser. Backend health: `http://localhost:8080/api/health`.

## Adaptive UX
- Onboarding to choose genres, moods, languages and discovery balance.
- Ranking reacts to selections and recent browsing/saving, with day-based variation.
- Featured story rotates automatically.
- Guest preferences/library are stored in local browser storage.
- Sign-up/login syncs profile preferences and watchlist to the backend.
- Search supports phrase queries plus `genre:`, `mood:`, `language:`, and `type:` filters (for example: `genre:Sci-Fi type:series`). Browse results can be filtered by genre and sorted by recommendation, rating, release year, or title.
- Recent activity is available from the clock/bell control and is stored locally for the guest/device experience.
- Continue Watching now stores playback position locally, resumes the last preview, clears completed previews, and syncs progress for signed-in titles already saved to My Universe. A Restart Preview action clears the resume point.
- User data can be exported/imported as a versioned JSON file; exports deliberately exclude authentication tokens.
- Keyboard shortcuts: `/` or `Ctrl/Cmd+K` for search, `H` for Discover, `M` for My Universe, `?` for the shortcut hint, and `Esc` to close overlays.
- The profile menu exposes the browser's native PWA install prompt when available, with Add to Home Screen guidance on browsers such as iOS Safari.
- Offline shell caching is versioned and bounded, leaves unrelated origin caches untouched, and never caches API responses.

## Backend
Java 17 / Spring Boot / H2. Auth, catalog, search, personalized feed, library/progress/rating, demo memberships, role-restricted admin catalog and metrics, and preview/access-control placeholders. See `backend/README.md`.

## Admin bootstrap
Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before starting. Use a non-default 32+ character `TOKEN_SECRET` for any deployed environment. Restrict allowed CORS origins.

## Legal/release status
No trademark clearance or patentability/freedom-to-operate determination has been made. Sample titles are fictional, imagery is remote, and the preview clip is a CC0 sample. A licensed catalog, streaming pipeline, payment integration, production security/privacy, and legal documents remain future work. Read [LEGAL-AND-RELEASE.md](LEGAL-AND-RELEASE.md).


## Multi-platform starter (November 2026)
- Installable PWA manifest and cached offline shell are in `web/`.
- Living-room focus navigation is available by launching the web app with `?tv=1` (example `http://localhost:5173/?tv=1`).
- Desktop Electron, Capacitor mobile, tvOS SwiftUI, and Android TV integration scaffolds live in `platforms/`.
- Platform build, signing, device testing, licensed streaming, and store approvals remain platform-specific. See [platform guide](platforms/README.md).
