import { withSentryConfig } from "@sentry/nextjs";

// Env validation runs in src/instrumentation.ts (Next boot hook) — that
// path can resolve TS, this config can't. Pass SKIP_ENV_VALIDATION=true to
// opt out (e.g. CI build with no secrets).

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  eslint: {
    // ESLint runs in pre-commit (lint-staged) and CI (pnpm lint), not during the build.
    // next build's internal runner can't resolve @next/eslint-plugin-next through pnpm's
    // isolated node_modules, producing a false-positive "plugin not detected" warning.
    ignoreDuringBuilds: true
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true
    }
  },
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN
  }
});
