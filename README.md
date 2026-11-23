# Storyspace

An original, adaptive story-discovery platform prototype built with a responsive web interface and Java backend.

## Quick start
1. Start API: `cd STORYSPACE/backend && mvn spring-boot:run`.
2. Open `STORYSPACE/web/index.html` in your browser.
3. Create an account, choose genres/moods/languages, and watch your feed personalize.

## Components
- **Frontend:** Vanilla HTML/CSS/JS, adaptive recommendations, local guest preferences, optional account sync.
- **API:** Java 17 + Spring Boot.
- **Database:** H2 local persistent development database.
- **Accounts:** BCrypt password hashing + signed bearer tokens.
- **Library:** Per-account saved titles, watch progress, ratings.
- **Catalog:** Fictional seed data and personal feed endpoint.
- **Membership:** Demo plan activation/cancellation—no payment.
- **Admin:** Environment-bootstrap admin role, catalog create/delete and metrics.
- **Media:** CC0 sample preview only; actual content delivery is not connected.

## Useful links
- [Product README](STORYSPACE/README.md)
- [Frontend README](STORYSPACE/web/README.md)
- [Backend README](STORYSPACE/backend/README.md)
- [Release/legal checklist](STORYSPACE/LEGAL-AND-RELEASE.md)
- [Archived coursework](archive/java-oop)

## Development and security
Configure `TOKEN_SECRET` (32+ characters), `BOOTSTRAP_ADMIN_EMAIL`, and `BOOTSTRAP_ADMIN_PASSWORD` through environment variables. Never commit secrets. For production use strict CORS, TLS, a production database, migration tooling, rate limits, security review, logging, backups and monitoring.

## Prototype boundaries
This is not production streaming. It has no licensed media catalog, DRM, transcoding/CDN, payment gateway, account verification/recovery, production token revocation, or legal/IP clearance. Storyspace is a working name and is not trademark-cleared. See the release checklist before commercial use.
