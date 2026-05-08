import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Boot-time env validation. Importing the module triggers `createEnv` so
  // missing/invalid env crashes the server at startup instead of on the
  // first request. SKIP_ENV_VALIDATION=true bypasses (CI builds, tests).
  await import("./lib/env");

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
