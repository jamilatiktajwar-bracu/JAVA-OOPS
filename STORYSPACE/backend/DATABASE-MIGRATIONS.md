# Database migration and production configuration

Flyway versioned migrations create and evolve the Storyspace schema. The initial migration is designed for PostgreSQL and H2.

## Local development
H2 is still the default. Flyway runs during startup; Hibernate `update` is retained for local iteration.

```bash
cd STORYSPACE/backend
mvn -B test
mvn spring-boot:run
```

## Production PostgreSQL
Set the following environment variables on a managed PostgreSQL deployment:
- `DATABASE_URL=jdbc:postgresql://HOST:5432/storyspace`
- `DATABASE_USER` and `DATABASE_PASSWORD`
- `DATABASE_DRIVER=org.postgresql.Driver` (optional)
- `JPA_DDL_AUTO=validate` (**never** use Hibernate schema update in production)
- `FLYWAY_ENABLED=true`
- `TOKEN_SECRET`: securely generated random secret of 32+ characters
- `CORS_ALLOWED_ORIGINS`: exact production origins

Use TLS/private networking, backups with point-in-time recovery, and a staged migration rollout. Flyway scripts live at `src/main/resources/db/migration`. Never edit a migration already applied in an environment; add a new version.

## Existing databases
The default baseline version is 0, so V1 runs on a non-empty schema after baseline. If an existing Hibernate-created production database already has these tables, **back it up and compare schema first**; only then the default `FLYWAY_BASELINE_VERSION=1` baseline skips V1. Reconcile missing/changed columns before setting Hibernate to `validate`. Do not baseline blindly.

## Verification
Maven tests boot against H2 and assert Flyway history and core tables. Before deployment, run migrations and integration tests against a disposable PostgreSQL instance too.
