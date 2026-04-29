import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitKind = "read" | "write" | "ai";

type RateLimitConfig = {
  requests: number;
  window: "1 m";
};

type RateLimitInput = {
  kind: RateLimitKind;
  userId?: string | null;
  headers: Headers;
  path: string;
};

export type RateLimitOutcome = {
  enabled: boolean;
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  identifier: string;
};

const RATE_LIMITS: Record<RateLimitKind, RateLimitConfig> = {
  read: { requests: 100, window: "1 m" },
  write: { requests: 30, window: "1 m" },
  ai: { requests: 10, window: "1 m" }
};

let redis: Redis | null | undefined;
const limiters: Partial<Record<RateLimitKind, Ratelimit>> = {};

function getRedis() {
  if (typeof redis !== "undefined") return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

function getLimiter(kind: RateLimitKind) {
  const redisClient = getRedis();
  if (!redisClient) return null;

  limiters[kind] ??= new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS[kind].requests, RATE_LIMITS[kind].window),
    prefix: `creatorlink:${kind}`,
    analytics: true
  });

  return limiters[kind] ?? null;
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}

export function getRateLimitIdentifier(input: RateLimitInput) {
  const actor = input.userId ? `user:${input.userId}` : `ip:${getClientIp(input.headers)}`;
  return `${input.kind}:${actor}`;
}

export async function enforceRateLimit(input: RateLimitInput): Promise<RateLimitOutcome> {
  const config = RATE_LIMITS[input.kind];
  const identifier = getRateLimitIdentifier(input);
  const limiter = getLimiter(input.kind);

  if (!limiter) {
    return {
      enabled: false,
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now(),
      identifier
    };
  }

  const result = await limiter.limit(identifier, {
    ip: getClientIp(input.headers)
  });

  return {
    enabled: true,
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    identifier
  };
}
