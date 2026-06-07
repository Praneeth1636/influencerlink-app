# Terrace · Deploy Checklist

End-to-end walkthrough from "works on localhost" to "live on a real domain with real users". Follow in order — every step has a one-line verification command at the end so you know it's wired.

---

## 0. Prereqs

- A registered domain (Namecheap, Cloudflare Registrar, Porkbun, etc.)
- A Vercel account
- A GitHub repo for this codebase (Vercel imports from GitHub)
- An hour, uninterrupted

---

## 1. Environment variables

The codebase reads these. Keep `.env.example` as placeholders only; never paste real Neon, Clerk, Stripe, Resend, OAuth, or encryption credentials into the repo.

| Variable                                              | Required | Where it comes from                                          |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`                                        | MVP      | Neon dashboard → pooled connection string                    |
| `DIRECT_URL`                                          | deploy   | Neon dashboard → direct/non-pooled URL for migrations        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`                   | MVP      | Clerk dashboard → API keys                                   |
| `CLERK_SECRET_KEY`                                    | MVP      | Clerk dashboard → API keys                                   |
| `ENCRYPTION_KEY`                                      | MVP      | `openssl rand -hex 32` (32-byte hex)                         |
| `NEXT_PUBLIC_APP_URL`                                 | prod     | `https://terrace.app` (your live URL)                        |
| `CLERK_WEBHOOK_SECRET`                                | prod     | Clerk → Webhooks (set up below)                              |
| `CRON_SECRET`                                         | prod     | `openssl rand -hex 32` — for protecting cron endpoints       |
| `STRIPE_SECRET_KEY`                                   | payments | Stripe dashboard → API keys (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                  | payments | Stripe → API keys                                            |
| `STRIPE_WEBHOOK_SECRET`                               | payments | Stripe webhook listener (set up below)                       |
| `RESEND_API_KEY`                                      | email    | Resend → API keys                                            |
| `EMAIL_FROM`                                          | email    | `hello@terrace.app` (after domain verified in Resend)        |
| `EMAIL_REPLY_TO`                                      | email    | `support@terrace.app`                                        |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY` / `R2_SECRET`       | uploads  | Cloudflare R2 bucket credentials                             |
| `R2_BUCKET` / `R2_PUBLIC_BASE_URL`                    | uploads  | Cloudflare R2 bucket name + public asset base URL            |
| `INSTAGRAM_APP_ID` / `_SECRET` / `_REDIRECT_URI`      | optional | Meta for Developers → App                                    |
| `TIKTOK_CLIENT_KEY` / `_SECRET` / `_REDIRECT_URI`     | optional | TikTok for Developers                                        |
| `YOUTUBE_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI`     | optional | Google Cloud Console → OAuth credentials                     |
| `OPENAI_API_KEY`                                      | optional | Semantic creator/job embeddings; falls back to local model   |
| `VOYAGE_API_KEY`                                      | optional | Semantic creator/job embeddings alternative                  |
| `USE_LOCAL_EMBEDDER`                                  | optional | Set `true` to force deterministic local embeddings           |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN`                   | optional | Rate limiting & caching                                      |
| `SENTRY_DSN`                                          | optional | Server-side Sentry capture                                   |
| `NEXT_PUBLIC_SENTRY_DSN`                              | optional | Sentry                                                       |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | optional | Sentry source map upload during `next build`                 |
| `NEXT_PUBLIC_POSTHOG_KEY`                             | optional | PostHog                                                      |
| `LOG_LEVEL`                                           | optional | `info` / `debug`                                             |

> **Verify:** `pnpm build` exits 0. If any required var is missing the build fails fast (see `src/lib/env.ts`).

For a lean MVP deploy, set only the `MVP`, `prod`, and `deploy` rows first. Stripe, Resend, R2, OAuth, Sentry, PostHog, and Upstash can be added after the preview is live.

---

## 2. Stripe Connect

1. https://dashboard.stripe.com/test/apikeys — copy publishable + secret. Paste into `.env.local`.
2. https://dashboard.stripe.com/test/settings/connect → **Get started** → "Platform or marketplace" → **Express accounts**.
3. Fill the Connect platform profile (business name, support email, branding). Use placeholder data in test mode; you'll redo it in live mode before launch.
4. **Webhook** (set up after deploy, when you know your prod URL):
   - https://dashboard.stripe.com/test/webhooks → **Add endpoint**
   - URL: `https://terrace.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

> **Verify:** sign in as a creator → go to Settings → Payouts → click "Connect Stripe". Stripe's hosted onboarding should open. Complete with test data (any SSN like `000-00-0000`, address, etc.). On return, the creator row in DB should have `stripeAccountId` populated.

---

## 3. Resend

1. https://resend.com/api-keys → **Create API Key** → "Sending access" → all domains. Copy `re_...` into `.env.local`.
2. For dev: `EMAIL_FROM=onboarding@resend.dev` works immediately but only delivers to your own verified address.
3. For prod:
   - Resend → **Domains** → add `terrace.app`
   - Drop the 3 DNS records (SPF, DKIM, return-path) into your registrar's DNS
   - Wait 5–30 min for verification
   - Change `EMAIL_FROM` to `hello@terrace.app`

> **Verify:** trigger any email path (e.g., a brand applies → creator gets notified). Check Resend → Logs.

---

## 4. Clerk production instance

You're currently on a Clerk **development** instance (URL contains `touching-flamingo-...` or similar). Production needs a separate instance.

1. https://dashboard.clerk.com → **Create application** → name "Terrace (prod)"
2. Auth methods: enable **Email**, **Google**, optionally **Apple**.
3. **JWT template** (critical for the onboarding gate to work):
   - Clerk dashboard → JWT Templates → New template → name `default`
   - Claims:
     ```json
     {
       "metadata": "{{user.public_metadata}}"
     }
     ```
4. Copy the production publishable + secret keys → swap into Vercel env (not `.env.local`).
5. **Clerk webhook**:
   - Clerk → Webhooks → **Add endpoint**
   - URL: `https://terrace.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organizationMembership.created`
   - Copy signing secret → `CLERK_WEBHOOK_SECRET`

> **Verify:** sign up at `https://terrace.app/signup` → check Clerk dashboard → Users → your new row. Then check Neon → `users` table → your row should appear there too (webhook synced it).

---

## 5. Domain

1. Buy `terrace.app` (or whatever) from your registrar.
2. Don't change DNS yet — Vercel will give you the exact records in step 6.

---

## 6. Vercel

1. https://vercel.com/new → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. **Environment variables**: paste the MVP/prod keys from the table above. Use a separate production Neon database or branch rather than copying your local `DATABASE_URL`.
4. Deploy. First build will take 4–8 minutes.
5. After it's green: Vercel → Project → Settings → Domains → add `terrace.app`.
6. Vercel shows the DNS records to add at your registrar:
   - Root: `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`
7. Wait 5–30 min for DNS propagation. Vercel auto-issues a Let's Encrypt cert.

> **Verify:** `curl -I https://terrace.app` returns `HTTP/2 200`.

---

## 7. Post-deploy: smoke test

Run through this on the live URL. Anything that fails, fix before announcing.

Core MVP:

- [ ] Visit `/` — landing renders
- [ ] `/signup` → create test account → onboarding flow → land on `/feed`
- [ ] Sign out → land on `/` with signed-out nav
- [ ] `/login` → sign back in → land on `/feed`
- [ ] `/feed` renders creator posts without a 500
- [ ] `/search` renders creator discovery without a 500
- [ ] `/ranks` renders category leaderboards without a 500
- [ ] `/profile/sararivera` or another seeded creator profile renders without a 500
- [ ] As brand (second account): post a brief → it appears in `/jobs`
- [ ] As creator: apply to the brief → brand sees the application

Payments/email, only after Stripe + Resend are configured:

- [ ] As brand: hire the creator → escrow checkout (Stripe Connect) → use card `4242 4242 4242 4242`
- [ ] As creator: see "Paid" on the brief → confirm Stripe payout was queued (in test mode it'll be instant)
- [ ] Check Resend logs — at least one transactional email landed

---

## 8. Optional: platform OAuth

These take **weeks** of platform review. Don't gate launch on them.

- **Instagram**: https://developers.facebook.com → My Apps → Create App → "Consumer" → add **Instagram Basic Display** → configure OAuth redirect → submit for App Review (`instagram_basic` scope). Review: 1–4 weeks.
- **TikTok**: https://developers.tiktok.com → register → create app → add Login Kit → submit for review. Review: 1–2 weeks.
- **YouTube**: https://console.cloud.google.com → new project → enable **YouTube Data API v3** → OAuth consent screen → scopes (`youtube.readonly`) → verify domain → submit for verification (only required for >100 users). Pre-verification works for testing.

The OAuth start/callback routes already exist at `/api/auth/instagram/*`, `/api/auth/tiktok/*`, and `/api/auth/youtube/*`. Until platform API review is complete, the scheduled social-content sync uses deterministic demo media so feed rendering and upsert behavior can be tested without claiming live platform ingestion.

---

## 9. Reference: demo vs production AI/social behavior

- Leave `USE_LOCAL_EMBEDDER=true` in development when you want repeatable, no-cost matching.
- For production semantic ranking, set `OPENAI_API_KEY` or `VOYAGE_API_KEY` and leave `USE_LOCAL_EMBEDDER` unset.
- Social OAuth can be configured before platform approval, but live media ingestion depends on replacing the deterministic fetcher in `src/server/services/social-content-service.ts` with approved platform API calls.

Do not list removed variables such as `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `ALGOLIA_APP_ID`, `INNGEST_EVENT_KEY`, `YOUTUBE_API_KEY`, or `INFLUENCERLINK_DB_PATH` in production configuration unless the code imports them again.
