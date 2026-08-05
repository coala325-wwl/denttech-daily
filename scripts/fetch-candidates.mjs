/**
 * fetch-candidates.mjs
 *
 * 口腔新闻自动更新流水线脚本。
 * 流程：构建 → 读取 news.js → GitHub API 推送上线。
 * 搜索 + 内容判断 → 由 AI agent 在 cron 任务中完成。
 *
 * 用法（本地测试）：
 *   node scripts/fetch-candidates.mjs
 *
 * 部署路径：
 *   OpenClaw cron job → 触发 AI agent → agent 调用 edit/git → 本脚本构建+部署
 */

import { writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const NEWS_JS  = '/Users/Zhuanz/Sites/denttech-daily/src/data/news.js';
const SITE_DIR = '/Users/Zhuanz/Sites/denttech-daily';
const TOKEN    = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('[错误] 请设置环境变量 GITHUB_TOKEN');
  console.error('用法: GITHUB_TOKEN=xxx node scripts/fetch-candidates.mjs');
  process.exit(1);
}
const REPO     = 'coala325-wwl/denttech-daily';

// ── 步骤 1：本地构建 ────────────────────────────────────────────────────────

function runBuild() {
  console.log('[构建] npm run build ...');
  try {
    execSync('npm run build', { cwd: SITE_DIR, stdio: 'inherit', timeout: 60000 });
    console.log('[构建] ✅ 完成');
  } catch (e) {
    console.error('[构建] ❌ 失败:', e.message);
    process.exit(1);
  }
}

// ── 步骤 2：读取 news.js ────────────────────────────────────────────────────

function readNews() {
  const content = readFileSync(NEWS_JS, 'utf-8');
  const ids = [];
  for (const m of content.matchAll(/id:\s*(\d+)/g)) ids.push(parseInt(m[1]));
  const maxId = Math.max(...ids, 0);
  const count = ids.length;
  console.log(`[数据] 共 ${count} 条，最大 id = ${maxId}`);
  return { content, count, maxId };
}

// ── 步骤 3：GitHub API 推送（blob → tree → commit → ref）──────────────────

function getFileSha(path) {
  try {
    const out = execSync(
      `curl -s --max-time 10 -u "coala325-wwl:${TOKEN}" ` +
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      { encoding: 'utf-8' }
    );
    const json = JSON.parse(out);
    return json.sha || null;
  } catch { return null; }
}

function ghApi(method, endpoint, body) {
  const cmd = `curl -s --max-time 15 -u "coala325-wwl:${TOKEN}" -X ${method} ` +
    `-H "Content-Type: application/json" "https://api.github.com/repos/${REPO}${endpoint}"` +
    (body ? ` -d '${body.replace(/'/g, "'\"'\"'")}'` : '');
  const out = execSync(cmd, { encoding: 'utf-8' });
  return JSON.parse(out);
}

function deployToGithub(content, commitMsg) {
  console.log('[部署] GitHub API 推送中...');

  // 获取当前 HEAD
  const refJson = ghApi('GET', '/git/ref/heads/main', null);
  const parent = refJson.object.sha;
  console.log('[部署] 当前 HEAD:', parent.slice(0, 8));

  // 读取 news.js 当前 sha（用于 update）
  const existingSha = getFileSha('src/data/news.js');
  console.log('[部署] news.js sha:', existingSha ? existingSha.slice(0, 8) : '新建');

  // 方式：直接用 contents API（create_or_update）
  const encoded = Buffer.from(content).toString('base64');
  const payload = JSON.stringify({
    message: commitMsg,
    content: encoded,
    sha: existingSha || undefined,
    branch: 'main'
  });

  let result;
  try {
    result = ghApi('PUT', '/contents/src/data/news.js', payload);
  } catch (e) {
    // ghApi 在 execSync 里无法直接 catch JSON 解析错误，换方式
    const raw = execSync(
      `curl -s --max-time 15 -u "coala325-wwl:${TOKEN}" -X PUT ` +
      `-H "Content-Type: application/json" "https://api.github.com/repos/${REPO}/contents/src/data/news.js" ` +
      `-d '${payload.replace(/'/g, "'\"'\"'")}'`,
      { encoding: 'utf-8' }
    );
    result = JSON.parse(raw);
  }

  if (result.commit) {
    console.log('[部署] ✅ commit:', result.commit.sha.slice(0, 8));
    console.log('[部署] Netlify 将自动构建（约 1-2 分钟）');
    return result.commit.html_url;
  } else if (result.message) {
    console.error('[部署] ❌ GitHub:', result.message);
    return null;
  }
  return null;
}

// ── 主流程 ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(50));
  console.log('[口腔新闻] 自动更新流水线', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  console.log('═'.repeat(50));

  // 步骤 1：构建
  runBuild();

  // 步骤 2：读取数据状态
  const { content, count, maxId } = readNews();

  // 步骤 3：推送 news.js 到 GitHub main（保留源码历史）
  const commitMsg = `auto: 每日构建更新 (${count} 条, ${new Date().toLocaleDateString('zh-CN')})`;
  const url = deployToGithub(content, commitMsg);

  if (url) {
    console.log('[源码] ✅', url);
  }

  // 步骤 4：部署 dist 到 GitHub Pages（gh-pages 分支）
  console.log('')
  console.log('[部署] 开始 GitHub Pages 部署...');
  try {
    execSync('node scripts/deploy-gh-pages.mjs', { cwd: SITE_DIR, stdio: 'inherit', timeout: 60000 });
    console.log('[完成] ✅ GitHub Pages 部署完成');
    console.log('[站点] https://coala325-wwl.github.io/denttech-daily/');
  } catch (e) {
    console.error('[部署] ❌ GitHub Pages 部署失败:', e.message);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
