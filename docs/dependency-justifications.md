# Dependency Justifications

## Phase 1.3 testing

- `vitest`: unit test runner that fits the Vite/React toolchain and runs quickly in watch mode.
- `@vitejs/plugin-react`: React transform support for Vitest component tests.
- `jsdom`: browser-like DOM environment for React component tests.
- `@testing-library/react`: user-centered React component testing utilities.
- `@testing-library/jest-dom`: accessible DOM matchers for clearer assertions.
- `@testing-library/user-event`: realistic keyboard and pointer interactions in unit tests.
- `msw`: request mocking for networked client/server boundaries without hardcoded fetch shims.
- `@playwright/test`: critical path browser smoke tests for the Next.js app.

## Phase 1.5 observability

- `@sentry/nextjs`: official Sentry SDK for Next.js client, server, and edge error capture.
- `posthog-js`: product analytics client with React provider support for page views and future events.
- `pino`: structured JSON server logging with low overhead and redaction support.

## Phase 2.1 database schema

- `drizzle-orm`: typed Postgres schema and query foundation for the real CreatorLink data model.
- `@neondatabase/serverless`: Neon Postgres driver for the locked production stack.
- `drizzle-kit`: migration generation and Drizzle Studio tooling for schema lifecycle work.

## Phase 4 API foundation

- `@trpc/server`: type-safe server router and procedure layer for the app API.
- `@trpc/client`: browser/RSC client transport for tRPC calls.
- `@trpc/react-query`: React bindings that connect tRPC procedures to TanStack Query.
- `@tanstack/react-query`: client-side query cache, loading state, and mutation orchestration.
- `superjson`: shared transformer so tRPC can safely serialize dates and richer values.
- `svix`: Clerk webhook signature verification dependency used by `/api/webhooks/clerk`.
- `@upstash/redis`: serverless Redis REST client for request quota storage.
- `@upstash/ratelimit`: sliding-window limiter used by tRPC read/write/AI procedure tiers.

## Auth UI

- `@clerk/themes`: official Clerk appearance themes used by the shared login, signup, and app user menu styling.

## Billing

- `stripe`: official Stripe SDK used for Checkout session creation, Customer Portal sessions, and webhook signature verification.
