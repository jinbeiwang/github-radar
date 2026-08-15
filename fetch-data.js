/**
 * GitHub Radar - 数据抓取脚本
 * 从 GitHub Search API 获取热门仓库数据，生成 dashboard.jsx
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── 配置 ──────────────────────────────────────────────
const CONFIG = {
  token: process.env.GITHUB_TOKEN || '',
  daysBack: 7,
  maxItems: 12,
  topN: 10,
};

// ── HTTP 请求封装 ─────────────────────────────────────
function githubGet(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      headers: {
        'User-Agent': 'GitHubRadar/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    if (CONFIG.token) {
      options.headers['Authorization'] = `token ${CONFIG.token}`;
    }
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── 日期工具 ──────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ── 数据清洗 ──────────────────────────────────────────
function cleanRepo(item) {
  return {
    name: item.full_name,
    description: (item.description || '').slice(0, 200),
    stars: item.stargazers_count,
    forks: item.forks_count,
    language: item.language || 'N/A',
    url: item.html_url,
    topics: (item.topics || []).slice(0, 6),
    createdAt: item.created_at?.split('T')[0],
    updatedAt: item.updated_at?.split('T')[0],
    openIssues: item.open_issues_count || 0,
    owner: item.owner?.login || '',
    ownerAvatar: item.owner?.avatar_url || '',
  };
}

function dedupe(list) {
  const seen = new Set();
  return list.filter(r => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });
}

// ── 查询构建 ──────────────────────────────────────────
async function fetchAIRepos() {
  const since = daysAgo(CONFIG.daysBack);
  // Use keyword search in name/description instead of topic: which is unreliable with OR
  const q = encodeURIComponent(
    `LLM OR GPT OR "large language model" OR agent OR "AI framework" stars:>500 pushed:>${since}`
  );
  const data = await githubGet(
    `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${CONFIG.maxItems}`
  );
  console.log(`  AI/LLM: ${data.total_count} total, fetched ${data.items?.length || 0}`);
  return dedupe((data.items || []).map(cleanRepo));
}

async function fetchToolsRepos() {
  const since = daysAgo(CONFIG.daysBack);
  // Use keyword search instead of topic: which is unreliable with OR
  const q = encodeURIComponent(
    `"developer tools" OR devtools OR productivity OR "command line" OR "automation tool" stars:>500 pushed:>${since}`
  );
  const data = await githubGet(
    `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${CONFIG.maxItems}`
  );
  console.log(`  Tools:  ${data.total_count} total, fetched ${data.items?.length || 0}`);
  return dedupe((data.items || []).map(cleanRepo));
}

async function fetchTrendingAll() {
  const since = daysAgo(CONFIG.daysBack);
  const q = encodeURIComponent(`stars:>500 created:>${since}`);
  const data = await githubGet(
    `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${CONFIG.topN}`
  );
  console.log(`  Trend:  ${data.total_count} total, fetched ${data.items?.length || 0}`);
  return dedupe((data.items || []).map(cleanRepo));
}

async function fetchWeeklyHot() {
  const since = daysAgo(CONFIG.daysBack);
  const q = encodeURIComponent(`stars:>200 pushed:>${since}`);
  const data = await githubGet(
    `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${CONFIG.topN + 5}`
  );
  console.log(`  Weekly: ${data.total_count} total, fetched ${data.items?.length || 0}`);
  return dedupe((data.items || []).map(cleanRepo)).slice(0, CONFIG.topN);
}

// ── 主流程 ────────────────────────────────────────────
async function main() {
  console.log('GitHub Radar - 数据抓取开始');
  console.log(`日期范围: 最近 ${CONFIG.daysBack} 天 (${daysAgo(CONFIG.daysBack)} ~ ${daysAgo(0)})`);
  console.log('');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // 顺序请求以避免 rate limit (无 token 时 10 req/min)
  const ai = await fetchAIRepos();
  await sleep(6500);
  const tools = await fetchToolsRepos();
  await sleep(6500);
  const trending = await fetchTrendingAll();
  await sleep(6500);
  const weeklyHot = await fetchWeeklyHot();

  const dashboardData = {
    generatedAt: new Date().toISOString(),
    dateRange: { from: daysAgo(CONFIG.daysBack), to: daysAgo(0) },
    stats: {
      totalRepos: ai.length + tools.length + trending.length + weeklyHot.length,
      aiCount: ai.length,
      toolsCount: tools.length,
      trendingCount: trending.length,
      totalStars: [...ai, ...tools, ...trending, ...weeklyHot]
        .reduce((s, r) => s + r.stars, 0),
      languages: [...new Set([...ai, ...tools].map(r => r.language).filter(l => l !== 'N/A'))].length,
    },
    ai,
    tools,
    trending,
    weeklyHot,
  };

  // 输出 JSON
  const outPath = path.join(__dirname, 'dashboard-data.json');
  fs.writeFileSync(outPath, JSON.stringify(dashboardData, null, 2), 'utf-8');
  console.log(`\n数据已保存到: ${outPath}`);

  // 输出 data.js（供 dashboard.html 独立加载）
  const dataJsPath = path.join(__dirname, 'data.js');
  fs.writeFileSync(dataJsPath, 'window.RADAR_DATA = ' + JSON.stringify(dashboardData) + ';\n', 'utf-8');
  console.log(`数据已保存到: ${dataJsPath}`);

  console.log(`总计: ${dashboardData.stats.totalRepos} 个仓库, ${dashboardData.stats.totalStars.toLocaleString()} stars`);

  return dashboardData;
}

main().catch(console.error);
