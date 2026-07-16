import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks after limit within window", () => {
    const name = "test";
    const key = "ip";
    const options = { limit: 2, windowMs: 1000 };

    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    expect(checkRateLimit(name, key, options).ok).toBe(true);

    vi.setSystemTime(new Date("2026-01-01T00:00:00.100Z"));
    expect(checkRateLimit(name, key, options).ok).toBe(true);

    vi.setSystemTime(new Date("2026-01-01T00:00:00.200Z"));
    const third = checkRateLimit(name, key, options);
    expect(third.ok).toBe(false);
  });
});

