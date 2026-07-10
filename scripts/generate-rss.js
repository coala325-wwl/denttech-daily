#!/usr/bin/env node
// scripts/generate-rss.js
// 运行方式: node scripts/generate-rss.js
// 每次更新 news.js 后运行此脚本，重新生成 feed.xml

import { writeFileSync } from 'fs'
import { newsData } from '../src/data/news.js'

const SITE_URL = 'https://wonderful-croissant-b3d86f.netlify.app'
const SITE_TITLE = 'DentTech聚视界daily'
const SITE_DESC = '聚焦全球口腔医疗/牙科器械行业资讯，追踪产品创新、技术趋势与市场动态。'
const SITE_AUTHOR = 'CCDentTech团队'
const SITE_LANG = 'zh-CN'

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const items = newsData
  .slice(0, 20)
  .map(item => {
    const region = item.region === 'domestic' ? '国内' : '国际'
    const cat = { product: '产品', technology: '技术', industry: '行业' }[item.category] || '其他'
    const title = escapeXml(item.title)
    const summary = escapeXml(item.summary)
    return `    <item>
      <title>${title}</title>
      <link>${SITE_URL}/#news-${item.id}</link>
      <guid isPermaLink="false">denttech-daily-${item.id}</guid>
      <description>${summary}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <author>${SITE_AUTHOR}</author>
      <category>[${region}] ${cat} · ${escapeXml(item.tag)}</category>
    </item>`
  })
  .join('\n')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>${SITE_LANG}</language>
    <managingEditor>${SITE_AUTHOR}</managingEditor>
    <webMaster>${SITE_AUTHOR}</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`

writeFileSync('public/feed.xml', rss, 'utf8')
console.log('✅ feed.xml 生成成功！共', newsData.length, '条资讯 → public/feed.xml')
