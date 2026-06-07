# Terrace Launch Handoff

Use this after the repo checks pass. These are the steps that need account/dashboard access.

## Required For MVP

1. Create or choose a production Neon database.
   - Set `DATABASE_URL` to the pooled connection string.
   - Set `DIRECT_URL` to the direct/non-pooled connection string.

2. Create a production Clerk app.
   - Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
   - Set `CLERK_SECRET_KEY`.
   - Add webhook endpoint: `https://YOUR_DOMAIN/api/webhooks/clerk`.
   - Subscribe to `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organizationMembership.created`.
   - Set `CLERK_WEBHOOK_SECRET`.

3. Generate secrets.
   - `ENCRYPTION_KEY`: `openssl rand -hex 32`
   - `CRON_SECRET`: `openssl rand -hex 32`

4. Set the live app URL.
   - `NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN`

5. Import the repo into Vercel.
   - Framework: Next.js.
   - Package manager: pnpm.
   - Add the required env vars above.
   - Deploy preview first, then production.

6. Run database setup against prod.
   - `pnpm db:migrate`
   - Optional demo data: `pnpm db:seed`

## Add After Core MVP Works

- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Resend: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`
- Cloudflare R2 uploads: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
- Observability: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`
- Platform OAuth: Instagram, TikTok, YouTube redirect/client secrets
