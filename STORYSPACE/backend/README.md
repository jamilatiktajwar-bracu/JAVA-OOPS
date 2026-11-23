# Storyspace API foundation

Java 17 / Spring Boot REST API with H2 local persistence.

## Run
```bash
cd STORYSPACE/backend
mvn spring-boot:run
```
The API listens at `http://localhost:8080`; health check `GET /api/health`.

## Admin bootstrap
Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before startup to create the first admin account. Do not commit credentials. For deployment set a long random `TOKEN_SECRET` (32+ characters), `CORS_ALLOWED_ORIGINS` as a comma-separated exact origin allowlist (no `*`), TLS, and production database. The development defaults allow local web ports and Capacitor origins only; add your deployed web app's origin explicitly.

## Routes
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Account: `GET /api/profile`, `PUT /api/profile/preferences`
- Catalog: `GET /api/catalog`, `/featured`, `/for-you`, `/search?q=`
- Personal library: `GET /api/library`, `PUT/DELETE /api/library/{titleId}`, progress and rating PATCH
- Membership: plans, current, activate and cancel (demo only)
- Media: preview sample, playback entitlement placeholder
- Admin: catalog create/delete and metrics (role protected)

## Database configuration

H2 file storage remains the zero-setup local default. PostgreSQL is also supported by adding these environment variables in the deployment environment:

- `DATABASE_URL=jdbc:postgresql://HOST:5432/storyspace`
- `DATABASE_DRIVER=org.postgresql.Driver`
- `DATABASE_USER` and `DATABASE_PASSWORD`
- `JPA_DDL_AUTO=validate` after a reviewed schema migration has been applied
- Optional pool tuning: `DB_POOL_SIZE`, `DB_POOL_MIN_IDLE`, `DB_CONNECTION_TIMEOUT_MS`, and `DB_VALIDATION_TIMEOUT_MS`

For local development, leave `DATABASE_DRIVER` unset and H2 is selected automatically. H2 console remains disabled. The project does not yet include a production schema-migration tool, so do not switch an existing production database to `validate` until its schema has been provisioned and checked.

## Security and production gaps
Passwords are BCrypt-hashed; private routes use signed bearer tokens; admin endpoints use role checks. This foundation still needs email verification/recovery, refresh/revocation, rate limits, security review, DB migrations, production persistence, billing integration, licensed media ingest, CDN/DRM, monitoring, privacy policy and deletion controls before launch.
