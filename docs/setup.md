# Setup

Operator-facing setup notes for InfluencerLink. Anything that requires a click in a third-party dashboard lives here.

## Clerk

InfluencerLink uses Clerk for authentication and team management. Brand teams map 1:1 to Clerk **Organizations**.

### Required environment variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...        # from the webhook endpoint config below
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login   # optional override
```

### Dashboard configuration

1. **Enable Organizations**
   - Clerk Dashboard → **Organizations** → toggle **Enable organizations** ON.
   - Set **Organization creation** to "Allow users to create organizations" (brand owners create their own org during onboarding).
   - Default role: `admin`. Available roles: `owner`, `admin`, `recruiter`, `viewer` (must match the `brand_role` enum in [src/lib/db/schema.ts](../src/lib/db/schema.ts)).

2. **Webhook endpoint**
   - Clerk Dashboard → **Webhooks** → **Add Endpoint**.
   - URL: `https://<your-domain>/api/webhooks/clerk`
   - Events to subscribe to:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `organization.created`
     - `organizationMembership.created`
   - Copy the **Signing Secret** into `CLERK_WEBHOOK_SECRET`.

3. **Session token claims** (optional, for Phase 3.2 onboarding gate)
   - Clerk Dashboard → **Sessions** → **Customize session token**.
   - Add: `{ "metadata": "{{user.public_metadata}}" }` so the onboarding flag is visible to middleware without a DB roundtrip.

### Local development

For local webhook testing, use the Clerk CLI or a tunnel (ngrok, Cloudflare Tunnel) to forward `/api/webhooks/clerk` to your dev server. Verify the endpoint receives events by triggering a test signup in the Clerk dashboard's preview mode.
