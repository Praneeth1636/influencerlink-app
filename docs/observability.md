# Observability

Phase 1.5 wires the app for error monitoring, product analytics, and server logs.

## Sentry

Sentry initializes in the client plus two server runtime files:

- `src/instrumentation-client.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

`src/instrumentation.ts` registers server and edge instrumentation, and
`src/app/global-error.tsx` captures global React errors.

Required runtime variables already exist in `.env.example`:

- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Optional source-map upload variables for CI/deploy:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

If `SENTRY_AUTH_TOKEN` is missing, the app still builds and captures runtime
events, but source maps are not uploaded.

## PostHog

`src/components/providers/posthog-provider.tsx` initializes PostHog on the
client when `NEXT_PUBLIC_POSTHOG_KEY` exists and captures page views on route
changes.

## Server logs

`src/lib/observability/logger.ts` exports a pino logger and `routeLogger()`
helper. Logs are JSON by default and redact common secret fields.

Set `LOG_LEVEL=debug`, `info`, `warn`, or `error` to tune verbosity.
