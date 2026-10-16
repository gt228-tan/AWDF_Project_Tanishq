import NodeCache from "node-cache";

// Default TTL: 60 seconds (as required by Practical 9)
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;

// Initialize NodeCache instance
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 120, // automatic expired key deletion check every 120s
  useClones: false  // improves performance by storing references
});

// Cache performance and telemetry stats (Supplementary Problem 2)
export const cacheStats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
  get totalRequests() {
    return this.hits + this.misses;
  },
  get hitRate() {
    const total = this.totalRequests;
    return total === 0 ? "0%" : `${((this.hits / total) * 100).toFixed(2)}%`;
  },
  reset() {
    this.hits = 0;
    this.misses = 0;
    this.invalidations = 0;
  }
};

/**
 * Retrieve data from cache with automatic hit/miss tracking
 * @param {string} key
 * @returns {any} cached value or undefined
 */
export const getCached = (key) => {
  const data = cache.get(key);
  if (data !== undefined) {
    cacheStats.hits += 1;
    return data;
  }
  cacheStats.misses += 1;
  return undefined;
};

/**
 * Store data in cache
 * @param {string} key
 * @param {any} val
 * @param {number} [ttl] Optional custom TTL in seconds
 */
export const setCached = (key, val, ttl) => {
  if (ttl !== undefined) {
    return cache.set(key, val, ttl);
  }
  return cache.set(key, val);
};

/**
 * Invalidate/delete one or more keys from the cache
 * @param {string|string[]} keys
 */
export const invalidateCache = (keys) => {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const count = cache.del(keysArray);
  cacheStats.invalidations += count;
  return count;
};

/**
 * Invalidate all tasks cache (both global and user-specific patterns)
 */
export const invalidateAllTasksCache = (userId, taskId = null) => {
  const keysToInvalidate = ["all_tasks"];
  if (userId) {
    keysToInvalidate.push(`tasks_${userId}`);
  }
  if (taskId) {
    keysToInvalidate.push(`task_${taskId}`);
  }
  return invalidateCache(keysToInvalidate);
};

export default cache;
