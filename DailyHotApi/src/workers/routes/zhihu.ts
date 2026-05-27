/**
 * 知乎热榜 - Workers 版本
 */

import { get } from "../getData.js";
import { smartGetCache, smartSetCache } from "../cache.js";

interface ZhihuItem {
  target: {
    id: number;
    title: string;
    excerpt?: string;
    url: string;
    author?: { name: string };
  };
  detail_text?: string;
 热度?: number;
}

interface ZhihuResponse {
  data?: ZhihuItem[];
}

export const handleRoute = async (c: any, noCache: boolean) => {
  const listData = await getList(noCache);
  
  return {
    name: "zhihu",
    title: "知乎热榜",
    type: "实时热点",
    description: "知乎实时热榜",
    link: "https://www.zhihu.com/hot",
    total: listData.data?.length || 0,
    ...listData,
  };
};

const getList = async (noCache: boolean) => {
  const cacheKey = "zhihu-hot";
  
  if (!noCache) {
    const cached = await smartGetCache<{ data: any[]; updateTime: string }>(cacheKey);
    if (cached) return { fromCache: true, ...cached };
  }
  
  const url = "https://api.zhihu.com/topstory/hot-lists/total?limit=50";
  const result = await get<ZhihuResponse>({
    url,
    headers: {
      Referer: "https://www.zhihu.com",
    },
    noCache,
  });
  
  const list = result.data?.data || [];
  const data = list.map((v, i) => ({
    id: v.target?.id || i + 1,
    title: v.target?.title || "",
    desc: v.target?.excerpt || v.detail_text || "",
    hot: v.热度 || 0,
    author: v.target?.author?.name,
    url: v.target?.url || "",
    mobileUrl: v.target?.url || "",
  }));
  
  await smartSetCache(cacheKey, { data, updateTime: result.updateTime });
  return { fromCache: false, updateTime: result.updateTime, data };
};