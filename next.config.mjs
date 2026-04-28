import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  eslint: {
    // ESLint runs in pre-commit (lint-staged) and CI (pnpm lint), not during the build.
    // next build's internal runner can't resolve @next/eslint-plugin-next through pnpm's
    // isolated node_modules, producing a false-positive "plugin not detected" warning.
    ignoreDuringBuilds: true
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
