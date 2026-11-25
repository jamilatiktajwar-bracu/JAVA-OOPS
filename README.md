# Storyspace

An original adaptive story-discovery platform prototype built with a responsive web interface and Java backend.

<div align="center">

[![Build](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS/actions/workflows/ci.yml/badge.svg)](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS/actions)
[![Repo](https://img.shields.io/badge/Project-Storyspace-6d5dfc?style=for-the-badge)](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS)
[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square)](https://www.java.com/)
[![Platform](https://img.shields.io/badge/Platforms-Android%20%7C%20Web%20%7C%20Desktop-blue?style=flat-square)](https://github.com/jamilatiktajwar-bracu/JAVA-OOPS)

</div>

## ✨ Highlights
- Personalized discovery, mood-based exploration and recommendation diversity.
- Profiles, watchlists, search/filter and Continue Watching.
- Mobile player gestures, keyboard shortcuts, captions and playback preferences.
- Cinematic shelves, subtle 3D motion and reduced-motion accessibility.
- PC-hosted personal media workflow with resumable upload and connection diagnostics.\n- Smart Queue shuffle and queue-aware Up Next end-card with poster/countdown polish.
- Android build workflow and cross-platform CI.

## 🧰 Tech
- **Frontend:** Vanilla HTML/CSS/JS, adaptive recommendations, local guest preferences, optional account sync.
- **API:** Java 17 + Spring Boot.
- **Database:** H2 local persistent development database; PostgreSQL support and migrations.
- **Accounts:** BCrypt password hashing + signed bearer tokens.
- **Library:** Per-account saved titles, watch progress, ratings.
- **Catalog:** Fictional seed data and personal feed endpoint.
- **Membership:** Demo plan activation/cancellation—no payment.
- **Admin:** Environment-bootstrap admin role, catalog create/delete and metrics.
- **Media:** CC0 sample preview only; actual content delivery is not connected.

## 👀 Preview the platforms\n- [Live web app (GitHub Pages, after Pages is enabled)](https://jamilatiktajwar-bracu.github.io/JAVA-OOPS/)\n- [Responsive Phone / Tablet / Desktop showcase](https://jamilatiktajwar-bracu.github.io/JAVA-OOPS/platform-showcase.html)\n- [Platform build & QA guide](STORYSPACE/PLATFORM-SHOWCASE.md)\n\n## 🛠 Quick start
1. Start API: `cd STORYSPACE/backend && mvn spring-boot:run`.
2. Open `STORYSPACE/web/index.html` in your browser.
3. Create an account, choose genres/moods/languages, and watch your feed personalize.

## 🗂 Documentation
- [Product README](STORYSPACE/README.md)
- [Frontend README](STORYSPACE/web/README.md)
- [Backend README](STORYSPACE/backend/README.md)
- [Release/legal checklist](STORYSPACE/LEGAL-AND-RELEASE.md)

## 👩‍💻 Maintainer
**Jamil Taj** · [GitHub profile](https://github.com/jamilatiktajwar-bracu)

## 🔒 Development & security
Configure `TOKEN_SECRET` (32+ characters), `BOOTSTRAP_ADMIN_EMAIL`, and `BOOTSTRAP_ADMIN_PASSWORD` through environment variables. Never commit secrets. For production use strict CORS, TLS, a production database, migration tooling, rate limits, security review, logging, backups and monitoring.

## ⚠️ Prototype boundaries
This is not production streaming. It has no licensed media catalog, DRM, transcoding/CDN, payment gateway, account verification/recovery, production token revocation, or legal/IP clearance. Storyspace is a working name and is not trademark-cleared. See the release checklist before commercial use.

---

## 📈 Developer profile cards
These dynamically render public GitHub activity (third-party services may occasionally be unavailable):

<div align="center">

[![GitHub stats](https://github-readme-stats.vercel.app/api?username=jamilatiktajwar-bracu&show_icons=true&theme=tokyonight&hide_border=true)](https://github.com/jamilatiktajwar-bracu)
[![Top languages](https://github-readme-stats.vercel.app/api/top-langs/?username=jamilatiktajwar-bracu&layout=compact&theme=tokyonight&hide_border=true)](https://github.com/jamilatiktajwar-bracu)

[![Streak](https://streak-stats.demolab.com?user=jamilatiktajwar-bracu&theme=tokyonight&hide_border=true)](https://github.com/jamilatiktajwar-bracu)

</div>
