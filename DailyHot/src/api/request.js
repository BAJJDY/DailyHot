import axios from "axios";
import CryptoJS from "crypto-js";

if (import.meta.env.VITE_GLOBAL_API) {
  axios.defaults.baseURL = import.meta.env.VITE_GLOBAL_API;
}

axios.defaults.timeout = 30000;
axios.defaults.headers = { "Content-Type": "application/json" };

const _d = (p) => {
  try {
    const s = p.split(":");
    if (s.length !== 2) return null;
    const i = CryptoJS.enc.Base64.parse(s[0]);
    const k = CryptoJS.enc.Hex.parse(import.meta.env.VITE_AES_KEY);
    const c = CryptoJS.enc.Base64.parse(s[1]);
    const r = CryptoJS.AES.decrypt({ ciphertext: c }, k, { iv: i, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    const t = r.toString(CryptoJS.enc.Utf8);
    if (!t) return null;
    return JSON.parse(t);
  } catch (e) {
    return null;
  }
};

axios.interceptors.request.use((r) => r, (e) => { $message.error("请求失败，请稍后重试"); return Promise.reject(e); });

axios.interceptors.response.use(
  (r) => {
    let d = r.data;
    if (d && typeof d === "object" && d.__enc && import.meta.env.VITE_AES_KEY) {
      const x = _d(d.__enc);
      if (x) d = x;
    }
    return d;
  },
  (e) => {
    $loadingBar.error();
    if (e.response) {
      const m = e.response.data?.message;
      switch (e.response.status) {
        case 401: case 403: $message.error(m || "暂无访问权限"); break;
        case 404: $message.error(m || "请求资源不存在"); break;
        case 500: $message.error(m || "内部服务器错误"); break;
        default: $message.error(m || "请求失败，请稍后重试");
      }
    } else {
      $message.error("请求失败，请稍后重试");
    }
    return Promise.reject(e);
  }
);

export default axios;
