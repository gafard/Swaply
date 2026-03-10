/**
 * Simple in-memory cache with TTL support
 * For production, consider using Redis or similar
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in ms
}

const cache = new Map<string, CacheEntry<any>>();

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setInCache<T>(key: string, data: T, ttlMs: number = 60_000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function invalidateCachePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
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
