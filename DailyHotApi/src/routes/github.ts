import axios from "axios";
import * as cheerio from "cheerio";
import http from "http";
import https from "https";
import { ListContext } from "../types";
import logger from "../utils/logger.js";
import { getCache, setCache } from "../utils/cache.js";

type RepoInfo = {
  owner: string;
  repo: string;
  url: string;
  description: string;
  language: string;
  stars: string;
  forks: string;
};

type TrendingRepoInfo = {
  data: RepoInfo[];
  updateTime: string;
  fromCache: boolean;
};

type TrendingType = "daily" | "weekly" | "monthly";

const typeMap: Record<TrendingType, string> = {
  daily: "日榜",
  weekly: "周榜",
  monthly: "月榜",
};

function isTrendingType(value: string): value is TrendingType {
  return ["daily", "weekly", "monthly"].includes(value as TrendingType);
}

export const handleRoute = async (c: ListContext) => {
  const typeParam = c.req.query("type") || "daily";
  const type = isTrendingType(typeParam) ? typeParam : "daily";

  const listData = await getTrendingRepos(type);

  return {
    name: "github",
    title: "github 趋势",
    type: typeMap[type],
    params: {
      type: {
        name: "排行榜分区",
        type: typeMap,
      },
    },
    link: `https://github.com/trending?since=${type}`,
    total: listData?.data?.length || 0,
    ...{
      ...listData,
      data: listData?.data?.map((v, index) => ({
        id: index,
        title: v.repo,
        desc: v.description,
        hot: v.stars,
        ...v,
      })),
    },
  };
};

export async function getTrendingRepos(
  type: TrendingType | string = "daily",
  ttl = 60 * 60 * 24,
): Promise<TrendingRepoInfo> {
  const url = `https://github.com/trending?since=${type}`;
  const cachedData = await getCache(url);

  if (cachedData) {
    logger.info("💾 [CHCHE] The request is cached");
    return {
      fromCache: true,
      updateTime: cachedData.updateTime,
      data: (cachedData?.data as RepoInfo[]) || [],
    };
  }

  logger.info(`🌐 [GET] ${url}`);

  const maxRetries = 3;
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 使用 axios，禁用代理，避免被系统代理拦截
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
        },
        timeout: 20000,
        proxy: false,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const results: RepoInfo[] = [];

      $("article.Box-row").each((_, el) => {
        const $el = $(el);
        const $repoAnchor = $el.find("h2 a");
        const fullNameText = $repoAnchor
          .text()
          .trim()
          .replace(/\r?\n/g, "")
          .replace(/\s+/g, " ")
          .split("/")
          .map((s: string) => s.trim());

        const owner = fullNameText[0] || "";
        const repoName = fullNameText[1] || "";
        const repoUrl = "https://github.com" + $repoAnchor.attr("href");
        const description = $el.find("p.col-9.color-fg-muted").text().trim();
        const language = $el.find('[itemprop="programmingLanguage"]').text().trim();
        const starsText = $el.find('a[href$="/stargazers"]').text().trim();
        const forksText = $el.find('a[href$="/forks"]').text().trim();

        results.push({
          owner,
          repo: repoName,
          url: repoUrl || "",
          description,
          language,
          stars: starsText,
          forks: forksText,
        });
      });

      const updateTime = new Date().toISOString();
      const data = results;

      await setCache(url, { data, updateTime }, ttl);
      logger.info(`✅ [200] 请求成功！共 ${results.length} 条数据`);
      return { fromCache: false, updateTime, data };
    } catch (error: unknown) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`❌ [ERROR] 第 ${i + 1} 请求失败: ${errorMessage}`);

      if (i === maxRetries - 1) {
        logger.error("❌ [ERROR] 所有尝试请求失败！");
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error("请求失败！");
}
