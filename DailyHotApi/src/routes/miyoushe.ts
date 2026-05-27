import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

// 游戏分类
const gameMap: Record<string, { name: string; path: string }> = {
  "1": { name: "崩坏3", path: "bh3" },
  "2": { name: "原神", path: "ys" },
  "3": { name: "崩坏学园2", path: "bh2" },
  "4": { name: "未定事件簿", path: "wd" },
  "5": { name: "大别野", path: "db" },
  "6": { name: "崩坏：星穹铁道", path: "sr" },
  "7": { name: "暂无", path: "ys" },
  "8": { name: "绝区零", path: "zzz" },
};

// 榜单分类
const typeMap: Record<string, string> = {
  "1": "公告",
  "2": "活动",
  "3": "资讯",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const game = c.req.query("game") || "1";
  const type = c.req.query("type") || "1";
  const listData = await getList({ game, type }, noCache);
  const routeData: RouterData = {
    name: "miyoushe",
    title: `米游社 · ${gameMap[game]?.name || game}`,
    type: `最新${typeMap[type]}`,
    params: {
      game: {
        name: "游戏分类",
        type: Object.fromEntries(Object.entries(gameMap).map(([key, value]) => [key, value.name])),
      },
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.miyoushe.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface MiyoushePostData {
  post_id: string;
  subject: string;
  content: string;
  cover: string;
  images?: string[];
  created_at: number;
  view_status: number;
}

interface MiyousheUser {
  nickname: string;
}

interface MiyousheItem {
  post: MiyoushePostData;
  user?: MiyousheUser;
}

interface MiyousheResponse {
  data: {
    list: MiyousheItem[];
  };
}

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { game, type } = options;
  const gameKey = game || "2";
  const gamePath = gameMap[gameKey]?.path || "ys";
  const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=${game}&last_id=&page_size=30&type=${type}`;
  const result = await get<MiyousheResponse>({ url, noCache });
  const list = result.data.data?.list || [];
  return {
    ...result,
    data: list.map((v) => {
      const data = v.post;
      return {
        id: data.post_id,
        title: data.subject,
        desc: data.content,
        cover: data.cover || data?.images?.[0],
        author: v.user?.nickname || undefined,
        timestamp: getTime(data.created_at),
        hot: data.view_status || 0,
        url: `https://www.miyoushe.com/${gamePath}/article/${data.post_id}`,
        mobileUrl: `https://m.miyoushe.com/${gamePath}/#/article/${data.post_id}`,
      };
    }),
  };
};
