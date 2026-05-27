/**
 * Bilibili 热榜 - Workers 版本
 */

import { get } from "../getData.js";
import { smartGetCache, smartSetCache } from "../cache.js";

const typeMap: Record<string, string> = {
  "0": "全站",
  "1": "动画",
  "3": "音乐",
  "4": "游戏",
  "5": "娱乐",
  "188": "科技",
  "119": "鬼畜",
  "129": "舞蹈",
  "155": "时尚",
  "160": "生活",
  "168": "国创相关",
  "181": "影视",
};

interface BiliItem {
  bvid: string;
  title: string;
  desc: string;
  pic?: string;
  owner?: { name: string };
  pubdate: number;
  stat?: { view: number };
  short_link_v2?: string;
  author?: string;
  video_review?: number;
}

interface BiliResponse {
  data?: { list: BiliItem[] };
}

export const handleRoute = async (c: any, noCache: boolean) => {
  const type = c.req.query("type") || "0";
  const listData = await getList(type, noCache);
  
  return {
    name: "bilibili",
    title: "哔哩哔哩",
    type: `热榜 · ${typeMap[type]}`,
    description: "你所热爱的，就是你的生活",
    link: "https://www.bilibili.com/v/popular/rank/all",
    total: listData.data?.length || 0,
    ...listData,
  };
};

const getList = async (type: string, noCache: boolean) => {
  const cacheKey = `bilibili-ranking-${type}`;
  
  // 检查缓存
  if (!noCache) {
    const cached = await smartGetCache<{ data: any[]; updateTime: string }>(cacheKey);
    if (cached) {
      return { fromCache: true, ...cached };
    }
  }
  
  // 主接口
  const url = `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${type}&type=all`;
  
  try {
    const result = await get<BiliResponse>({
      url,
      headers: {
        Referer: "https://www.bilibili.com/ranking/all",
      },
      noCache: true,
    });
    
    if (result.data?.data?.list?.length) {
      const list = result.data.data.list;
      const data = list.map((v) => ({
        id: v.bvid,
        title: v.title,
        desc: v.desc || "该视频暂无简介",
        cover: v.pic?.replace(/http:/, "https:"),
        author: v.owner?.name,
        hot: v.stat?.view || 0,
        url: v.short_link_v2 || `https://www.bilibili.com/video/${v.bvid}`,
        mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
      }));
      
      await smartSetCache(cacheKey, { data, updateTime: result.updateTime });
      return { fromCache: false, updateTime: result.updateTime, data };
    }
  } catch (e) {
    // 主接口失败，尝试备用接口
  }
  
  // 备用接口
  const backupUrl = `https://api.bilibili.com/x/web-interface/ranking?rid=${type}&type=all`;
  const result = await get<BiliResponse>({
    url: backupUrl,
    headers: { Referer: "https://www.bilibili.com/ranking/all" },
    noCache: true,
  });
  
  const list = result.data?.data?.list || [];
  const data = list.map((v) => ({
    id: v.bvid,
    title: v.title,
    desc: v.desc || "该视频暂无简介",
    cover: v.pic?.replace(/http:/, "https:"),
    author: v.author,
    hot: v.video_review,
    url: `https://www.bilibili.com/video/${v.bvid}`,
    mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
  }));
  
  await smartSetCache(cacheKey, { data, updateTime: result.updateTime });
  return { fromCache: false, updateTime: result.updateTime, data };
};