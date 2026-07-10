<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">🦷</span>
          <div class="logo-text">
            <span class="logo-name">DentTech聚视界</span>
            <span class="logo-sub">daily</span>
          </div>
        </div>
        <nav class="header-nav">
          <a href="#" class="nav-link active">首页</a>
          <a href="#products" class="nav-link">产品中心</a>
          <a href="#tech" class="nav-link">技术前沿</a>
          <a href="#industry" class="nav-link">行业洞察</a>
          <a href="#subscribe" class="nav-link nav-subscribe">📧 订阅</a>
        </nav>
        <div class="header-actions">
          <a href="/feed.xml" target="_blank" class="rss-btn" title="RSS 订阅">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
            RSS
          </a>
          <button class="search-btn" @click="searchOpen = !searchOpen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">🌐 全球口腔医疗 · 行业信息聚合平台</div>
        <h1 class="hero-title">DentTech聚视界<span class="hero-daily">daily</span></h1>
        <p class="hero-desc">聚焦全球口腔医疗 / 牙科器械行业资讯<br>追踪产品创新 · 技术趋势与市场动态</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">{{ filteredNews.length }}+</span>
            <span class="stat-label">行业资讯</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">3</span>
            <span class="stat-label">内容板块</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">2</span>
            <span class="stat-label">全球视野</span>
          </div>
        </div>
      </div>
      <div class="hero-bg"></div>
    </section>

    <!-- Search Bar -->
    <transition name="slide-down">
      <div v-if="searchOpen" class="search-bar-wrapper">
        <div class="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input v-model="searchQuery" type="text" placeholder="搜索口腔医疗产品、技术、行业动态..." class="search-input" @keydown.escape="searchOpen = false" />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
        </div>
      </div>
    </transition>

    <!-- Region Tabs -->
    <section class="section-tabs">
      <div class="tabs-wrapper">
        <div class="region-tabs">
          <button
            v-for="region in regionConfig"
            :key="region.key"
            class="region-tab"
            :class="{ active: currentRegion === region.key }"
            @click="switchRegion(region.key)"
          >
            {{ region.label }}
          </button>
        </div>
        <div class="category-filter">
          <button
            v-for="cat in categoryConfig"
            :key="cat.key"
            class="category-btn"
            :class="{ active: currentCategory === cat.key }"
            @click="currentCategory = cat.key"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Featured News -->
    <section v-if="!searchQuery && featuredNews.length > 0" class="section-featured">
      <div class="featured-wrapper">
        <div class="section-header">
          <h2 class="section-title">🔥 精选速递</h2>
          <span class="section-tag">{{ currentRegion === 'domestic' ? '🇨🇳 国内' : '🌍 国际' }} · {{ categoryLabel }}</span>
        </div>
        <div class="featured-grid">
          <article
            v-for="item in featuredNews"
            :key="item.id"
            class="featured-card"
            @click="openDetail(item)"
          >
            <div class="card-image-placeholder" :class="`cat-${item.category}`">
              <span class="card-cat-icon">{{ getCategoryIcon(item.category) }}</span>
              <span class="card-tag-badge">{{ item.tag }}</span>
            </div>
            <div class="featured-content">
              <div class="card-meta">
                <span class="card-date">{{ formatDate(item.date) }}</span>
                <span class="card-source">{{ item.source }}</span>
              </div>
              <h3 class="featured-title">{{ item.title }}</h3>
              <p class="featured-summary">{{ item.summary }}</p>
              <span class="read-more">阅读全文 →</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- All News -->
    <section class="section-news">
      <div class="news-wrapper">
        <div class="section-header">
          <h2 class="section-title">{{ searchQuery ? '🔍 搜索结果' : '📰 最新资讯' }}</h2>
          <span class="section-count">{{ searchQuery ? filteredNews.length + ' 条结果' : '全部资讯' }}</span>
        </div>

        <div v-if="searchQuery && filteredNews.length === 0" class="empty-state">
          <span class="empty-icon">🔍</span>
          <p class="empty-text">没有找到与「{{ searchQuery }}」相关的内容</p>
          <button class="btn-reset" @click="searchQuery = ''">清除搜索</button>
        </div>

        <div v-else class="news-grid">
          <article
            v-for="item in nonFeaturedNews"
            :key="item.id"
            class="news-card"
            @click="openDetail(item)"
          >
            <div class="card-top">
              <span class="card-cat-badge" :class="`cat-${item.category}`">
                {{ getCategoryLabel(item.category) }}
              </span>
              <span class="card-tag-small">{{ item.tag }}</span>
            </div>
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-summary">{{ item.summary }}</p>
            <div class="card-footer">
              <span class="card-date">{{ formatDate(item.date) }}</span>
              <span class="card-source">{{ item.source }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Newsletter Subscription -->
    <section class="section-subscribe" id="subscribe">
      <div class="subscribe-wrapper">
        <div class="subscribe-icon">📧</div>
        <h2 class="subscribe-title">每日精选推送，订阅不漏重要资讯</h2>
        <p class="subscribe-desc">留下邮箱，每周一封 DentTech聚视界daily 精选摘要，行业动态一网打尽。</p>
        <form class="subscribe-form" @submit.prevent="handleSubscribe">
          <input
            v-model="subscribeEmail"
            type="email"
            class="subscribe-input"
            placeholder="your@email.com"
            required
          />
          <button type="submit" class="subscribe-btn" :disabled="subscribeStatus !== 'idle'">
            <span v-if="subscribeStatus === 'idle'">立即订阅</span>
            <span v-else-if="subscribeStatus === 'loading'">提交中...</span>
            <span v-else-if="subscribeStatus === 'success'">✅ 订阅成功！</span>
            <span v-else-if="subscribeStatus === 'error'">❌ 请重试</span>
          </button>
        </form>
        <p class="subscribe-note">📌 每周一封 · 随时退订 · 绝不发送垃圾邮件</p>
        <div class="subscribe-alt">
          <span>或者用 RSS 订阅所有内容：</span>
          <a href="/feed.xml" target="_blank" class="rss-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
            /feed.xml
          </a>
        </div>
        <!-- Mailchimp placeholder notice -->
        <div class="subscribe-setup-note">
          <span class="setup-badge">⚠️ 待配置</span>
          邮箱订阅功能需要接入 Mailchimp。配置方式见 README.md。
        </div>
      </div>
    </section>

    <!-- Detail Modal -->
    <transition name="fade">
      <div v-if="detailItem" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-box">
          <button class="modal-close" @click="closeDetail">✕</button>
          <div class="modal-header">
            <div class="modal-meta">
              <span class="card-cat-badge" :class="`cat-${detailItem.category}`">
                {{ getCategoryLabel(detailItem.category) }}
              </span>
              <span class="modal-tag">{{ detailItem.tag }}</span>
            </div>
            <h2 class="modal-title">{{ detailItem.title }}</h2>
            <div class="modal-info">
              <span>📅 {{ formatDate(detailItem.date) }}</span>
              <span>📌 {{ detailItem.source }}</span>
              <span>{{ detailItem.region === 'domestic' ? '🇨🇳' : '🌍' }} {{ detailItem.region === 'domestic' ? '国内' : '国际' }}</span>
            </div>
          </div>
          <div class="modal-body">
            <!-- 完整内容 -->
            <div class="modal-full-content" v-if="detailItem.fullContent">
              <div class="content-paragraphs">
                <p v-for="(para, idx) in detailItem.fullContent.split('\n\n')" :key="idx" class="content-para">
                  {{ para }}
                </p>
              </div>
            </div>
            <p v-else class="modal-summary">{{ detailItem.summary }}</p>
            
            <div class="modal-divider"></div>
            
            <!-- 来源信息 -->
            <div class="modal-source-box">
              <p class="modal-tip">📖 本文为DentTech聚视界daily精选内容，来源：{{ detailItem.source }}。更多行业资讯持续更新中，敬请关注。</p>
              <a v-if="detailItem.sourceUrl" :href="detailItem.sourceUrl" target="_blank" rel="noopener" class="source-link">
                <span>🔗 阅读原文</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
              </a>
            </div>

            <!-- Giscus Comment Section -->
            <div class="modal-comments">
              <div class="comments-header">
                <span class="comments-title">💬 评论</span>
                <a
                  v-if="isGiscusConfigured"
                  :href="`https://github.com/${giscusConfig.repo}/discussions`"
                  target="_blank"
                  class="comments-github-link"
                >
                  在 GitHub 中讨论 →
                </a>
              </div>

              <!-- 已配置 Giscus：显示评论区 -->
              <div v-if="isGiscusConfigured" ref="giscusContainer" class="giscus-container"></div>

              <!-- 未配置 Giscus：显示配置说明 -->
              <div v-else class="giscus-setup">
                <div class="setup-icon">⚙️</div>
                <h4>评论功能待激活</h4>
                <p>需要配置 Giscus 才能开启评论。请查看 README.md 了解配置步骤。</p>
                <div class="setup-steps">
                  <div class="step"><span class="step-num">1</span> 在 GitHub 创建公开仓库，开启 Discussions</div>
                  <div class="step"><span class="step-num">2</span> 访问 <a href="https://giscus.app/zh-CN" target="_blank">giscus.app</a> 填入仓库信息</div>
                  <div class="step"><span class="step-num">3</span> 将生成的参数填入 <code>src/data/giscus-config.js</code></div>
                  <div class="step"><span class="step-num">4</span> 重新构建部署即可</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="footer-logo">🦷</span>
            <div>
              <div class="footer-name">DentTech聚视界daily</div>
              <div class="footer-team">by CCDentTech团队</div>
            </div>
          </div>
          <div class="footer-links">
            <div class="footer-link-group">
              <div class="footer-link-title">内容</div>
              <a href="#" class="footer-link">产品中心</a>
              <a href="#" class="footer-link">技术前沿</a>
              <a href="#" class="footer-link">行业洞察</a>
            </div>
            <div class="footer-link-group">
              <div class="footer-link-title">订阅</div>
              <a href="/feed.xml" target="_blank" class="footer-link">📡 RSS 订阅</a>
              <a href="#subscribe" class="footer-link">📧 邮箱订阅</a>
            </div>
            <div class="footer-link-group">
              <div class="footer-link-title">关于</div>
              <a href="#" class="footer-link">关于我们</a>
              <a href="https://github.com" target="_blank" class="footer-link">GitHub</a>
            </div>
          </div>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-desc">
          聚焦全球口腔医疗/牙科器械行业资讯，追踪产品创新、技术趋势与市场动态。
        </div>
        <div class="footer-bottom">
          <span>© 2026 DentTech聚视界daily · CCDentTech团队</span>
          <span>仅供行业信息参考，不构成医疗建议</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { newsData, categoryConfig, regionConfig } from './data/news.js'
import { giscusConfig } from './data/giscus-config.js'

const currentRegion = ref('domestic')
const currentCategory = ref('all')
const searchQuery = ref('')
const searchOpen = ref(false)
const detailItem = ref(null)
const giscusContainer = ref(null)
const subscribeEmail = ref('')
const subscribeStatus = ref('idle')

// Giscus 配置状态：检测是否已配置（repoId 不是占位符则视为已配置）
const isGiscusConfigured = computed(() => {
  return (
    giscusConfig.repoId &&
    giscusConfig.repoId !== 'YOUR_REPO_ID' &&
    giscusConfig.categoryId &&
    giscusConfig.categoryId !== 'YOUR_CATEGORY_ID'
  )
})

const categoryLabel = computed(() => {
  const cat = categoryConfig.find(c => c.key === currentCategory.value)
  return cat ? cat.label : '全部'
})

const filteredNews = computed(() => {
  let list = newsData.filter(n => n.region === currentRegion.value)
  if (currentCategory.value !== 'all') {
    list = list.filter(n => n.category === currentCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      n.tag.toLowerCase().includes(q) ||
      n.source.toLowerCase().includes(q)
    )
  }
  return list
})

const featuredNews = computed(() => filteredNews.value.filter(n => n.featured).slice(0, 3))
const nonFeaturedNews = computed(() => {
  const featuredIds = featuredNews.value.map(n => n.id)
  return filteredNews.value.filter(n => !featuredIds.includes(n.id))
})

function switchRegion(key) {
  currentRegion.value = key
  searchQuery.value = ''
}

function closeDetail() {
  detailItem.value = null
  // 关闭弹窗时清理 Giscus（避免下次打开残留）
  nextTick(() => {
    if (giscusContainer.value) {
      giscusContainer.value.innerHTML = ''
    }
  })
}

function openDetail(item) {
  detailItem.value = item
}

async function loadGiscus() {
  await nextTick()
  if (!giscusContainer.value || !isGiscusConfigured.value) return

  // 避免重复加载
  if (giscusContainer.value.querySelector('.giscus')) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.dataset.repo = giscusConfig.repo
  script.dataset.repoId = giscusConfig.repoId
  script.dataset.category = giscusConfig.category
  script.dataset.categoryId = giscusConfig.categoryId
  script.dataset.mapping = giscusConfig.mapping
  script.dataset.strict = giscusConfig.strict
  script.dataset.reactionsEnabled = giscusConfig.reactionsEnabled
  script.dataset.inputPosition = giscusConfig.inputPosition
  script.dataset.theme = giscusConfig.theme
  script.dataset.lang = giscusConfig.lang
  script.dataset.numComments = giscusConfig.numComments
  script.dataset.emitMetadata = giscusConfig.emitMetadata
  script.dataset.chatWidth = giscusConfig.chatWidth

  giscusContainer.value.appendChild(script)
}

// 监听弹窗打开，加载 Giscus
watch(detailItem, async (item) => {
  if (item) {
    await nextTick()
    if (isGiscusConfigured.value) {
      await loadGiscus()
    }
  }
})

async function handleSubscribe() {
  if (!subscribeEmail.value) return
  subscribeStatus.value = 'loading'
  // 模拟提交（Mailchimp 接入前显示成功提示）
  setTimeout(() => {
    // TODO: 接入 Mailchimp API
    subscribeStatus.value = 'success'
    subscribeEmail.value = ''
    setTimeout(() => { subscribeStatus.value = 'idle' }, 3000)
  }, 800)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCategoryIcon(cat) {
  return { product: '🔬', technology: '⚙️', industry: '🌐' }[cat] || '📋'
}

function getCategoryLabel(cat) {
  return { product: '产品', technology: '技术', industry: '行业' }[cat] || cat
}
</script>

<style scoped>
.app {
  --primary: #0d7f8a;
  --primary-light: #e6f4f5;
  --primary-dark: #085a63;
  --accent: #f5a623;
  --bg: #f7f9fb;
  --white: #ffffff;
  --text: #1a2332;
  --text-secondary: #5a6a7e;
  --text-light: #8a9aaa;
  --border: #e2e8ef;
  --shadow: 0 4px 20px rgba(13, 127, 138, 0.08);
  --shadow-lg: 0 8px 40px rgba(13, 127, 138, 0.12);
  --radius: 12px;
  --radius-sm: 8px;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
.logo-icon { font-size: 28px; }
.logo-text { display: flex; flex-direction: column; line-height: 1.2; }
.logo-name { font-size: 16px; font-weight: 700; color: var(--primary-dark); letter-spacing: 0.5px; }
.logo-sub { font-size: 11px; color: var(--text-light); letter-spacing: 2px; }
.header-nav { display: flex; gap: 4px; flex: 1; }
.nav-link {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}
.nav-link:hover { color: var(--primary); background: var(--primary-light); }
.nav-link.active { color: var(--primary); font-weight: 600; background: var(--primary-light); }
.nav-subscribe { color: var(--primary); font-weight: 600; }
.header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.search-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.search-btn:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }
.rss-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  background: #f97316;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.rss-btn:hover { background: #ea580c; }

/* Hero */
.hero {
  position: relative;
  background: linear-gradient(135deg, #0d7f8a 0%, #085a63 40%, #042f34 100%);
  padding: 64px 24px;
  overflow: hidden;
  text-align: center;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 80% 50%, rgba(245, 166, 35, 0.08) 0%, transparent 70%),
    radial-gradient(ellipse 40% 60% at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 60%);
}
.hero-inner { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.85);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}
.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px;
  line-height: 1.15;
  letter-spacing: -1px;
}
.hero-daily { font-size: 32px; font-weight: 300; opacity: 0.7; margin-left: 8px; }
.hero-desc {
  font-size: 18px;
  color: rgba(255,255,255,0.75);
  line-height: 1.7;
  margin: 0 0 36px;
}
.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: 32px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 20px 40px;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-num { font-size: 28px; font-weight: 800; color: white; }
.stat-label { font-size: 12px; color: rgba(255,255,255,0.6); letter-spacing: 1px; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

/* Search Bar */
.search-bar-wrapper {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
}
.search-bar {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 16px;
  color: var(--text-secondary);
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: var(--text);
}
.search-input::placeholder { color: var(--text-light); }
.search-clear { background: none; border: none; cursor: pointer; color: var(--text-light); font-size: 14px; padding: 2px 6px; }
.search-clear:hover { color: var(--text); }

/* Tabs */
.section-tabs { background: white; border-bottom: 1px solid var(--border); padding: 0 24px; }
.tabs-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  padding: 14px 0;
}
.region-tabs { display: flex; gap: 4px; background: var(--bg); padding: 4px; border-radius: 10px; }
.region-tab {
  padding: 8px 22px;
  border: none;
  background: none;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.region-tab.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.category-filter { display: flex; gap: 6px; flex-wrap: wrap; }
.category-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  border: 1.5px solid var(--border);
  background: white;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.category-btn:hover { border-color: var(--primary); color: var(--primary); }
.category-btn.active { background: var(--primary); border-color: var(--primary); color: white; }

/* Sections */
.section-featured, .section-news { padding: 40px 24px; }
.section-featured { background: white; }
.featured-wrapper, .news-wrapper, .subscribe-wrapper { max-width: 1280px; margin: 0 auto; }
.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.section-title { font-size: 20px; font-weight: 700; color: var(--text); margin: 0; }
.section-tag { font-size: 12px; background: var(--primary-light); color: var(--primary); padding: 4px 10px; border-radius: 20px; font-weight: 500; }
.section-count { font-size: 13px; color: var(--text-light); margin-left: auto; }

/* Featured */
.featured-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.featured-card {
  border-radius: var(--radius);
  overflow: hidden;
  background: white;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}
.featured-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary-light); }
.card-image-placeholder { height: 140px; position: relative; display: flex; align-items: center; justify-content: center; }
.cat-product { background: linear-gradient(135deg, #e0f4f5, #b3e5ec); }
.cat-technology { background: linear-gradient(135deg, #e8f4ff, #cce0ff); }
.cat-industry { background: linear-gradient(135deg, #fff8e8, #ffe8b3); }
.card-cat-icon { font-size: 48px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.card-tag-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.55); color: white;
  font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: 500;
}
.featured-content { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.card-meta { display: flex; gap: 10px; align-items: center; }
.card-date, .card-source { font-size: 12px; color: var(--text-light); }
.featured-title { font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.featured-summary { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.read-more { font-size: 13px; color: var(--primary); font-weight: 600; margin-top: 4px; }

/* News Grid */
.news-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.news-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.news-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--primary-light); }
.card-top { display: flex; align-items: center; gap: 8px; }
.card-cat-badge {
  font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px;
}
.cat-product.card-cat-badge { background: #e0f4f5; color: #0d7f8a; }
.cat-technology.card-cat-badge { background: #e8f4ff; color: #1565c0; }
.cat-industry.card-cat-badge { background: #fff8e8; color: #e65100; }
.card-tag-small { font-size: 11px; color: var(--text-light); }
.news-title { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.news-summary { font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--border); margin-top: auto; }
.card-footer .card-date, .card-footer .card-source { font-size: 11px; }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
.empty-text { font-size: 15px; color: var(--text-secondary); margin-bottom: 16px; }
.btn-reset {
  padding: 8px 20px;
  background: var(--primary); color: white;
  border: none; border-radius: 20px; font-size: 13px; cursor: pointer;
}
.btn-reset:hover { background: var(--primary-dark); }

/* ===== Subscribe Section ===== */
.section-subscribe {
  background: linear-gradient(135deg, #0d7f8a 0%, #042f34 100%);
  padding: 60px 24px;
  text-align: center;
}
.subscribe-icon { font-size: 48px; margin-bottom: 16px; }
.subscribe-title {
  font-size: 26px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px;
}
.subscribe-desc {
  font-size: 15px;
  color: rgba(255,255,255,0.7);
  margin: 0 0 28px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}
.subscribe-form {
  display: flex;
  gap: 10px;
  max-width: 440px;
  margin: 0 auto 12px;
}
.subscribe-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: white;
  color: var(--text);
}
.subscribe-input::placeholder { color: var(--text-light); }
.subscribe-btn {
  padding: 12px 22px;
  background: #f5a623;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.subscribe-btn:hover:not(:disabled) { background: #e09520; }
.subscribe-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.subscribe-note { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 20px; }
.subscribe-alt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 16px;
}
.rss-link {
  display: flex; align-items: center; gap: 4px;
  color: #f97316;
  font-weight: 600;
  text-decoration: none;
}
.rss-link:hover { text-decoration: underline; }
.subscribe-setup-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-top: 8px;
}
.setup-badge {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
}

/* ===== Comments ===== */
.modal-comments {
  margin-top: 24px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
}
.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.comments-title { font-size: 15px; font-weight: 700; color: var(--text); }
.comments-github-link {
  font-size: 12px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}
.comments-github-link:hover { text-decoration: underline; }

.giscus-container { width: 100%; }

.giscus-setup {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
}
.setup-icon { font-size: 32px; margin-bottom: 10px; }
.giscus-setup h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
}
.giscus-setup p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px;
  line-height: 1.6;
}
.giscus-setup a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}
.giscus-setup a:hover { text-decoration: underline; }
.setup-steps { text-align: left; max-width: 380px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
.step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.step code {
  background: var(--border);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--primary-dark);
}
.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-box {
  background: white;
  border-radius: 16px;
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
  z-index: 1;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--border); }
.modal-header { padding: 28px 28px 20px; border-bottom: 1px solid var(--border); }
.modal-meta { display: flex; gap: 8px; margin-bottom: 14px; }
.modal-tag { font-size: 12px; background: var(--bg); color: var(--text-secondary); padding: 4px 10px; border-radius: 6px; }
.modal-title { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1.4; margin: 0 0 14px; }
.modal-info { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); flex-wrap: wrap; }
.modal-body { padding: 24px 28px 28px; }
.modal-summary { font-size: 15px; color: var(--text); line-height: 1.8; margin: 0 0 20px; }

/* Full Content */
.modal-full-content { margin-bottom: 20px; }
.content-paragraphs { display: flex; flex-direction: column; gap: 16px; }
.content-para {
  font-size: 15px;
  color: var(--text);
  line-height: 1.9;
  margin: 0;
  text-align: justify;
}

/* Source Box */
.modal-source-box {
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-source-box .modal-tip {
  background: transparent;
  padding: 0;
  margin: 0;
}
.source-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.source-link:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
.source-link svg {
  transition: transform 0.2s;
}
.source-link:hover svg {
  transform: translate(2px, -2px);
}
.modal-divider { height: 1px; background: var(--border); margin-bottom: 20px; }
.modal-tip { font-size: 13px; color: var(--text-secondary); background: var(--bg); padding: 14px 16px; border-radius: 8px; line-height: 1.6; margin: 0; }

/* ===== Footer ===== */
.footer { background: #042f34; color: rgba(255,255,255,0.7); padding: 40px 24px 0; }
.footer-inner { max-width: 1280px; margin: 0 auto; }
.footer-top { display: flex; gap: 40px; margin-bottom: 32px; flex-wrap: wrap; }
.footer-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 0; }
.footer-logo { font-size: 28px; }
.footer-name { font-size: 16px; font-weight: 700; color: white; }
.footer-team { font-size: 12px; opacity: 0.6; }
.footer-links { display: flex; gap: 40px; flex: 1; flex-wrap: wrap; }
.footer-link-group { display: flex; flex-direction: column; gap: 10px; }
.footer-link-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
.footer-link { font-size: 13px; color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: white; }
.footer-divider { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 24px; }
.footer-desc { font-size: 13px; line-height: 1.7; margin-bottom: 24px; max-width: 560px; }
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  opacity: 0.5;
  padding: 20px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  flex-wrap: wrap;
  gap: 8px;
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 1024px) {
  .featured-grid { grid-template-columns: repeat(2, 1fr); }
  .news-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .hero-title { font-size: 32px; }
  .hero-daily { font-size: 22px; }
  .hero-stats { padding: 16px 24px; gap: 20px; }
  .featured-grid { grid-template-columns: 1fr; }
  .news-grid { grid-template-columns: repeat(2, 1fr); }
  .header-nav { display: none; }
  .tabs-wrapper { gap: 12px; }
  .subscribe-form { flex-direction: column; }
  .footer-top { flex-direction: column; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}
@media (max-width: 480px) {
  .news-grid { grid-template-columns: 1fr; }
  .hero { padding: 40px 16px; }
}
</style>
