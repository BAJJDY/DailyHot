/**
 * 微博热搜 - Workers 版本
 */

import { get } from "../getData.js";
import { smartGetCache, smartSetCache } from "../cache.js";

interface WeiboItem {
  desc: string;
  desc_extr?: string;
  num?: number;
  realpos?: number;
  icon_desc?: string;
  u?: { name: string };
  data?: { scheme: string };
}

interface WeiboResponse {
  data?: {
    realtime?: WeiboItem[];
  };
}

export const handleRoute = async (c: any, noCache: boolean) => {
  const listData = await getList(noCache);
  
  return {
    name: "weibo",
    title: "微博热搜",
    type: "实时热点",
    description: "微博实时热搜榜",
    link: "https://s.weibo.com/topsearch",
    total: listData.data?.length || 0,
    ...listData,
  };
};

const getList = async (noCache: boolean) => {
  const cacheKey = "weibo-hot";
  
  if (!noCache) {
    const cached = await smartGetCache<{ data: any[]; updateTime: string }>(cacheKey);
    if (cached) return { fromCache: true, ...cached };
  }
  
  const url = "https://weibo.com/ajax/side/hotSearch";
  const result = await get<WeiboResponse>({
    url,
    headers: {
      Referer: "https://weibo.com",
    },
    noCache,
  });
  
  const list = result.data?.data?.realtime || [];
  const data = list.map((v, i) => ({
    id: i + 1,
    title: v.desc,
    desc: v.desc_extr || "",
    hot: v.num || v.realpos || 0,
    icon: v.icon_desc,
    author: v.u?.name,
    url: v.data?.scheme || `https://s.weibo.com/weibo?q=${encodeURIComponent(v.desc)}`,
    mobileUrl: `https://s.weibo.com/weibo?q=${encodeURIComponent(v.desc)}`,
  }));
  
  await smartSetCache(cacheKey, { data, updateTime: result.updateTime });
  return { fromCache: false, updateTime: result.updateTime, data };
};