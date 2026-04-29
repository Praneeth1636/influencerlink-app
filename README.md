# CreatorLink

CreatorLink is a professional network for creators and the brands that hire them. The product model is LinkedIn-shaped, but creator-native: profiles are built around verified reach and engagement, the feed is for creator wins and content drops, and brand teams search, message, and post briefs from their own portal.

## Current Status

The repo has moved past the static prototype foundation and now has the backend architecture needed for the real product:

- Phase 1 foundation: pnpm, TypeScript strict mode, ESLint, Prettier, Husky, commitlint, Vitest, Playwright, CI, Sentry, PostHog, and pino.
- Phase 2 database: Drizzle schema for users, creators, brands, platforms, metrics, feed posts, follows, jobs, messages, notifications, billing, reports, audit logs, and pgvector creator embeddings.
- Phase 3 auth: Clerk webhook support, onboarding schemas/actions, RBAC helpers, and guarded server-side role checks.
- Phase 4 API foundation: tRPC, TanStack Query provider, Zod inputs, domain routers, audit logging, rate limiting, structured error handling, and direct caller tests.
- Current bridge work: `/feed` now consumes tRPC creator and post queries through TanStack Query with loading, empty, offline, and live states while preserving demo fallback data until seed data is available.
- Current data work: deterministic Drizzle seed data can populate 50 creators, 10 brands, and 100 posts for local product testing.
- Current profile work: `/profile/[handle]` renders public creator profiles from tRPC with aggregate metrics, connected platforms, and creator posts.
- Current brand work: `/company/[slug]` renders public brand pages from tRPC with team members, brand posts, and open jobs.
- Current discovery work: `/search` renders creator discovery with keyword, niche, reach, and availability filters.

## Stack

- Next.js 15 App Router, React 19, TypeScript strict
- Tailwind CSS v4 and shadcn-style primitives
- Drizzle ORM with Neon Postgres and pgvector
- Clerk auth and organizations
- tRPC and TanStack Query
- Stripe, R2, Supabase Realtime, Inngest, Anthropic, Resend, Sentry, PostHog, and Algolia planned through the locked architecture

## Local Development

```bash
pnpm install
pnpm dev
```

With a configured Neon/Postgres database:

```bash
pnpm db:migrate
pnpm db:seed
```

For local builds without all production integrations configured:

```bash
SKIP_ENV_VALIDATION=true pnpm build
```

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
SKIP_ENV_VALIDATION=true pnpm build
SKIP_ENV_VALIDATION=true pnpm test:e2e
```

## Useful Docs

- [Product blueprint](docs/product-blueprint.md)
- [Setup notes](docs/setup.md)
- [Database notes](docs/database.md)
- [CI notes](docs/ci.md)
- [Observability notes](docs/observability.md)
- [Dependency justifications](docs/dependency-justifications.md)

## Next Build Areas

1. Run the seed against the shared Neon database once credentials are configured.
2. Replace remaining prototype-only data on jobs and messaging screens.
3. Move routes into the locked `src/app/(marketing)`, `src/app/(auth)`, and `src/app/(app)` structure.
4. Build the full feed composer and post interaction loop.
