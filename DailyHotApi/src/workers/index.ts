/**
 * Cloudflare Workers 入口文件
 */

import { Hono } from "hono";

// 类型定义
type Bindings = {
  CACHE_KV: KVNamespace;
  API_KEY: string;
  AES_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 全局 KV 绑定（可选）
app.use("*", async (c, next) => {
  // 将 KV 绑定到全局，供缓存模块使用（如果配置了 KV）
  if (c.env.CACHE_KV) {
    globalThis.CACHE_KV = c.env.CACHE_KV;
  }
  await next();
});

// API Key 验证中间件
app.use("/api/*", async (c, next) => {
  const apiKey = c.env.API_KEY;
  if (apiKey) {
    const providedKey = c.req.header("X-Api-Key") || c.req.query("apiKey");
    if (providedKey !== apiKey) {
      return c.json({ code: 401, message: "Invalid API Key" }, 401);
    }
  }
  await next();
});

// 路由映射
const routeHandlers: Record<string, () => Promise<(c: any, noCache: boolean) => Promise<any>>> = {
  bilibili: () => import("./routes/bilibili.js").then((m) => m.handleRoute),
  weibo: () => import("./routes/weibo.js").then((m) => m.handleRoute),
  zhihu: () => import("./routes/zhihu.js").then((m) => m.handleRoute),
};

// 动态路由处理
app.get("/api/:route", async (c) => {
  const route = c.req.param("route");
  const noCache = c.req.query("cache") === "false";
  const limit = c.req.query("limit");
  
  try {
    // 加载路由处理器
    const handlerLoader = routeHandlers[route];
    if (!handlerLoader) {
      return c.json({ code: 404, message: `Route ${route} not found` }, 404);
    }
    
    const handler = await handlerLoader();
    const result = await handler(c, noCache);
    
    // 限制条目
    if (limit && result.data) {
      const limitNum = parseInt(limit, 10);
      if (limitNum > 0 && result.data.length > limitNum) {
        result.data = result.data.slice(0, limitNum);
        result.total = limitNum;
      }
    }
    
    return c.json({ code: 200, ...result });
  } catch (e) {
    console.error(`Route ${route} error:`, e);
    return c.json({ code: 500, message: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

// 图片代理
app.get("/proxy-image", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.text("Missing url", 400);
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.bilibili.com",
      },
    });
    
    if (!response.ok) return c.text("Failed to fetch image", 500);
    
    const data = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    return c.body(data, 200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });
  } catch (e) {
    return c.text("Failed to fetch image", 500);
  }
});

// 全部路由列表
app.get("/api/all", async (c) => {
  const routes = Object.keys(routeHandlers).map((name) => ({
    name,
    path: `/api/${name}`,
  }));
  
  return c.json({ code: 200, count: routes.length, routes });
});

// 首页
app.get("/", async (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DailyHot API - Workers</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #333; }
    .route { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 4px; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>🔥 DailyHot API (Workers)</h1>
  <p>多平台热榜数据聚合 API</p>
  <h2>可用接口</h2>
  ${Object.keys(routeHandlers).map((r) => `<div class="route"><a href="/api/${r}">/api/${r}</a></div>`).join("")}
</body>
</html>
  `);
});

// 404
app.notFound((c) => c.json({ code: 404, message: "Not Found" }, 404));

export default app;