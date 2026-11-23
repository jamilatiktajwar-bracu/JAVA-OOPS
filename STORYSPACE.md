# Storyspace product direction

Storyspace is the provisional name for an independent adaptive story-discovery / streaming platform. It is not a competitor clone, and the brand is not cleared yet.

## Product layers
- **Adaptive web UI:** mood/genre/language onboarding, local signals, daily featured rotation, profile and saved-list.
- **Java API:** Spring Boot REST, authentication, account preference profiles, catalog, recommendation scoring, personal library, demo subscriptions, admin catalog/metrics, preview-access endpoints.
- **Persistence:** local H2 database for development.
- **Legacy coursework:** existing console OOP files are preserved on the prior branch for reference; this product foundation is additive.

## Start backend
```bash
cd NETFLIX/platform-backend
mvn spring-boot:run
```
Open `NETFLIX/web/index.html`. API health: `http://localhost:8080/api/health`.

## Admin bootstrap
Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before launching. Do not commit credentials. For deployment set a long random `TOKEN_SECRET` (32+ characters), restrict CORS origins, use a production database and TLS.

## Implemented API
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/profile`, `PUT /api/profile/preferences`
- `GET /api/catalog`, `/featured`, `/for-you`, `/search?q=`
- `GET /api/library`, `PUT/DELETE /api/library/{titleId}`, progress and rating updates
- `GET /api/subscriptions/plans`, `/me`, `POST /activate`, `/cancel` (demo only)
- `GET /api/media/{titleId}/preview`, `/playback` (sample / access-control placeholder)
- `POST/DELETE /api/admin/catalog`, `GET /api/admin/metrics` (admin role)

## Recommendation signals
Genre, mood, language preferences, community score, featured/original status, recent interaction counts, completed titles and discovery-balance mode.

## Still needed before production
Licensed media contracts, real media ingest/transcoding/CDN delivery, DRM, production database migrations, verified email, password recovery, token revocation/rotation, rate limits, security review, privacy/terms, consent and retention controls, actual billing-provider integration, refund/cancellation rules, audit trails, moderation, backups, monitoring, accessibility testing, and brand/IP clearance.
