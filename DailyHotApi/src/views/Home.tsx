import type { FC } from "hono/jsx";
import { html } from "hono/html";
import Layout from "./Layout.js";

const Home: FC = () => {
  return (
    <Layout title="DailyHot API">
      <main>
        <div class="hero">
          <div class="hero-inner">
            <div class="hero-badge">API v2.0</div>
            <h1>DailyHot API</h1>
            <p class="hero-desc">聚合全网热点数据，提供统一、高效的 API 接口服务</p>
            <div class="hero-actions">
              <a href="/all" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.71 6.71a.996.996 0 0 0-1.41 0L1.71 11.3a.996.996 0 0 0 0 1.41L6.3 17.3a.996.996 0 1 0 1.41-1.41L3.83 12l3.88-3.88c.38-.39.38-1.03 0-1.41m8.58 0a.996.996 0 0 0 0 1.41L20.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L17.7 6.7c-.38-.38-1.02-.38-1.41.01M8 13c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1 .45 1 1 1m4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1m4-2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1"/></svg>
                全部接口
              </a>
              <a href="https://blog.imsyy.top/posts/2024/0408" target="_blank" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                项目文档
              </a>
            </div>
          </div>
        </div>

        <div class="features">
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>实时数据</h3>
            <p>多平台热榜数据实时聚合，缓存自动更新</p>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>安全鉴权</h3>
            <p>API Key + AES 加密双重保护，数据传输安全可靠</p>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h3>多源覆盖</h3>
            <p>覆盖微博、知乎、B站、抖音等 20+ 数据源</p>
          </div>
        </div>

        <div class="status-bar">
          <div class="status-dot"></div>
          <span>服务运行正常</span>
        </div>
      </main>
      {html`
        <style>
          .hero {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 24px 48px;
            text-align: center;
          }

          .hero-inner {
            max-width: 560px;
          }

          .hero-badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-color-secondary);
            background: var(--bg-tertiary);
            margin-bottom: 20px;
            letter-spacing: 0.5px;
          }

          .hero h1 {
            font-size: 40px;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 12px;
            line-height: 1.1;
          }

          .hero-desc {
            font-size: 16px;
            color: var(--text-color-secondary);
            line-height: 1.6;
            margin-bottom: 32px;
          }

          .hero-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 22px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
          }

          .btn-primary {
            background: var(--text-color);
            color: var(--bg-primary);
          }

          .btn-primary:hover {
            opacity: 0.85;
            transform: translateY(-1px);
          }

          .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text-color);
          }

          .btn-secondary:hover {
            background: var(--border-color);
            transform: translateY(-1px);
          }

          .features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            max-width: 720px;
            margin: 0 auto 48px;
            padding: 0 24px;
          }

          .feature {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 24px 20px;
            text-align: center;
            transition: all 0.2s;
          }

          .feature:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .feature-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 14px;
            color: var(--text-color);
          }

          .feature h3 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 6px;
          }

          .feature p {
            font-size: 13px;
            color: var(--text-color-secondary);
            line-height: 1.5;
          }

          .status-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            font-size: 13px;
            color: var(--text-color-secondary);
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #34c759;
            animation: statusPulse 2s ease-in-out infinite;
          }

          @keyframes statusPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.4); }
            50% { box-shadow: 0 0 0 6px rgba(52, 199, 89, 0); }
          }

          @media (max-width: 640px) {
            .hero { padding: 48px 20px 32px; }
            .hero h1 { font-size: 28px; }
            .features { grid-template-columns: 1fr; max-width: 360px; }
          }
        </style>
      `}
    </Layout>
  );
};

export default Home;
