# Database migration and production configuration

Flyway versioned migrations create and evolve the Storyspace schema. The initial migration is designed for PostgreSQL and H2.

## Local development
H2 remains the default database. Flyway runs at startup and owns schema creation; Hibernate defaults to `validate` so entity/schema drift fails fast instead of silently changing the database.

```bash
cd STORYSPACE/backend
mvn -B test
mvn spring-boot:run
```

For temporary local experimentation only, you may explicitly set `JPA_DDL_AUTO=update`. Do not use this setting for shared or production data.

## Production PostgreSQL
Set the following environment variables on a managed PostgreSQL deployment:
- `DATABASE_URL=jdbc:postgresql://HOST:5432/storyspace`
- `DATABASE_USER` and `DATABASE_PASSWORD`
- `JPA_DDL_AUTO=validate` (the safe default)
- `FLYWAY_ENABLED=true`
- `TOKEN_SECRET`: securely generated random secret of 32+ characters
- `CORS_ALLOWED_ORIGINS`: exact production origins

Use TLS/private networking, backups with point-in-time recovery, and a staged migration rollout. Flyway scripts live at `src/main/resources/db/migration`. Never edit a migration already applied in an environment; add a new version.

## Existing databases
Flyway baseline-on-migrate is enabled by default with baseline version 1. On a non-empty database, Flyway records that baseline and skips V1; on an empty database, V1 executes normally. **Back up and compare schema first** before baselining a Hibernate-created database. Reconcile missing/changed columns and constraints before starting with Hibernate validation. Do not baseline blindly or against an empty schema manually.

## Verification
Maven tests boot against H2 and assert Flyway history, core tables, and required constraints. CI also runs the migration and backend tests against a disposable PostgreSQL 16 service.
