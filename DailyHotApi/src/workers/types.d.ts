// Cloudflare Workers KV 类型定义

declare global {
  interface KVNamespace {
    get(key: string): Promise<string | null>;
    get(key: string, type: "json"): Promise<any>;
    get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
    put(key: string, value: string | ArrayBuffer, options?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
  }
  
  var CACHE_KV: KVNamespace | undefined;
}

export {};