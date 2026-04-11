import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

if (import.meta.env.VITE_GLOBAL_API) {
  axios.defaults.baseURL = import.meta.env.VITE_GLOBAL_API;
}

axios.defaults.timeout = 30000;
axios.defaults.headers = { "Content-Type": "application/json" };

// 请求拦截：自动带上 API Key
axios.interceptors.request.use(
  (request) => {
    if (API_KEY) {
      request.headers["X-Api-Key"] = API_KEY;
    }
    return request;
  },
  (error) => {
    $message.error("请求失败，请稍后重试");
    return Promise.reject(error);
  }
);

// 响应拦截
axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    $loadingBar.error();
    if (error.response) {
      const data = error.response.data;
      const msg = data?.message;
      switch (error.response.status) {
        case 401: $message.error(msg || "无访问权限，请检查 API Key"); break;
        case 403: $message.error(msg || "暂无访问权限"); break;
        case 404: $message.error(msg || "请求资源不存在"); break;
        case 500: $message.error(msg || "内部服务器错误"); break;
        default:  $message.error(msg || "请求失败，请稍后重试"); break;
      }
    } else {
      $message.error("请求失败，请稍后重试");
    }
    return Promise.reject(error);
  }
);

export default axios;
