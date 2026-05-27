/**
 * Workers KV 缓存模块
 * 替代 node-cache，使用 Cloudflare KV 存储
 */

// 默认缓存时间（秒）
const DEFAULT_TTL = 3600;

// 缓存键前缀
const CACHE_PREFIX = "dh_";

/**
 * 获取缓存
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const kv = globalThis.CACHE_KV as KVNamespace;
    if (!kv) return null;
    
    const fullKey = CACHE_PREFIX + key;
    const cached = await kv.get(fullKey, "json");
    return cached as T | null;
  } catch (e) {
    return null;
  }
};

/**
 * 设置缓存
 */
export const setCache = async <T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> => {
  try {
    const kv = globalThis.CACHE_KV as KVNamespace;
    if (!kv) return;
    
    const fullKey = CACHE_PREFIX + key;
    await kv.put(fullKey, JSON.stringify(value), {
      expirationTtl: ttl,
    });
  } catch (e) {
    // 缓存失败不影响主流程
  }
};

/**
 * 删除缓存
 */
export const delCache = async (key: string): Promise<void> => {
  try {
    const kv = globalThis.CACHE_KV as KVNamespace;
    if (!kv) return;
    
    const fullKey = CACHE_PREFIX + key;
    await kv.delete(fullKey);
  } catch (e) {
    // 删除失败不影响主流程
  }
};

/**
 * 内存缓存备用方案（KV 不可用时）
 */
const memoryCache = new Map<string, { data: unknown; expire: number }>();

export const getMemoryCache = <T>(key: string): T | null => {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (cached.expire < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return cached.data as T;
};

export const setMemoryCache = <T>(key: string, value: T, ttl: number = DEFAULT_TTL): void => {
  memoryCache.set(key, {
    data: value,
    expire: Date.now() + ttl * 1000,
  });
};

/**
 * 智能缓存：优先 KV，备用内存
 */
export const smartGetCache = async <T>(key: string): Promise<T | null> => {
  // 优先尝试 KV
  const kvCache = await getCache<T>(key);
  if (kvCache) return kvCache;
  
  // KV 无数据，尝试内存缓存
  return getMemoryCache<T>(key);
};

export const smartSetCache = async <T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> => {
  // 同时写入 KV 和内存
  await setCache(key, value, ttl);
  setMemoryCache(key, value, ttl);
};