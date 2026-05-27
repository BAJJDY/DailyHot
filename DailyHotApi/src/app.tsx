import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { compress } from "hono/compress";
import { trimTrailingSlash } from "hono/trailing-slash";
import logger from "./utils/logger.js";
import registry from "./registry.js";
import robotstxt from "./robots.txt.js";
import NotFound from "./views/NotFound.js";
import Home from "./views/Home.js";
import Error from "./views/Error.js";
import AllRoutes from "./views/AllRoutes.js";
import crypto from "crypto";

const app = new Hono();

// 压缩响应
app.use(compress());

// 尾部斜杠重定向
app.use(trimTrailingSlash());

// CORS
app.use(
  "*",
  cors({
    origin: (origin) => {
      const isSame = config.ALLOWED_HOST && origin.endsWith(config.ALLOWED_HOST);
      return isSame ? origin : config.ALLOWED_DOMAIN;
    },
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests", "X-Api-Key", "Authorization"],
    credentials: !!config.ALLOWED_HOST,
  }),
);

// API Key 鉴权中间件（API_KEY 留空则不启用）
app.use("/api/*", async (c, next) => {
  if (!config.API_KEY) return next();
  const apiKeyHeader = c.req.header("X-Api-Key");
  const authHeader = c.req.header("Authorization");
  const provided =
    apiKeyHeader ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (provided !== config.API_KEY) {
    return c.json({ code: 401, message: "Unauthorized" }, 401);
  }
  return next();
});

// AES 响应加密（AES_KEY 留空则不加密）
// 使用 mapResponse 在响应发送前加密 JSON body
app.use("/api/*", async (c, next) => {
  await next();
  if (!config.AES_KEY) return;

  // 带有 skipEnc 参数的请求不加密（用于 /all 页面的状态检测弹窗）
  if (c.req.query("skipEnc")) return;

  // 仅加密成功的 JSON 响应
  const contentType = c.res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return;
  const status = c.res.status;
  if (status < 200 || status >= 300) return;

  try {
    const originalText = await c.res.clone().text();
    if (!originalText) return;

    const key = Buffer.from(config.AES_KEY, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(originalText, "utf8", "base64");
    encrypted += cipher.final("base64");
    const payload = iv.toString("base64") + ":" + encrypted;

    c.res = new Response(JSON.stringify({ __enc: payload }), {
      status,
      headers: c.res.headers,
    }) as any;
  } catch (e) {
    logger.error(`❌ [ENCRYPT] 加密失败: ${String(e)}`);
  }
});

// 静态资源
app.use(
  "/*",
  serveStatic({
    root: "./public",
    rewriteRequestPath: (path) => (path === "/favicon.ico" ? "/favicon.png" : path),
  }),
);

// /all 可视化页面（在 registry 之前注册，优先匹配）
app.get("/all", async (c) => {
  const wantsJson =
    c.req.query("json") === "true" ||
    (c.req.header("Accept") || "").includes("application/json");
  const res = await registry.request("/all?json=true");
  const data = await res.json() as { count: number; routes: Array<{ name: string; path?: string; message?: string }> };
  if (wantsJson) return c.json(data);
  return c.html(<AllRoutes routes={data.routes} count={data.count} apiKey={config.API_KEY} />);
});

// 主路由（所有榜单接口统一挂在 /api 下，受鉴权中间件保护）
app.route("/api", registry);

// robots
app.get("/robots.txt", robotstxt);
// 首页
app.get("/", (c) => c.html(<Home />));
// 404
app.notFound((c) => c.html(<NotFound />, 404));
// error
app.onError((err, c) => {
  logger.error(`❌ [ERROR] ${err?.message}`);
  return c.html(<Error error={err?.message} />, 500);
});

export default app;
