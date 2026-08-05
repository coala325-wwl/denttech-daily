# denttech-daily 自动更新系统

## 架构

```
每天 09:00 CST (Asia/Shanghai)
        │
        ▼
  OpenClaw cron job
  (isolated session, AI agent)
        │
        ├── 搜索 → 质量判断 → 有好内容 → edit news.js
        │                                   │
        │                            npm run build
        │                                   │
        │                     ┌─────────────┴─────────────┐
        │                     │                           │
        │              GitHub API push              GitHub Pages 部署
        │              (src/data/news.js)          (dist → gh-pages)
        │                     │                           │
        └── 无好内容 → 静默跳过              GitHub Pages 自动构建
                                              │
                                              ▼
                                      网站更新上线 ✅
                            https://coala325-wwl.github.io/denttech-daily/
```

> **注意**：原 Netlify 自动部署（eclectic-brigadeiros-fdd907.netlify.app）
> 因 GitHub → Netlify webhook 失效已停用。2026-08-05 起改用 GitHub Pages 部署。

## Cron 任务

- **ID**: `b3406c0f-3356-458c-9bb2-bba984817fc7`
- **名称**: denttech-daily 每日自动更新
- **时间**: 每天 09:00 Asia/Shanghai
- **模式**: isolated agent（静默，不打扰）
- **下次运行**: 2026-08-06 09:00 CST

## 搜索主题

1. 口腔医疗 2026 最新资讯
2. 时代天使 OR 爱齐科技 OR 通策医疗 2026 最新
3. 种植牙 正畸 口腔 政策 2026 最新
4. 口腔 AI 数字化 3D打印 NMPA 获批 2026

## 质量过滤规则

**排除**：
- 地方性诊所推广、价格表、口腔机构测评
- 百度百科、古诗词、谚语等误命中
- 标题含「百度百科」「诗句」「成语」「赏析」「名言」
- 与已有新闻重复

**保留**：
- 重大行业事件（财报、并购、监管政策、重大技术突破）
- 有具体数据支撑的报道
- 权威来源（腾讯网、药智、人民财讯、雪球、证券时报等）

## 脚本文件

- `scripts/search-news.mjs` — Bing 搜索候选抓取（备用，中文搜索被劫持不可用）
- `scripts/fetch-candidates.mjs` — 构建+部署主脚本（GitHub API，推送 news.js + 部署 gh-pages）
- `scripts/deploy-gh-pages.mjs` — 部署 dist 到 gh-pages 分支并启用 GitHub Pages

## 部署方式

### GitHub Pages（当前使用）
- 站点：https://coala325-wwl.github.io/denttech-daily/
- 源分支：gh-pages
- 构建：本机 vite build → 部署脚本推送 dist 到 gh-pages
- Token：运行脚本前设置 `export GITHUB_TOKEN=xxx`
- 首次构建较慢（约 5-10 分钟），后续更新约 1-2 分钟

### Netlify（已停用）
- 原站点：https://eclectic-brigadeiros-fdd907.netlify.app/
- 停用原因：GitHub → Netlify webhook 失效（返回 204 但不触发构建）
- 如需恢复：需在 Netlify 控制台重新连接 GitHub 仓库

## GitHub Token

- Token: 通过环境变量 `GITHUB_TOKEN` 提供（不要写入文件）
- 仓库: coala325-wwl/denttech-daily
- **git push TLS 不通，始终走 GitHub API**

## 手动测试

```bash
cd ~/Sites/denttech-daily
node scripts/fetch-candidates.mjs
```

## 管理命令

```bash
# 查看任务
openclaw cron list

# 暂停
openclaw cron edit b3406c0f --enabled false

# 恢复
openclaw cron edit b3406c0f --enabled true

# 立即触发
openclaw cron run b3406c0f

# 删除
openclaw cron remove b3406c0f
```

## 更新日志

- 2026-08-05: 首次部署每日自动更新任务
- 2026-08-05: Netlify 部署失效（webhook 不触发构建），改用 GitHub Pages 部署
  - vite.config.js 添加 `base: './'` 支持相对路径
  - 新增 scripts/deploy-gh-pages.mjs
  - fetch-candidates.mjs 增加 GitHub Pages 部署步骤
  - 站点地址：https://coala325-wwl.github.io/denttech-daily/
