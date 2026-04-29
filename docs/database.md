# Database

Phase 2 introduces the real Postgres data model under `src/lib/db`.

## Phase 2.1 core schema

The canonical schema lives at:

- `src/lib/db/schema.ts`

The existing prototype runtime database was moved to:

- `src/lib/prototype-db.ts`

That keeps the current demo app running while the production Drizzle schema,
migrations, seed data, and service layer come online in later Phase 2 work.

## Commands

- `pnpm db:generate` creates SQL migrations from the Drizzle schema.
- `pnpm db:migrate` applies committed migrations to the configured database.
- `pnpm db:seed` populates deterministic development data.
- `pnpm db:studio` opens Drizzle Studio.

`drizzle.config.ts` reads `DIRECT_URL` first, then falls back to
`DATABASE_URL`. A local placeholder URL exists only so migration generation can
run in development before real credentials are configured.

## Seed Data

The seed module lives at [src/lib/db/seed.ts](../src/lib/db/seed.ts). It creates
stable fixture IDs so repeated runs do not duplicate records.

Current seed coverage:

- 60 users: 50 creator accounts and 10 brand owner accounts.
- 50 creator profiles with niches, rates, profile views, availability, and verified status.
- 10 brand profiles with owner memberships.
- 150 connected creator platform rows and 150 metric snapshots.
- 50 creator aggregate rows for discovery and feed ranking.
- 100 public feed posts.
- 120 follows from brand users to creators.
- 4 starter subscription plans.

Run order for a fresh database:

```bash
pnpm db:migrate
pnpm db:seed
```

The seed script reads `DIRECT_URL` first, then `DATABASE_URL`, matching the migration config.
