# Original Streaming Platform Concept + Java OOP Project

This repository contains a Java console-based streaming-service simulation and a separate original story-discovery UI concept called **STORYSPACE** (working name; trademark clearance not performed).

## Requirements
- JDK 8 or newer
- Terminal or IDE (IntelliJ IDEA / VS Code)

## Launch the UI prototype
Open [`web/index.html`](web/index.html) in a browser. Read [`web/README.md`](web/README.md) for features, limitations, and IP/asset hygiene notes. The interface is a front-end prototype and is not connected to the Java simulation/backend.

## Run the console demo
```bash
javac *.java
java NETFLIX_DEMO
```

## Run regression tests
```bash
javac *.java
java NETFLIX_SMOKE_TEST
```

Feature-focused test suites:
- `CatalogSmokeTests` — catalog lifecycle, search, filters, sorting, metadata boundaries
- `PlaybackSmokeTests` — queue recovery, sessions, offline download state
- `BillingSmokeTests` — plans, invoices/refunds, wallet defaults, promo redemption, expiry validation
- `UserFeatureSmokeTests` — review moderation, history/progress, recommendations, playlists, watch parties, health state

GitHub Actions compiles and runs smoke tests with Java 8 and Java 17.

## Main classes
| Class | Responsibility |
|---|---|
| `NETFLIX_DEMO` | Feature-focused scripted demonstration |
| `Movies` | Movie entity and compatibility facade |
| `MovieCatalog` | Catalog storage, lifecycle, search, filters, ranking, and sorting |
| `NETFLIX_USER` | Profile and personal viewing state |
| `Subscription`, `SubscriptionPlan` | Subscription and billing lifecycle |
| `PaymentMethod`, `PaymentWallet`, `PromoCode` | Payment simulation |
| `MovieReview` | Review, rating, and moderation state |
| `NetflixPlaylist`, `PlaybackQueue`, `bookmark` | Collections and playback navigation |
| `ViewingSession`, `WatchParty` | Session and group playback state |
| `OfflineDownloadManager` | Download queue and storage accounting |
| `RecommendationEngine` | Personalized recommendation logic |
| Analytics/report classes | Catalog, engagement, accessibility, and system summaries |

## Architecture
Catalog operations were extracted to `MovieCatalog`; static methods on `Movies` remain compatibility wrappers. The demo is split into feature methods and tests into focused suites. See [`ARCHITECTURE_REVIEW.md`](ARCHITECTURE_REVIEW.md).

## Limitations
- Java simulation state is in-memory and resets on exit.
- No actual media delivery or real payment processing.
- Sample values only—never put real credentials or payment details in the repository.
- This educational code is not a production streaming service.
