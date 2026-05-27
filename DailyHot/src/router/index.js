import { createRouter, createWebHashHistory } from "vue-router";
import routes from "@/router/routes";

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  $loadingBar.start();
  next();
});

router.afterEach(() => {
  $loadingBar.finish();
});

export default router;
