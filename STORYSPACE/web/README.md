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
- Remote imagery requires an asset-license review and replacement/clearance for commercial use.
- Storyspace is a working name, not trademark-cleared. Brand and design clearance is not represented as completed.
