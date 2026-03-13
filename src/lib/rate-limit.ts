import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const localRateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultLimits: Record<string, RateLimitOptions> = {
  reserve: { windowMs: 60_000, maxRequests: 5 },
  publish: { windowMs: 60_000, maxRequests: 3 },
  message: { windowMs: 60_000, maxRequests: 10 },
  report: { windowMs: 300_000, maxRequests: 5 },
  api: { windowMs: 60_000, maxRequests: 30 },
  search: { windowMs: 60_000, maxRequests: 20 },
};

// Distributed rate limiters cache
const limiters = new Map<string, Ratelimit>();

function getRedisLimiter(action: string, limit: RateLimitOptions) {
  const key = `ratelimit:${action}`;
  if (!limiters.has(key) && redis) {
    limiters.set(
      key,
      new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(limit.maxRequests, `${limit.windowMs} ms`),
        analytics: true,
        prefix: `swaply:${action}`,
      })
    );
  }
  return limiters.get(key);
}

export async function checkRateLimit(
  identifier: string,
  action: string = "api"
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const limit = defaultLimits[action] || defaultLimits.api;

  if (redis) {
    try {
      const limiter = getRedisLimiter(action, limit);
      if (limiter) {
        const { success, remaining, reset } = await limiter.limit(identifier);
        return {
          allowed: success,
          remaining,
          resetIn: reset - Date.now(),
        };
      }
    } catch (e) {
      console.error("[Redis RateLimit Error]:", e);
    }
  }

  // Fallback to in-memory
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = localRateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    localRateLimitMap.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return {
      allowed: true,
      remaining: limit.maxRequests - 1,
      resetIn: limit.windowMs,
    };
  }

  if (entry.count >= limit.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  localRateLimitMap.set(key, entry);

  return {
    allowed: true,
    remaining: limit.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export async function rateLimitMiddleware<T>(
  identifier: string,
  action: string,
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string; resetIn: number }> {
  const limit = await checkRateLimit(identifier, action);

  if (!limit.allowed) {
    return {
      success: false,
      error: `Trop de requêtes. Réessayez dans ${Math.ceil(limit.resetIn / 1000)}s`,
      resetIn: limit.resetIn,
    };
  }

  return fn()
    .then((data) => ({ success: true as const, data }))
    .catch((error) => ({
      success: false as const,
      error: error.message || "Une erreur est survenue",
      resetIn: 0,
    }));
}

// Cleanup local map periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of localRateLimitMap.entries()) {
      if (now > entry.resetTime) {
        localRateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
