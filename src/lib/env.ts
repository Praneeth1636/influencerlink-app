// Env validator — right-sized to MVP. Anything not required for the MVP
// deploy path is `.optional()`; the integrations that own those vars all
// soft-fail at runtime when their key is missing (see email-service,
// storage, billing, embedding-service, rate-limit). Post-MVP integrations
// (Instagram, TikTok, YouTube, Algolia, Inngest, Anthropic, Supabase) are
// removed entirely — they were never wired and shouldn't block deploy.

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const requiredString = z.string().min(1);
const requiredUrl = z.string().url();
const optionalString = z.string().min(1).optional();
const optionalUrl = z.string().url().optional();

export const env = createEnv({
  server: {
    // MVP-required
    DATABASE_URL: requiredUrl,
    CLERK_SECRET_KEY: requiredString,
    ENCRYPTION_KEY: z
      .string()
      .length(64, "ENCRYPTION_KEY must be 64 hex chars. Generate: openssl rand -hex 32")
      .regex(/^[0-9a-f]+$/i, "ENCRYPTION_KEY must be hex"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Required in production (Clerk webhook signature verification) but
    // optional in dev/test — Clerk doesn't post to localhost. The webhook
    // route handler logs + rejects when this is missing at request time.
    CLERK_WEBHOOK_SECRET: optionalString,

    // MVP-optional (transports + integrations soft-fail when absent)
    DIRECT_URL: optionalUrl, // Drizzle migrations against a non-pooled URL
    RESEND_API_KEY: optionalString,
    EMAIL_FROM: optionalString,
    EMAIL_REPLY_TO: z.string().email().optional(),
    R2_ACCOUNT_ID: optionalString,
    R2_ACCESS_KEY: optionalString,
    R2_SECRET: optionalString,
    R2_BUCKET: optionalString,
    R2_PUBLIC_BASE_URL: optionalUrl,
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalString,
    USE_LOCAL_EMBEDDER: z.enum(["true", "false"]).optional(),
    VOYAGE_API_KEY: optionalString,
    OPENAI_API_KEY: optionalString,
    SENTRY_DSN: optionalUrl,
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).optional(),

    // Post-MVP — defined but optional so config is discoverable without blocking
    STRIPE_SECRET_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,

    // Instagram Graph API (the moat). Optional in dev — without these, the
    // "Connect Instagram" button surfaces a friendly error. Required in prod
    // for verified follower counts.
    INSTAGRAM_APP_ID: optionalString,
    INSTAGRAM_APP_SECRET: optionalString,
    INSTAGRAM_REDIRECT_URI: optionalUrl,

    // Test-only escape hatch
    E2E_BYPASS_AUTH: z.enum(["true", "false"]).optional()
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requiredString,
    NEXT_PUBLIC_APP_URL: optionalUrl,
    NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
    NEXT_PUBLIC_POSTHOG_KEY: optionalString,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true"
});
