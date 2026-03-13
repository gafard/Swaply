import { redis } from "./redis";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in ms
}

const localCache = new Map<string, CacheEntry<any>>();

export async function getFromCache<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      return await redis.get<T>(key);
    } catch (e) {
      console.error("[Redis Cache Error] get:", e);
    }
  }

  const entry = localCache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    localCache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export async function setInCache<T>(key: string, data: T, ttlMs: number = 60_000): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, data, { px: ttlMs });
      return;
    } catch (e) {
      console.error("[Redis Cache Error] set:", e);
    }
  }

  localCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch (e) {
      console.error("[Redis Cache Error] del:", e);
    }
  }
  localCache.delete(key);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (redis) {
    try {
      const keys = await redis.keys(pattern.includes("*") ? pattern : `*${pattern}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    } catch (e) {
      console.error("[Redis Cache Error] invalidatePattern:", e);
    }
  }

  for (const key of localCache.keys()) {
    if (key.includes(pattern)) {
      localCache.delete(key);
    }
  }
}

// Cache keys helpers
export const CacheKeys = {
  discoveryFeed: (zone?: string) => `discovery:${zone || 'global'}`,
  item: (id: string) => `item:${id}`,
  userItems: (userId: string) => `user:items:${userId}`,
  search: (query: string, filters: Record<string, string>) => 
    `search:${query}:${JSON.stringify(filters)}`,
};
