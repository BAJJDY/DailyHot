import { defineStore } from "pinia";

export const mainStore = defineStore("mainData", {
  state: () => {
    return {
      // 系统主题
      siteTheme: "light",
      siteThemeAuto: true,
      // 新闻类别
      defaultNewsArr: [
        {
          label: "哔哩哔哩",
          name: "bilibili",
          order: 0,
          show: true,
        },
        {
          label: "抖音",
          name: "douyin",
          order: 1,
          show: true,
        },
        {
          label: "快手",
          name: "kuaishou",
          order: 2,
          show: true,
        },
        {
          label: "AcFun",
          name: "acfun",
          order: 3,
          show: true,
        },
        {
          label: "百度",
          name: "baidu",
          order: 4,
          show: true,
        },
        {
          label: "知乎",
          name: "zhihu",
          order: 5,
          show: true,
        },
        {
          label: "微博",
          name: "weibo",
          order: 6,
          show: true,
        },
        {
          label: "吾爱破解",
          name: "52pojie",
          order: 7,
          show: true,
        },
        {
          label: "CSDN",
          name: "csdn",
          order: 8,
          show: true,
        },
        {
          label: "GitHub",
          name: "github",
          order: 9,
          show: true,
        },
        {
          label: "少数派",
          name: "sspai",
          order: 10,
          show: true,
        },
        {
          label: "IT之家",
          name: "ithome",
          order: 11,
          show: true,
        },
        {
          label: "澎湃新闻",
          name: "thepaper",
          order: 12,
          show: true,
        },
        {
          label: "今日头条",
          name: "toutiao",
          order: 13,
          show: true,
        },
        {
          label: "百度贴吧",
          name: "tieba",
          order: 14,
          show: true,
        },
        {
          label: "稀土掘金",
          name: "juejin",
          order: 15,
          show: true,
        },
        {
          label: "豆瓣电影",
          name: "douban-movie",
          order: 16,
          show: true,
        },
        {
          label: "HelloGitHub",
          name: "hellogithub",
          order: 17,
          show: true,
        },
        {
          label: "腾讯新闻",
          name: "qq-news",
          order: 18,
          show: true,
        },
        {
          label: "网易新闻",
          name: "netease-news",
          order: 19,
          show: true,
        },
      ],
      newsArr: [],
      // 链接跳转方式
      linkOpenType: "open",
      // 页头固定
      headerFixed: true,
      // 时间数据
      timeData: null,
      // 字体大小
      listFontSize: 16,
      // 热榜版本号（用于强制更新）
      newsVersion: "1.3.0",
    };
  },
  getters: {},
  actions: {
    // 更改系统主题
    setSiteTheme(val) {
      $message.info(`已切换至${val === "dark" ? "深色模式" : "浅色模式"}`, {
        showIcon: false,
      });
      this.siteTheme = val;
      this.siteThemeAuto = false;
    },
    // 检查更新
    checkNewsUpdate() {
      const mainData = JSON.parse(localStorage.getItem("mainData"));
      let updatedNum = 0;
      if (!mainData) return false;
      
      // 检查版本号，如果版本号不匹配则强制更新
      const currentVersion = mainData.newsVersion || "0.0.0";
      const latestVersion = "1.3.0";
      
      if (currentVersion !== latestVersion) {
        console.log(`检测到新版本 ${latestVersion}，强制更新热榜列表`);
        // 强制更新为默认列表
        this.newsArr = this.defaultNewsArr;
        this.newsVersion = latestVersion;
        $message.success("热榜列表已更新到最新版本");
        return;
      }
      

      // 执行比较并迁移 - 重新排序为默认顺序
      const newNewsArr = [];
      // 按照defaultNewsArr的顺序重新排列
      for (const newItem of this.defaultNewsArr) {
        const existingItem = this.newsArr.find(
          (news) => newItem.label === news.label && newItem.name === news.name
        );
        if (existingItem) {
          // 保留现有配置但使用新顺序
          newNewsArr.push({
            ...existingItem,
            order: newItem.order
          });
        } else {
          // 添加新条目
          console.log("列表有更新：", newItem);
          updatedNum++;
          newNewsArr.push(newItem);
        }
      }
      // 检查是否有被删除的条目
      const deletedNum = this.newsArr.length - newNewsArr.length;
      if (deletedNum > 0) {
        console.log(`删除了 ${deletedNum} 个榜单`);
      }
      // 更新为新顺序
      this.newsArr = newNewsArr;
      if (updatedNum) $message.success(`成功更新 ${updatedNum} 个榜单数据`);
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: [
        "siteTheme",
        "siteThemeAuto",
        "newsArr",
        "linkOpenType",
        "headerFixed",
        "listFontSize",
        "newsVersion",
      ],
    },
  ],
});
