import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Shared Redis client for cache and rate limiting.
 * Falls back to null if credentials are missing, allowing local in-memory fallback.
 */
export const redis = (redisUrl && redisToken)
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

if (!redis) {
  console.warn("⚠️ Redis credentials missing. Falling back to in-memory storage.");
}
