// 必须第一个导入，清除代理环境变量
import "./preload.js";
import { serve } from "@hono/node-server";
import { config } from "./config.js";
import logger from "./utils/logger.js";
import app from "./app.js";

// 清除代理环境变量，避免请求被重定向到本地代理
process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.http_proxy = "";
process.env.https_proxy = "";
process.env.ICUBE_PROXY_HOST = "";
process.env.ICUBE_PROXY_PORT = "";

// 高频路由预热列表
const WARM_UP_ROUTES = [
  "bilibili", "weibo", "zhihu", "baidu", "toutiao",
  "douyin", "tieba", "github", "ithome", "juejin",
  "csdn", "thepaper", "qq-news", "netease-news",
];

const warmUpCache = async (port: number) => {
  const base = `http://localhost:${port}`;
  logger.info("🔥 [WarmUp] Starting cache warm-up...");
  const CONCURRENCY = 4;
  // 预热请求头（内部请求，需要带上 API Key 以通过鉴权）
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.API_KEY) {
    headers["X-Api-Key"] = config.API_KEY;
  }
  for (let i = 0; i < WARM_UP_ROUTES.length; i += CONCURRENCY) {
    const batch = WARM_UP_ROUTES.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (route) => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(`${base}/api/${route}?limit=20`, { signal: controller.signal, headers });
          clearTimeout(timer);
          if (res.ok) logger.info(`✅ [WarmUp] ${route}`);
          else logger.warn(`⚠️ [WarmUp] ${route} returned ${res.status}`);
        } catch (e) {
          logger.warn(`⚠️ [WarmUp] ${route} failed`);
        }
      })
    );
  }
  logger.info("✅ [WarmUp] Cache warm-up complete");
};

// 启动服务器
const serveHotApi: (port?: number) => void = (port: number = config.PORT) => {
  try {
    const apiServer = serve({
      fetch: app.fetch,
      port,
    });
    logger.info(`🔥 DailyHot API successfully runs on port ${port}`);
    logger.info(`🔗 Local: 👉 http://localhost:${port}`);
    // 延迟 1s 等服务就绪后预热
    setTimeout(() => warmUpCache(port), 1000);
    return apiServer;
  } catch (error) {
    logger.error(error);
  }
};

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "docker") {
  serveHotApi(config.PORT);
}

export default serveHotApi;
