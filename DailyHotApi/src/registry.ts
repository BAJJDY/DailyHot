import { fileURLToPath } from "url";
import { Hono } from "hono";
import getRSS from "./utils/getRSS.js";
import { config } from "./config.js";
import path from "path";
import fs from "fs";
import axios from "axios";

const app = new Hono();

// 模拟 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 路由数据
let allRoutePath: Array<string> = [];
const routersDirName: string = "routes";

// 排除路由
const excludeRoutes: Array<string> = [];

// 建立完整目录路径
const routersDirPath = path.join(__dirname, routersDirName);

// 递归查找函数
const findTsFiles = (dirPath: string, allFiles: string[] = [], basePath: string = ""): string[] => {
  // 读取目录下的所有文件和文件夹
  const items: Array<string> = fs.readdirSync(dirPath);
  // 遍历每个文件或文件夹
  items.forEach((item) => {
    const fullPath: string = path.join(dirPath, item);
    const relativePath: string = basePath ? path.posix.join(basePath, item) : item;
    const stat: fs.Stats = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // 如果是文件夹，递归查找
      findTsFiles(fullPath, allFiles, relativePath);
    } else if (
      stat.isFile() &&
      (item.endsWith(".ts") || item.endsWith(".js")) &&
      !item.endsWith(".d.ts")
    ) {
      // 符合条件
      allFiles.push(relativePath.replace(/\.(ts|js)$/, ""));
    }
  });
  return allFiles;
};

// 获取全部路由
if (fs.existsSync(routersDirPath) && fs.statSync(routersDirPath).isDirectory()) {
  allRoutePath = findTsFiles(routersDirPath);
} else {
  console.error(`📂 The directory ${routersDirPath} does not exist or is not a directory`);
}

// 注册全部路由
for (let index = 0; index < allRoutePath.length; index++) {
  const router = allRoutePath[index];
  // 是否处于排除名单
  if (excludeRoutes.includes(router)) {
    continue;
  }
  const listApp = app.basePath(`/${router}`);
  // 返回榜单
  listApp.get("/", async (c) => {
    // 是否采用缓存 - 优先从请求头读取，兼容URL参数
    const cacheHeader = c.req.header("X-Use-Cache");
    const noCache = cacheHeader === "false" || c.req.query("cache") === "false";
    // 限制显示条目
    const limit = c.req.query("limit");
    // 是否输出 RSS
    const rssEnabled = c.req.query("rss") === "true";
    // 获取路由路径
    const { handleRoute } = await import(`./routes/${router}.js`);
    const listData = await handleRoute(c, noCache);
    // 是否限制条目
    const limitNum = limit ? parseInt(limit, 10) : NaN;
    if (!isNaN(limitNum) && limitNum > 0 && listData?.data?.length > limitNum) {
      listData.total = limitNum;
      listData.data = listData.data.slice(0, limitNum);
    }
    // 是否输出 RSS
    if (rssEnabled || config.RSS_MODE) {
      const rss = getRSS(listData);
      if (typeof rss === "string") {
        c.header("Content-Type", "application/xml; charset=utf-8");
        return c.body(rss);
      } else {
        return c.json({ code: 500, message: "RSS generation failed" }, 500);
      }
    }
    const responsePayload = { code: 200, ...listData };
    return c.json(responsePayload);
  });
  listApp.all("*", (c) => c.json({ code: 405, message: "Method Not Allowed" }, 405));
}

// 获取全部路由
app.get("/all", (c) => {
  const routes = allRoutePath.map((routeName) => {
    if (excludeRoutes.includes(routeName)) {
      return { name: routeName, path: undefined, message: "This interface is temporarily offline" };
    }
    return { name: routeName, path: `/api/${routeName}` };
  });
  // ?json=true 或 Accept: application/json 时返回 JSON
  const wantsJson =
    c.req.query("json") === "true" ||
    (c.req.header("Accept") || "").includes("application/json");
  if (wantsJson) {
    return c.json({ code: 200, count: allRoutePath.length, routes }, 200);
  }
  return c.json({ code: 200, count: allRoutePath.length, routes }, 200);
});

// 图片代理路由（解决防盗链）
app.get("/proxy-image", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.text("Missing url", 400);

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.bilibili.com",
      },
      proxy: false,
    });

    const contentType = String(response.headers["content-type"] || "image/jpeg");
    return c.body(response.data, 200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });
  } catch (e) {
    return c.text("Failed to fetch image", 500);
  }
});

export default app;
