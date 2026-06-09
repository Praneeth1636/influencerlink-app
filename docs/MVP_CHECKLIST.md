# Terrace MVP Readiness Checklist

Use this as the 24-hour launch tracker. Keep `docs/DEPLOY.md` for deployment mechanics.

## Product Routes

- [ ] `/feed`: creator social feed loads on desktop and mobile with platform source, media, and engagement actions
- [ ] `/profile/[handle]`: public creator profile shows posts, stats, social links, followers/following/posts, and brand snapshot
- [ ] `/search`: brand creator search loads with filters for niche, platform, reach, engagement, growth, and audience
- [ ] `/ranks`: category leaderboards load
- [ ] `/jobs`: creator gigs board loads
- [ ] `/jobs/new`: brand gig form can publish in local demo and authenticated brand mode
- [ ] `/messages`: message list and thread routes render
- [ ] `/notifications`: notification list renders
- [ ] `/settings`: settings landing renders

## Role Behavior

- [ ] Creator sidebar focuses on Feed, Gigs, Ranks, Search, Messages, Notifications, Profile, Settings
- [ ] Brand sidebar focuses on Feed, Gigs, Search, Ranks, Messages, Notifications, Profile, Settings
- [ ] Workspace switcher changes role without breaking navigation
- [ ] Local demo role fallback works without Clerk session

## Mobile QA

- [ ] Feed composer is collapsed by default
- [ ] Feed cards fit without horizontal overflow
- [ ] Profile first fold shows avatar, stats, bio, actions, and grid preview
- [ ] Search form fits without duplicate search bars
- [ ] Brief cards and filters are usable on phone

## Data + Auth

- [ ] Clerk sign-up creates or syncs a `users` row
- [ ] Creator seed/demo fallback works when DB is unavailable
- [ ] Brand membership exists before posting briefs in production
- [ ] Search/rank aggregations have fallback seed data

## Ship Checks

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Smoke test routes listed in `docs/DEPLOY.md`
