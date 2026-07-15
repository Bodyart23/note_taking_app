import { NextResponse } from "next/server";

/**
 * Sliding-window in-memory rate limiter.
 *
 * Counters live per server instance: on serverless every warm instance keeps
 * its own window, which is enough to blunt brute-force and spam. Swap the
 * store for shared Redis (e.g. Upstash) if horizontal scale ever demands
 * cross-instance accuracy — the call sites won't need to change.
 */

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

type RateLimitOptions = {
  /** Max allowed requests per window. */
  limit: number;
  windowMs: number;
};

type GlobalWithBuckets = typeof globalThis & {
  _rateLimitBuckets?: Map<string, number[]>;
};

// Cached on globalThis so dev HMR does not reset the counters.
function getBuckets(): Map<string, number[]> {
  const globalWithBuckets = globalThis as GlobalWithBuckets;
  globalWithBuckets._rateLimitBuckets ??= new Map();
  return globalWithBuckets._rateLimitBuckets;
}

/** Longer than any window in use, so pruning never drops live buckets. */
const PRUNE_AFTER_MS = 60 * 60 * 1000;
const PRUNE_WHEN_KEYS_EXCEED = 10_000;

export function checkRateLimit(
  name: string,
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const buckets = getBuckets();
  const bucketKey = `${name}:${key}`;
  const now = Date.now();

  const timestamps = (buckets.get(bucketKey) ?? []).filter(
    (ts) => now - ts < windowMs,
  );

  if (timestamps.length >= limit) {
    buckets.set(bucketKey, timestamps);
    const oldest = timestamps[0];
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  timestamps.push(now);
  buckets.set(bucketKey, timestamps);

  // Bound memory: once the map grows large, drop buckets idle for an hour.
  if (buckets.size > PRUNE_WHEN_KEYS_EXCEED) {
    for (const [k, ts] of buckets) {
      const newest = ts[ts.length - 1];
      if (newest === undefined || now - newest > PRUNE_AFTER_MS) {
        buckets.delete(k);
      }
    }
  }

  return { ok: true };
}

/** Client IP for per-IP limits; on Vercel x-forwarded-for is trustworthy. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { message: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
