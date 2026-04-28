import pino from "pino";

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = pino({
  level,
  base: {
    service: "creatorlink-web",
    environment: process.env.NODE_ENV
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token", "*.secret"],
    remove: true
  }
});

export function routeLogger(route: string) {
  return logger.child({ route });
}
