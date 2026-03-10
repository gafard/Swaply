/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultLimits: Record<string, RateLimitOptions> = {
  // Strict limits for sensitive actions
  reserve: { windowMs: 60_000, maxRequests: 5 }, // 5 per minute
  publish: { windowMs: 60_000, maxRequests: 3 }, // 3 per minute
  message: { windowMs: 60_000, maxRequests: 10 }, // 10 per minute
  report: { windowMs: 300_000, maxRequests: 5 }, // 5 per 5 minutes
  
  // API limits
  api: { windowMs: 60_000, maxRequests: 30 }, // 30 per minute
  search: { windowMs: 60_000, maxRequests: 20 }, // 20 per minute
};

export function checkRateLimit(
  identifier: string,
  action: string = "api"
): { allowed: boolean; remaining: number; resetIn: number } {
  const limit = defaultLimits[action] || defaultLimits.api;
  const key = `${action}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitMap.set(key, {
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
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitMap.set(key, entry);

  return {
    allowed: true,
    remaining: limit.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function rateLimitMiddleware<T>(
  identifier: string,
  action: string,
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string; resetIn: number }> {
  const limit = checkRateLimit(identifier, action);

  if (!limit.allowed) {
    return Promise.resolve({
      success: false,
      error: `Trop de requêtes. Réessayez dans ${Math.ceil(limit.resetIn / 1000)}s`,
      resetIn: limit.resetIn,
    });
  }

  return fn()
    .then((data) => ({ success: true as const, data }))
    .catch((error) => ({
      success: false as const,
      error: error.message || "Une erreur est survenue",
      resetIn: 0,
    }));
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);
