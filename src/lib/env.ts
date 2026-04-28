import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const requiredString = z.string().min(1);
const requiredUrl = z.string().url();

export const env = createEnv({
  server: {
    DATABASE_URL: requiredUrl,
    DIRECT_URL: requiredUrl,
    CLERK_SECRET_KEY: requiredString,
    CLERK_WEBHOOK_SECRET: requiredString,
    STRIPE_SECRET_KEY: requiredString,
    STRIPE_WEBHOOK_SECRET: requiredString,
    ANTHROPIC_API_KEY: requiredString,
    INSTAGRAM_APP_ID: requiredString,
    INSTAGRAM_APP_SECRET: requiredString,
    TIKTOK_CLIENT_KEY: requiredString,
    TIKTOK_CLIENT_SECRET: requiredString,
    YOUTUBE_API_KEY: requiredString,
    R2_ACCOUNT_ID: requiredString,
    R2_ACCESS_KEY: requiredString,
    R2_SECRET: requiredString,
    R2_BUCKET: requiredString,
    SUPABASE_URL: requiredUrl,
    SUPABASE_ANON_KEY: requiredString,
    SUPABASE_SERVICE_ROLE: requiredString,
    ALGOLIA_APP_ID: requiredString,
    ALGOLIA_ADMIN_KEY: requiredString,
    INNGEST_EVENT_KEY: requiredString,
    INNGEST_SIGNING_KEY: requiredString,
    RESEND_API_KEY: requiredString,
    SENTRY_DSN: requiredUrl,
    ENCRYPTION_KEY: requiredString,
    INFLUENCERLINK_DB_PATH: z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development")
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requiredString,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredString,
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: requiredString,
    NEXT_PUBLIC_SENTRY_DSN: requiredUrl,
    NEXT_PUBLIC_POSTHOG_KEY: requiredString
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true"
});
