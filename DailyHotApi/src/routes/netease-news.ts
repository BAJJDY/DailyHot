import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "netease-news",
    title: "网易新闻",
    type: "热点榜",
    description: "网易新闻热点榜",
    link: "https://news.163.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface NeteaseItem {
  docid: string;
  title: string;
  source?: string;
  imgsrc?: string;
  ptime?: string;
  publishTime?: string;
  url?: string;
}

interface NeteaseResponse {
  code?: number;
  data?: {
    list?: NeteaseItem[];
  };
}

const getList = async (noCache: boolean) => {
  const url = "https://m.163.com/fe/api/hot/news/flow?size=50";
  const result = await get<NeteaseResponse>({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
      Referer: "https://m.163.com/",
    },
  });

  const list = result.data?.data?.list || [];
  return {
    ...result,
    data: list
      .filter((v) => v.title)
      .map((v, i) => ({
        id: v.docid || String(i),
        title: v.title,
        desc: v.source,
        cover: v.imgsrc?.replace(/^http:/, "https:"),
        hot: undefined,
        timestamp: v.publishTime ? new Date(v.publishTime).getTime() : undefined,
        url: v.url || `https://news.163.com/`,
        mobileUrl: v.url || `https://m.163.com/`,
      })),
  };
};
