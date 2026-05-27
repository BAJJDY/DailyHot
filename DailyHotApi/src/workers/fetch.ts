/**
 * Workers 兼容请求工具
 * 使用原生 fetch 替代 axios/node-fetch
 */

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  method?: "GET" | "POST";
  body?: string | FormData;
}

/**
 * 通用请求函数
 */
export const fetchData = async (
  url: string,
  options: RequestOptions = {}
): Promise<{ data: string; status: number; headers: Headers }> => {
  const { headers = {}, timeout = 10000, method = "GET", body } = options;
  
  // 默认请求头
  const defaultHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  };
  
  const mergedHeaders = { ...defaultHeaders, ...headers };
  
  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.text();
    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
};

/**
 * JSON 请求
 */
export const fetchJson = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const jsonHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  
  const mergedOptions = {
    ...options,
    headers: { ...jsonHeaders, ...options.headers },
  };
  
  const { data } = await fetchData(url, mergedOptions);
  return JSON.parse(data) as T;
};

/**
 * 带重试的请求
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestOptions = {},
  maxRetries: number = 3
): Promise<{ data: string; status: number }> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchData(url, options);
      return result;
    } catch (e) {
      lastError = e as Error;
      // 等待后重试
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  
  throw lastError || new Error("Request failed");
};

/**
 * 图片代理请求（用于防盗链）
 */
export const fetchImage = async (
  url: string,
  referer: string = "https://www.bilibili.com"
): Promise<{ data: ArrayBuffer; contentType: string }> => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": referer,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status}`);
  }
  
  const data = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/jpeg";
  
  return { data, contentType };
};