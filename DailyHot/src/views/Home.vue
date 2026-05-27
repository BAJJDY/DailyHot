<template>
  <div class="home">
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <n-grid
      v-if="store.newsArr[0] && store.newsArr.filter((item) => item.show)[0]"
      cols="1 560:2 800:3 1100:4 1500:5"
      :x-gap="24"
      :y-gap="24"
    >
      <n-grid-item
        class="news-card"
        v-for="(item, index) in store.newsArr.filter((item) => item.show).sort((a, b) => a.order - b.order)"
        :key="item"
        :style="{ animationDelay: index / 10 + 0.2 + 's' }"
      >
        <HotList :hotData="item" :initialData="allHotData[item.name]" />
      </n-grid-item>
    </n-grid>
    <div class="error" v-else>
      <n-divider dashed class="tip"> 此处暂无内容 </n-divider>
      <n-space justify="center">
        <n-button size="large" secondary strong @click="reset">
          出错了？点此重置
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { shallowReactive, onMounted } from "vue";
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";
import { getHotLists } from "@/api";
import { helloInit } from "@/utils/getTime.js";

const store = mainStore();
// shallowReactive：key 变化时触发响应，但不深度代理 value，减少开销
const allHotData = shallowReactive({});

// 全部并发，谁先回来谁先渲染
const fetchAllHotData = () => {
  const visibleNews = store.newsArr
    .filter((item) => item.show)
    .sort((a, b) => a.order - b.order);

  visibleNews.forEach((item) => {
    getHotLists(item.name, false, item.params)
      .then((result) => {
        if (result.code === 200) {
          allHotData[item.name] = result;
        }
      })
      .catch((error) => {
        console.error(`获取 ${item.name} 热榜数据失败:`, error);
      });
  });
};

// 重置
const reset = () => {
  $dialog.warning({
    title: "重置站点",
    content:
      "确认重置站点？你的自定义数据将会恢复为默认状态！（当设置页面能正常进入并显示时请不要执行此操作！）",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      if ($timeInterval) clearInterval($timeInterval);
      localStorage.clear();
      location.reload();
    },
  });
};

// 页面加载时获取所有热榜数据
onMounted(() => {
  helloInit();
  fetchAllHotData();
});
</script>

<style lang="scss" scoped>
.home {
  .news-card {
    opacity: 0;
    transform: translateY(20px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
    animation: cardShow 0.3s forwards ease-in-out;
  }
  .tip {
    font-size: 22px;
  }
}

// 出现动画
@keyframes cardShow {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
