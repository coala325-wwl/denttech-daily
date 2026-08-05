#!/usr/bin/env node
// 部署到 GitHub Pages（通过 GitHub API，绕过 git 协议 TLS 问题）
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const TOKEN = process.env.GITHUB_TOKEN
if (!TOKEN) {
  console.error('[错误] 请设置环境变量 GITHUB_TOKEN')
  console.error('用法: GITHUB_TOKEN=xxx node scripts/deploy-gh-pages.mjs')
  process.exit(1)
}
const REPO = 'coala325-wwl/denttech-daily'
const BRANCH = 'gh-pages'
const API = `https://api.github.com/repos/${REPO}`

function authHeaders() {
  return {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`)
  }
  return data
}

// 递归收集 dist 目录下的所有文件
function collectFiles(dir, base = '') {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, rel))
    } else {
      results.push({ path: rel, full })
    }
  }
  return results
}

async function main() {
  console.log('════════════════════════════════════════════════')
  console.log('[部署] GitHub Pages 部署流程')
  console.log('════════════════════════════════════════════════')

  const files = collectFiles(DIST)
  console.log(`[文件] 收集到 ${files.length} 个文件`)

  // 1. 创建 blobs
  console.log('[上传] 创建 blobs...')
  const blobs = []
  for (const f of files) {
    const content = fs.readFileSync(f.full)
    const b64 = content.toString('base64')
    const res = await apiFetch(`${API}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: b64, encoding: 'base64' }),
    })
    blobs.push({ path: f.path, sha: res.sha })
  }
  console.log(`[上传] ✅ ${blobs.length} 个 blob 创建完成`)

  // 2. 获取或创建 gh-pages 分支的 base tree
  let baseTree = null
  try {
    const refRes = await apiFetch(`${API}/git/refs/heads/${BRANCH}`)
    const commitRes = await apiFetch(`${API}/git/commits/${refRes.object.sha}`)
    baseTree = commitRes.tree.sha
    console.log(`[分支] 已有 ${BRANCH} 分支，base tree: ${baseTree.slice(0, 8)}`)
  } catch (e) {
    console.log(`[分支] ${BRANCH} 不存在，将创建`)
  }

  // 3. 创建 tree
  console.log('[构建] 创建 tree...')
  const treeRes = await apiFetch(`${API}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTree,
      tree: blobs.map((b) => ({
        path: b.path,
        mode: '100644',
        type: 'blob',
        sha: b.sha,
      })),
    }),
  })
  console.log(`[构建] ✅ tree: ${treeRes.sha.slice(0, 8)}`)

  // 4. 创建 commit
  console.log('[提交] 创建 commit...')
  let parentSha = null
  try {
    const refRes = await apiFetch(`${API}/git/refs/heads/${BRANCH}`)
    parentSha = refRes.object.sha
  } catch (e) {}

  const commitRes = await apiFetch(`${API}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: `deploy: GitHub Pages 自动构建 ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
      tree: treeRes.sha,
      parents: parentSha ? [parentSha] : [],
    }),
  })
  console.log(`[提交] ✅ commit: ${commitRes.sha.slice(0, 8)}`)

  // 5. 更新或创建分支引用
  try {
    await apiFetch(`${API}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commitRes.sha }),
    })
    console.log(`[分支] ✅ 更新 ${BRANCH}`)
  } catch (e) {
    await apiFetch(`${API}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: commitRes.sha }),
    })
    console.log(`[分支] ✅ 创建 ${BRANCH}`)
  }

  // 6. 启用 GitHub Pages
  console.log('[页面] 启用 GitHub Pages...')
  try {
    await apiFetch(`${API}/pages`, {
      method: 'POST',
      body: JSON.stringify({ source: { branch: BRANCH, path: '/' } }),
    })
    console.log('[页面] ✅ GitHub Pages 已启用')
  } catch (e) {
    try {
      await apiFetch(`${API}/pages`, {
        method: 'PUT',
        body: JSON.stringify({ source: { branch: BRANCH, path: '/' } }),
      })
      console.log('[页面] ✅ GitHub Pages 已更新')
    } catch (e2) {
      console.log('[页面] ⚠️ 启用失败（可能已启用）:', e2.message)
    }
  }

  console.log('')
  console.log('════════════════════════════════════════════════')
  console.log('[完成] ✅ 部署完成')
  console.log(`[站点] https://coala325-wwl.github.io/denttech-daily/`)
  console.log('════════════════════════════════════════════════')
}

main().catch((e) => {
  console.error('[错误]', e.message)
  process.exit(1)
})
