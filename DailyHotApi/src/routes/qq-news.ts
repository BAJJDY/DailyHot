import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "qq-news",
    title: "腾讯新闻",
    type: "热点榜",
    description: "腾讯新闻热点榜",
    link: "https://news.qq.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface QQNewsItem {
  id: string;
  title: string;
  abstract?: string;
  thumbnails?: { url: string }[];
  timestamp?: number;
  readCount?: number;
  url?: string;
}

interface QQNewsResponse {
  idlist?: Array<{
    newslist?: QQNewsItem[];
  }>;
}

const getList = async (noCache: boolean) => {
  const url =
    "https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50";
  const result = await get<QQNewsResponse>({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Referer: "https://news.qq.com/",
    },
  });

  const list = result.data?.idlist?.[0]?.newslist || [];
  return {
    ...result,
    data: list
      .filter((v) => v.title)
      .map((v) => ({
        id: v.id,
        title: v.title,
        desc: v.abstract,
        cover: v.thumbnails?.[0]?.url,
        hot: v.readCount,
        timestamp: v.timestamp ? v.timestamp * 1000 : undefined,
        url: v.url || `https://new.qq.com/rain/a/${v.id}`,
        mobileUrl: v.url || `https://new.qq.com/rain/a/${v.id}`,
      })),
  };
};
