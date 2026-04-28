# Continuous Integration

Phase 1.4 adds GitHub Actions coverage for the foundation gate.

## Pull requests

Every pull request targeting `main` runs:

1. Install dependencies with `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test`
5. `pnpm build`
6. `pnpm exec playwright install --with-deps chromium`
7. `pnpm test:e2e`

## Main branch preview deploy

Pushes to `main` run the same verification job first. If these repository
secrets are configured, the workflow also deploys a Vercel preview:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

If the secrets are missing, the deploy job exits successfully with a notice so
open-source contributors can still run CI without access to deployment secrets.
