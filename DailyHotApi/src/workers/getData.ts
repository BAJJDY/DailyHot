/**
 * Workers 兼容的请求工具
 * 替代原 getData.ts，使用原生 fetch
 */

import { smartGetCache, smartSetCache } from "./cache.js";

export interface RequestResult<T = unknown> {
  fromCache: boolean;
  updateTime: string;
  data: T;
}

export interface GetOptions {
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  noCache?: boolean;
  ttl?: number;
  originaInfo?: boolean;
}

export interface PostOptions {
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  noCache?: boolean;
  ttl?: number;
  originaInfo?: boolean;
}

const DEFAULT_TTL = 3600;
const MAX_RETRIES = 2;

/**
 * GET 请求
 */
export const get = async <T = unknown>(options: GetOptions): Promise<RequestResult<T>> => {
  const { url, headers = {}, params, noCache, ttl = DEFAULT_TTL, originaInfo } = options;
  
  // 构建完整 URL
  let fullUrl = url;
  if (params) {
    const query = new URLSearchParams(params).toString();
    fullUrl = `${url}?${query}`;
  }
  
  console.log(`🌐 [GET] ${fullUrl}`);
  
  // 检查缓存
  if (!noCache) {
    const cached = await smartGetCache<{ data: T; updateTime: string }>(fullUrl);
    if (cached) {
      console.log("💾 [CACHE] The request is cached");
      return {
        fromCache: true,
        updateTime: cached.updateTime,
        data: cached.data,
      };
    }
  }
  
  // 带重试的请求
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          ...headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      const updateTime = new Date().toISOString();
      let data: T;
      
      if (originaInfo) {
        // 返回原始响应信息
        data = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text(),
        } as T;
      } else {
        const text = await response.text();
        // 尝试解析 JSON
        try {
          data = JSON.parse(text) as T;
        } catch {
          data = text as T;
        }
      }
      
      // 存入缓存
      await smartSetCache(fullUrl, { data, updateTime }, ttl);
      
      console.log(`✅ [${response.status}] request was successful`);
      return { fromCache: false, updateTime, data };
      
    } catch (err) {
      lastError = err;
      console.error(`❌ [ERROR] 第 ${attempt} 次请求失败: ${err instanceof Error ? err.message : "Unknown"}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }
  
  console.error("❌ [ERROR] 所有尝试请求失败！");
  throw lastError;
};

/**
 * POST 请求
 */
export const post = async <T = unknown>(options: PostOptions): Promise<RequestResult<T>> => {
  const { url, headers = {}, body, noCache, ttl = DEFAULT_TTL, originaInfo } = options;
  
  console.log(`🌐 [POST] ${url}`);
  
  // 检查缓存
  if (!noCache) {
    const cached = await smartGetCache<{ data: T; updateTime: string }>(url);
    if (cached) {
      console.log("💾 [CACHE] The request is cached");
      return {
        fromCache: true,
        updateTime: cached.updateTime,
        data: cached.data,
      };
    }
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    const updateTime = new Date().toISOString();
    let data: T;
    
    if (originaInfo) {
      data = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      } as T;
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as T;
      }
    }
    
    if (!noCache) {
      await smartSetCache(url, { data, updateTime }, ttl);
    }
    
    console.log(`✅ [${response.status}] request was successful`);
    return { fromCache: false, updateTime, data };
    
  } catch (error) {
    console.error("❌ [ERROR] request failed");
    throw error;
  }
};