import type { FC } from "hono/jsx";
import { html, raw } from "hono/html";
import Layout from "./Layout.js";

interface Route {
  name: string;
  path?: string;
  message?: string;
}

interface AllRoutesProps {
  routes: Route[];
  count: number;
  apiKey?: string;
}

const nameMap: Record<string, string> = {
  bilibili: "哔哩哔哩", weibo: "微博", zhihu: "知乎", baidu: "百度",
  toutiao: "今日头条", douyin: "抖音", tieba: "贴吧", github: "GitHub",
  ithome: "IT之家", "ithome-xijiayi": "IT之家·喜加一", csdn: "CSDN",
  juejin: "掘金", v2ex: "V2EX", sspai: "少数派", hackernews: "Hacker News",
  producthunt: "Product Hunt", "douban-movie": "豆瓣电影", thepaper: "澎湃新闻",
  acfun: "AcFun", kuaishou: "快手", hellogithub: "HelloGitHub",
  honkai: "崩坏：星穹铁道", "52pojie": "吾爱破解", "51cto": "51CTO",
  earthquake: "地震速报", hupu: "虎扑", huxiu: "虎嗅", ifanr: "爱范儿",
  linuxdo: "Linux.do", miyoushe: "米游社", smzdm: "什么值得买", yystv: "游研社",
  "qq-news": "腾讯新闻", "netease-news": "网易新闻",
};

const logoMap: Record<string, string> = {
  acfun: "/logo/acfun.png", baidu: "/logo/baidu.png",
  bilibili: "/logo/bilibili.png", csdn: "/logo/csdn.jpg",
  "douban-movie": "/logo/douban-movie.png", douyin: "/logo/douyin.png",
  github: "/logo/github.png", hellogithub: "/logo/hellogithub.png",
  honkai: "/logo/honkai.png", ithome: "/logo/ithome.png",
  "ithome-xijiayi": "/logo/ithome.png", juejin: "/logo/juejin.png",
  kuaishou: "/logo/kuaishou.png", sspai: "/logo/sspai.png",
  thepaper: "/logo/thepaper.png", tieba: "/logo/tieba.png",
  toutiao: "/logo/toutiao.png", v2ex: "/logo/v2ex.png",
  weibo: "/logo/weibo.png", zhihu: "/logo/zhihu.png",
  "52pojie": "/logo/wuaipojie.jpg",
  "qq-news": "/logo/qq-news.png", "netease-news": "/logo/netease-news.png",
};

const colorMap: Record<string, string> = {
  bilibili: "#fb7299", weibo: "#e6162d", zhihu: "#0084ff", baidu: "#2932e1",
  toutiao: "#fe2c55", douyin: "#161823", tieba: "#3388ff", github: "#24292e",
  ithome: "#d71a1b", "ithome-xijiayi": "#d71a1b", csdn: "#fc5531",
  juejin: "#1e80ff", v2ex: "#4caf50", sspai: "#d71a1b", hackernews: "#ff6600",
  producthunt: "#da552f", "douban-movie": "#007722", thepaper: "#333",
  acfun: "#fd4c5d", kuaishou: "#ff4906", hellogithub: "#24292e",
  honkai: "#6b4fbb", "52pojie": "#e53935", earthquake: "#e53935",
  hupu: "#f5a623", huxiu: "#d0021b", ifanr: "#00b4ff", linuxdo: "#4caf50",
  miyoushe: "#2a82e4", smzdm: "#ff5000", weatheralarm: "#ff9800",
  "qq-news": "#1677ff", "netease-news": "#cc0000",
};

const frontendRoutes = new Set([
  "bilibili", "douyin", "kuaishou", "zhihu", "weibo",
  "52pojie", "csdn", "sspai", "thepaper", "toutiao",
  "juejin", "douban-movie", "hellogithub",
  "qq-news", "netease-news",
]);

const AllRoutes: FC<AllRoutesProps> = ({ routes, apiKey }) => {
  const visibleRoutes = routes.filter((r) => frontendRoutes.has(r.name));
  const apiKeyScript = apiKey
    ? raw(`<script>window.__API_KEY__="${apiKey}";</script>`)
    : "";
  return (
    <Layout title="全部接口 - DailyHot API">
      <main>
        <div class="wrap">
          <div class="hd">
            <div class="hd-l">
              <h1>全部接口</h1>
              <span class="hd-sub">{visibleRoutes.length} 个数据源</span>
            </div>
            <div class="hd-r">
              <div class="st"><b id="stat-online">-</b><span>在线</span></div>
              <div class="st"><b id="stat-offline">-</b><span>离线</span></div>
            </div>
          </div>
          <div class="bd">
            {visibleRoutes.map((route) => {
              const displayName = nameMap[route.name] || route.name;
              const color = colorMap[route.name] || "#888";
              const logo = logoMap[route.name];
              const offline = !route.path;
              return (
                <div class={`c${offline ? " off" : ""}`} data-path={offline ? "" : route.path} onclick={offline ? "" : `window.openModal('${route.path}','${displayName}')`}>
                  <div class="c-bar" style={`background:${color}`}></div>
                  <div class="c-in">
                    <div class="c-hd">
                      <div class="c-ico">
                        {logo ? <img src={logo} alt={displayName} /> : <span style={`color:${color}`}>{displayName.charAt(0)}</span>}
                      </div>
                      {!offline && <span class="c-st"><i></i><u>检测中</u></span>}
                      {offline && <span class="c-st off"><u>离线</u></span>}
                    </div>
                    <div class="c-nm">{displayName}</div>
                    <div class="c-pt">{offline ? "暂时下线" : route.path}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <div id="modal" class="m" onclick="closeModal(event)">
        <div class="m-in">
          <div class="m-hd">
            <h3 id="modal-title">接口检测</h3>
            <button onclick="closeModal()">&times;</button>
          </div>
          <div id="modal-body" class="m-bd">
            <div class="ld"><div class="sp"></div><span>检测中</span></div>
          </div>
        </div>
      </div>

      {html`
        <style>
          .wrap { max-width:880px; margin:0 auto; padding:48px 24px 64px; }
          .hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
          .hd-l h1 { font-size:28px; font-weight:700; letter-spacing:-0.5px; margin:0 0 4px; }
          .hd-sub { font-size:14px; color:#666; }
          .hd-r { display:flex; gap:24px; }
          .st { display:flex; flex-direction:column; align-items:center; gap:0; }
          .st b { font-size:24px; font-weight:700; line-height:1.1; }
          .st span { font-size:12px; color:#888; }
          .bd { display:grid; grid-template-columns:repeat(auto-fill,minmax(192px,1fr)); gap:16px; }
          .c { background:#fff; border-radius:12px; overflow:hidden; cursor:pointer; transition:transform .15s,box-shadow .15s; border:1px solid #eee; }
          .c:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.08); }
          .c.off { opacity:.35; cursor:not-allowed; filter:grayscale(.5); }
          .c.off:hover { transform:none; box-shadow:none; }
          .c-bar { height:3px; }
          .c-in { padding:18px; }
          .c-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
          .c-ico { width:40px; height:40px; border-radius:10px; background:#f6f6f6; display:flex; align-items:center; justify-content:center; }
          .c-ico img { width:24px; height:24px; object-fit:contain; }
          .c-ico span { font-size:16px; font-weight:700; }
          .c-st { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:500; background:#f0f0f0; color:#666; }
          .c-st i { width:6px; height:6px; border-radius:50%; background:#888; animation:p 1.2s ease-in-out infinite; }
          .c-st.ok { background:#e8f5e9; color:#2e7d32; } .c-st.ok i { background:#2e7d32; animation:none; }
          .c-st.err { background:#ffebee; color:#c62828; } .c-st.err i { background:#c62828; animation:none; }
          .c-st.off { background:#f0f0f0; color:#999; }
          @keyframes p { 0%,100%{opacity:1} 50%{opacity:.3} }
          .c-nm { font-size:15px; font-weight:600; margin-bottom:3px; }
          .c-pt { font-size:12px; color:#888; font-family:Menlo,Monaco,monospace; }
          .m { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:999; align-items:center; justify-content:center; padding:24px; }
          .m.active { display:flex; }
          .m-in { background:#fff; border-radius:16px; width:100%; max-width:380px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,.2); }
          .m-hd { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #eee; }
          .m-hd h3 { font-size:16px; font-weight:600; margin:0; }
          .m-hd button { background:none; border:none; font-size:24px; color:#888; cursor:pointer; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px; transition:all .15s; }
          .m-hd button:hover { background:#f0f0f0; color:#333; }
          .m-bd { padding:24px; }
          .ld { display:flex; flex-direction:column; align-items:center; gap:14px; padding:40px 0; color:#888; font-size:14px; }
          .sp { width:28px; height:28px; border:3px solid #eee; border-top-color:#333; border-radius:50%; animation:sp .8s linear infinite; }
          @keyframes sp { to{transform:rotate(360deg)} }
          .rs { text-align:center; }
          .rs-ic { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; font-weight:700; }
          .rs.ok .rs-ic { background:#e8f5e9; color:#2e7d32; }
          .rs.err .rs-ic { background:#ffebee; color:#c62828; }
          .rs h4 { font-size:18px; font-weight:600; margin:0 0 20px; }
          .rs.ok h4 { color:#2e7d32; }
          .rs.err h4 { color:#c62828; }
          .il { background:#f6f6f6; border-radius:12px; overflow:hidden; }
          .ir { display:flex; justify-content:space-between; align-items:center; padding:13px 16px; border-bottom:1px solid #eee; font-size:13px; }
          .ir:last-child { border-bottom:none; }
          .ir .lb { color:#888; }
          .ir .vl { font-weight:500; }
          .sc { font-family:Menlo,Monaco,monospace; font-weight:600; padding:3px 8px; border-radius:4px; font-size:12px; }
          .sc.ok { background:#e8f5e9; color:#2e7d32; }
          .sc.err { background:#ffebee; color:#c62828; }
          @media (max-width:640px) { .wrap { padding:24px 16px 40px; } .hd { flex-direction:column; align-items:flex-start; gap:12px; } .bd { grid-template-columns:repeat(2,1fr); gap:12px; } .c-in { padding:16px; } }
          @media (max-width:400px) { .bd { grid-template-columns:1fr; } }
        </style>
        ${apiKeyScript}<script src="/all.js" defer></script>
      `}
    </Layout>
  );
};

export default AllRoutes;
