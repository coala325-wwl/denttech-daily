# 🦷 DentTech聚视界daily

> 聚焦全球口腔医疗/牙科器械行业资讯平台

**在线访问：** https://wonderful-croissant-b3d86f.netlify.app/

---

## 📋 功能清单

- ✅ 国内/国际双板块切换
- ✅ 产品 / 技术 / 行业三大分类筛选
- ✅ 全文实时搜索
- ✅ 精选资讯 + 网格列表双视图
- ✅ 详情弹窗（正文 + 来源）
- ✅ 💬 Giscus 评论（需配置）
- ✅ 📡 RSS 订阅 (`/feed.xml`)
- ✅ 📧 邮箱订阅（需配置 Mailchimp）
- ✅ 响应式设计（PC / 平板 / 手机）
- ✅ 每日更新内容 → 推代码 → 自动部署（需配置 Git）

---

## 🚀 快速部署

### 方式一：拖拽部署（一次性）

```bash
# 1. 构建项目
npm run build

# 2. 把 dist 文件夹拖到 https://app.netlify.com/drop
#    或 zip 打包后拖进去
```

### 方式二：Git 自动部署（推荐，长期维护）

1. 把项目上传到 GitHub 仓库
2. 登录 [Netlify](https://app.netlify.com)
3. 点击 "Add new site" → "Import an existing project"
4. 授权 GitHub，选择仓库
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy"

---

## ⚙️ 必做配置（部署后必须完成）

### 1. 💬 开启 Giscus 评论功能

**预计时间：10 分钟**

Giscus 让你用 GitHub 账号在每篇文章下评论，永久免费、无广告。

**步骤：**

**① 创建 GitHub 仓库**
- 登录 GitHub → 点击右上角 `+` → `New repository`
- 仓库名：`denttech-daily-comments`（可自定义）
- **必须设为 Public（公开）**
- ✅ 勾选 "Add a README file"
- ✅ 勾选 "Initialize this repository with: Discussions"
  （或创建后手动去仓库 Settings → Features →开启 Discussions）

**② 获取 Giscus 配置参数**
- 访问：https://giscus.app/zh-CN
- 在 "仓库" 输入框填入你的 GitHub 仓库：`你的用户名/denttech-daily-comments`
- 页面会显示 4 个参数：
  - `data-repo`（格式：`username/repo`）
  - `data-repo-id`（以 `R_` 开头的大字符串）
  - `data-category`（如 `Announcements`）
  - `data-category-id`（以 `DIC_` 开头的大字符串）

**③ 填入配置文件**

打开 `src/data/giscus-config.js`，替换以下 4 处：

```js
export const giscusConfig = {
  repo: '你的用户名/denttech-daily-comments',   // ← 替换
  repoId: 'R_xxxxxxxxxxxx',                      // ← 替换
  category: 'Announcements',                      // ← 替换（参考 giscus.app 生成的）
  categoryId: 'DIC_xxxxxxxxxxxx',                // ← 替换
  // ... 其他保持不变
}
```

**④ 重新构建 + 部署**
```bash
npm run build
# 然后把新的 dist 文件夹重新拖到 Netlify Drop
```

---

### 2. 📧 开启邮箱订阅功能

**预计时间：5 分钟（需注册 Mailchimp）**

Mailchimp 免费套餐支持最多 500 订阅者，每月 2500 封邮件。

**步骤：**

**① 注册 Mailchimp**
- 访问 https://mailchimp.com，注册免费账号
- 创建一个 Audience（受众列表）

**② 获取 API Key**
- Account → Extras → API keys → Create A Key
- 复制 API Key（格式：`xxxx-us1`）

**③ 获取 Audience ID**
- Audience → All contacts → Settings → Audience name and defaults
- 找到 Audience ID

**④ 创建订阅表单处理（Netlify Functions）**

创建文件 `netlify/functions/subscribe.js`：

```js
// netlify/functions/subscribe.js
export default async (req, res) => {
  if (req.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const { email } = JSON.parse(req.body)
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) }
  }

  const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
    }),
  })

  const data = await response.json()
  if (response.status === 200 || response.status === 400) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  }
  return { statusCode: 500, body: JSON.stringify({ error: data.detail || 'Error' }) }
}
```

**⑤ 在 Netlify 后台设置环境变量**
- Site settings → Environment variables
- 添加：
  - `MAILCHIMP_API_KEY` = 你的 API Key
  - `MAILCHIMP_AUDIENCE_ID` = 你的 Audience ID

---

### 3. 🔄 设置 Git 自动部署（每日更新的关键）

**预计时间：5 分钟**

配置好后，你只需：
1. 更新 `src/data/news.js` 添加新内容
2. `git add . && git commit && git push`
3. Netlify 自动构建 → 自动上线（无需手动操作）

**步骤：**

1. 把项目上传到 GitHub
2. 在 Netlify 关联 Git 仓库（参考上面"方式二"）
3. 在 Netlify 后台设置：
   - **Build command：** `npm run build && node scripts/generate-rss.js`
   - **Publish directory：** `dist`

以后每次 `git push` 后，Netlify 会：
1. 拉取最新代码
2. 自动重新构建（包括自动生成新的 feed.xml）
3. 自动发布新版本

---

## 📝 每日更新内容

编辑 `src/data/news.js`，在对应数组里添加新条目：

```js
{
  id: 99,                              // 唯一ID，递增
  region: 'domestic',                  // 'domestic'（国内）或 'international'（国际）
  category: 'product',                 // 'product'（产品）| 'technology'（技术）| 'industry'（行业）
  title: '文章标题',                    // 标题
  summary: '文章摘要，50-100字',       // 摘要
  date: '2026-07-11',                 // 日期（格式：YYYY-MM-DD）
  source: '来源机构',                  // 来源
  tag: '标签关键词',                   // 标签
  featured: false,                     // 是否在精选区显示（最多3条）
},
```

添加完后：
```bash
git add . && git commit -m "更新 2026-07-11 资讯" && git push
# Netlify 自动构建并发布
```

---

## 🛠️ 本地开发

```bash
cd denttech-daily
npm install
npm run dev        # 开发模式（热更新）
npm run build      # 生产构建
npm run preview   # 预览构建结果

# 生成本地 RSS feed
node scripts/generate-rss.js
```

---

## 📂 项目结构

```
denttech-daily/
├── src/
│   ├── App.vue              # 主页面（所有组件、样式）
│   ├── data/
│   │   ├── news.js          # 📝 资讯数据（主要编辑这里）
│   │   └── giscus-config.js # 💬 Giscus 评论配置
│   └── style.css
├── scripts/
│   └── generate-rss.js      # RSS Feed 生成脚本
├── public/
│   └── feed.xml             # 自动生成的 RSS 文件（每次构建时更新）
├── dist/                    # 构建产物（部署用）
└── README.md               # 本文件
```

---

## 🔧 进阶定制

### 更换域名

在 Netlify → Domain management → Add custom domain，添加你自己的域名（如 `denttech.example.com`），按提示配置 DNS。

### 添加 Google Analytics

在 `index.html` 的 `<head>` 中添加：
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 添加更多资讯分类

在 `src/data/news.js` 的 `categoryConfig` 数组中添加新分类。

---

## ❓ 常见问题

**Q: 部署后网站显示空白？**
A: 检查 `dist/index.html` 是否存在，刷新缓存（Cmd+Shift+R）。

**Q: RSS 不更新？**
A: 确认构建命令包含 `node scripts/generate-rss.js`，或者本地运行后手动推送 `public/feed.xml`。

**Q: 评论不显示？**
A: 检查 GitHub 仓库是否设为 Public + Discussions 已开启；检查 `giscus-config.js` 参数是否正确。

---

**Powered by Vue 3 + Vite + Netlify**
