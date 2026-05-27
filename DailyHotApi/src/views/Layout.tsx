import type { FC } from "hono/jsx";
import { css, Style } from "hono/css";

const Layout: FC = (props) => {
  const globalClass = css`
    :-hono-global {
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      :root {
        --text-color: #1d1d1f;
        --text-color-secondary: #86868b;
        --text-color-gray: #aeaeb2;
        --bg-primary: #ffffff;
        --bg-secondary: #f5f5f7;
        --bg-tertiary: #e8e8ed;
        --border-color: #e8e8ed;
        --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --text-color: #f5f5f7;
          --text-color-secondary: #98989d;
          --text-color-gray: #636366;
          --bg-primary: #2c2c2e;
          --bg-secondary: #1c1c1e;
          --bg-tertiary: #3a3a3c;
          --border-color: #3a3a3c;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
        }
      }
      a {
        text-decoration: none;
        color: inherit;
      }
      body {
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        color: var(--text-color);
        background-color: var(--bg-secondary);
        font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      main {
        flex: 1;
      }
      .img {
        width: 120px;
        height: 120px;
        margin-bottom: 20px;
      }
      .img img,
      .img svg {
        width: 100%;
        height: 100%;
      }
      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 40px;
      }
      .title .title-text {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 12px;
        text-align: center;
      }
      .title .title-tip {
        font-size: 20px;
        opacity: 0.8;
      }
      .title .content {
        margin-top: 30px;
        display: flex;
        padding: 20px;
        border-radius: 12px;
        border: 1px dashed var(--border-color);
      }
      .control {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .control button {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: var(--text-color);
        border: 1px solid var(--border-color);
        background-color: var(--bg-primary);
        border-radius: var(--radius-sm);
        padding: 8px 12px;
        margin: 0 8px;
        transition: all 0.2s;
        cursor: pointer;
        font-size: 14px;
      }
      .control button .btn-icon {
        width: 22px;
        height: 22px;
        margin-right: 8px;
      }
      .control button .btn-text {
        font-size: 14px;
      }
      .control button:hover {
        background: var(--text-color);
        color: var(--bg-primary);
        border-color: var(--text-color);
      }
      .control button i {
        margin-right: 6px;
      }
      footer {
        border-top: 1px solid var(--border-color);
        background: var(--bg-primary);
        padding: 20px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }
      .footer-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .footer-brand {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
      }
      .footer-divider {
        width: 1px;
        height: 14px;
        background: var(--border-color);
      }
      .footer-copyright {
        font-size: 13px;
        color: var(--text-color-secondary);
      }
      .footer-copyright a {
        color: var(--text-color-secondary);
        transition: color 0.2s;
      }
      .footer-copyright a:hover {
        color: var(--text-color);
      }
      .footer-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .footer-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        color: var(--text-color-secondary);
        transition: all 0.2s;
      }
      .footer-link:hover {
        background: var(--bg-tertiary);
        color: var(--text-color);
      }
      .footer-link svg {
        width: 18px;
        height: 18px;
      }
      .social {
        display: none;
      }
      .power,
      .icp {
        font-size: 14px;
      }
      @media (max-width: 640px) {
        footer {
          flex-direction: column;
          align-items: flex-start;
          padding: 16px 20px;
        }
        .footer-right {
          width: 100%;
          justify-content: flex-start;
        }
      }
    }
  `;
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta charset="utf-8" />
        <title>{props.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="description" content="今日热榜 API，一个聚合热门数据的 API 接口" />
        <Style>{globalClass}</Style>
      </head>
      <body>
        {props.children}
        <footer>
          <div class="footer-left">
            <span class="footer-brand">DailyHot API</span>
            <span class="footer-divider"></span>
            <span class="footer-copyright">
              Copyright &copy; {new Date().getFullYear()}&nbsp;
              <a href="" target="_blank">BAJJDY</a>
              &nbsp;&middot;&nbsp; Powered by&nbsp;
              <a href="https://github.com/honojs/hono/" target="_blank">Hono</a>
            </span>
          </div>
          <div class="footer-right">
            <a href="https://github.com/imsyy/DailyHotApi" className="footer-link" target="_blank" title="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                />
              </svg>
            </a>
            <a href="" className="footer-link" target="_blank" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1"
                />
              </svg>
            </a>
            <a href="mailto:bajjdy@qq.com" className="footer-link" title="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m20 8l-8 5l-8-5V6l8 5l8-5m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
                />
              </svg>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
};

export default Layout;
