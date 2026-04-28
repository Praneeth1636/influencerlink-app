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
- `pnpm db:studio` opens Drizzle Studio.

`drizzle.config.ts` reads `DIRECT_URL` first, then falls back to
`DATABASE_URL`. A local placeholder URL exists only so migration generation can
run in development before real credentials are configured.
