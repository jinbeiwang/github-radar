# GitHub Radar 重新设计 · 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Vite + React + TS 重建 GitHub 周榜网站：零依赖抓取脚本生成每周数据快照，GitHub Actions 每周日自动更新并发布到 GitHub Pages。

**Architecture:** 两部分——`scripts/`（Node .mjs 零依赖数据管道：查询→清洗→diff→落盘）与 `src/`（React SPA 读 `public/data/*.json` 渲染四个 Tab）。数据只追加，trends 滚动窗口 16 周。

**Tech Stack:** React 18 + TypeScript + Vite 6 + vitest；GitHub Search API v3；GitHub Actions（内置 GITHUB_TOKEN）+ 官方 Pages 部署。

**规格:** `docs/superpowers/specs/2026-08-15-github-radar-redesign-design.md`

**约定:** 仓库根 = `g:\test\github-radar`。所有 shell 命令在仓库根执行；本机 PowerShell 不支持 `&&`（用 `;`），npm scripts 内部可用 `&&`。git 提交信息用中文 conventional 风格。代码默认不写注释，仅在不言自明处省略。

---

### Task 1: 工程脚手架与遗留清理

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`（占位）, `src/vite-env.d.ts`, `src/styles/tokens.css`（占位）, `src/styles/app.css`（占位）
- Delete: `dashboard.html`, `dashboard.jsx`, `data.js`, `fetch-data.js`, `dashboard-data.json`

- [ ] **Step 1: 确认 Node ≥ 20**

Run: `node --version`
Expected: `v20.x.x` 或更高。若未安装 Node 20+，停止并告知用户安装后再继续。

- [ ] **Step 2: 写 `package.json`**

```json
{
  "name": "github-radar",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "fetch": "node scripts/fetch-trending.mjs"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.2",
    "vite": "^6.0.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3: 写 `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  base: '/github-radar/',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
})
```

- [ ] **Step 4: 写 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 5: 写 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📡</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GitHub Radar · 每周热榜</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 写 `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
declare const __APP_VERSION__: string
```

- [ ] **Step 7: 写 `src/main.tsx` 与占位文件**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`（Task 12 替换）:
```tsx
export default function App() {
  return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>GitHub Radar 脚手架就绪</div>
}
```

`src/styles/tokens.css` 与 `src/styles/app.css` 各写一行：`/* Task 2 填充 */`

- [ ] **Step 8: 安装依赖**

Run: `npm install`
若 npm 官方源超时：`npm install --registry https://registry.npmmirror.com`
Expected: `added N packages`，生成 `package-lock.json`。

- [ ] **Step 9: 构建验证**

Run: `npm run build`
Expected: `vite v6… built in …s`，生成 `dist/`，TypeScript 无报错。

- [ ] **Step 10: 删除遗留文件**

Run: `git rm dashboard.html dashboard.jsx data.js fetch-data.js dashboard-data.json`
Expected: 5 个文件从工作区与索引移除。

- [ ] **Step 11: 提交**

Run: `git add -A ; git commit -m "feat: Vite+React+TS 工程脚手架，移除遗留原型文件"`
Expected: 提交成功。

---

### Task 2: 设计令牌与全局样式

**Files:**
- Modify: `src/styles/tokens.css`（替换占位）
- Modify: `src/styles/app.css`（替换占位）

- [ ] **Step 1: 写 `src/styles/tokens.css`**

```css
:root {
  --bg: #f6f8fa;
  --surface: #ffffff;
  --border: #d0d7de;
  --border-muted: #d8dee4;
  --text: #1f2328;
  --text-muted: #656d76;
  --text-faint: #8c959f;
  --accent: #0969da;
  --success: #1a7f37;
  --success-bg: #f0fff4;
  --success-border: #dafbe1;
  --danger: #cf222e;
  --purple: #8250df;
  --purple-bg: #faf5ff;
  --purple-border: #e6d5f7;
  --topbar: #24292f;
  --badge-issue-bg: #238636;
  --badge-issue-fg: #aff5b4;
  --rank-1: #bc4c00;
  --rank-2: #8250df;
  --rank-3: #9a6700;
  --radius: 6px;
  --radius-lg: 12px;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
```

- [ ] **Step 2: 写 `src/styles/app.css`**

```css
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font); font-size: 14px; line-height: 1.5; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.page { max-width: 1080px; margin: 0 auto; padding: 0 16px 32px; }

.topbar { background: var(--topbar); margin: 0 -16px; padding: 14px 24px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.topbar-logo { width: 28px; height: 28px; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.topbar-title { color: #fff; font-weight: 700; font-size: 16px; letter-spacing: .3px; }
.issue-badge { color: var(--badge-issue-fg); background: var(--badge-issue-bg); font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.topbar-range, .topbar-note { color: #8b949e; font-size: 12px; }
.topbar-note { margin-left: auto; }
.topbar-link { color: #58a6ff; font-size: 12px; }
.week-select { border: 1px solid var(--border); background: #f6f8fa; border-radius: 6px; padding: 3px 8px; font-size: 12px; color: var(--text); }

.stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 16px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
.stat-card .num { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
.stat-card .label { font-size: 11px; color: var(--text-muted); }
.stat-card.gain { border-left: 3px solid var(--success); }
.stat-card.gain .num { color: var(--success); }

.tabs { display: flex; gap: 2px; margin-top: 16px; border-bottom: 1px solid var(--border); align-items: center; }
.tab { padding: 8px 14px; font-size: 13px; color: var(--text-muted); background: none; border: none; cursor: pointer; }
.tab.active { color: var(--text); font-weight: 600; border-bottom: 2px solid #fd8c73; margin-bottom: -1px; }
.tabs-right { margin-left: auto; padding-bottom: 6px; }

.chips { display: flex; gap: 6px; margin: 14px 0 10px; flex-wrap: wrap; align-items: center; }
.chip { font-size: 12px; background: var(--surface); color: var(--text); border: 1px solid var(--border); padding: 4px 12px; border-radius: 16px; cursor: pointer; }
.chip.active { background: var(--topbar); color: #fff; border-color: var(--topbar); }
.chip .count { color: var(--text-muted); font-weight: 400; }
.chip.active .count { color: #c9d1d9; }

.board-table { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); border-collapse: collapse; }
.board-table th { background: #f6f8fa; font-size: 11px; color: var(--text-muted); font-weight: 600; text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.board-table th.num, .board-table td.num { text-align: right; }
.board-table td { padding: 9px 12px; border-bottom: 1px solid var(--border-muted); vertical-align: middle; font-variant-numeric: tabular-nums; }
.board-table tr:last-child td { border-bottom: none; }
.board-table tbody tr { cursor: pointer; }
.board-table tbody tr:hover { background: #f6f8fa; }
.rank { font-weight: 800; font-size: 15px; color: var(--text-muted); }
.rank.r1 { color: var(--rank-1); } .rank.r2 { color: var(--rank-2); } .rank.r3 { color: var(--rank-3); }
tr.hl-1 { background: linear-gradient(90deg, #fff8f0, #fff); }
tr.hl-2 { background: linear-gradient(90deg, #fafbff, #fff); }
tr.hl-3 { background: linear-gradient(90deg, #fffbf0, #fff); }
.repo-name { font-weight: 600; font-size: 13px; }
.repo-desc { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.lang-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.gain-up { color: var(--success); font-weight: 700; }
.gain-na { color: var(--text-faint); }
.stars-cell { color: var(--text-muted); }

.topic-section { margin-top: 18px; }
.topic-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.topic-icon { width: 22px; height: 22px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid var(--border); }
.topic-icon.ai { background: var(--purple-bg); }
.topic-icon.tools { background: var(--success-bg); }
.topic-title { font-size: 13px; font-weight: 700; }
.topic-count { font-size: 11px; color: var(--text-muted); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1px 8px; }
.topic-kw { font-size: 11px; }
.topic-kw.ai { color: var(--purple); } .topic-kw.tools { color: var(--success); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.repo-card { display: flex; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; }
.repo-badge { position: relative; width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 700; background: linear-gradient(135deg, var(--purple), var(--accent)); }
.repo-badge img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.repo-card-body { flex: 1; min-width: 0; }
.repo-card-meta { display: flex; gap: 10px; margin-top: 8px; align-items: center; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }
.topic-tag { font-size: 9.5px; color: var(--purple); background: var(--purple-bg); border: 1px solid var(--purple-border); border-radius: 10px; padding: 0 7px; }
.badge-gain { font-size: 10px; color: var(--success); background: var(--success-bg); border: 1px solid var(--success-border); border-radius: 10px; padding: 0 6px; margin-left: auto; font-weight: 600; }

.speed { font-size: 11px; color: #fff; border-radius: 4px; padding: 2px 7px; font-weight: 700; }
.speed.purple { background: var(--purple); } .speed.blue { background: var(--accent); } .speed.gray { background: var(--text-faint); }
.new-badge { background: var(--accent); color: #fff; border-radius: 4px; font-size: 9px; padding: 1px 5px; font-weight: 700; margin-left: 5px; }

.trend-summary { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 10px; display: flex; gap: 24px; flex-wrap: wrap; align-items: center; }
.trend-summary .item { font-size: 11px; color: var(--text-muted); }
.trend-summary .item b { display: block; font-size: 15px; color: var(--text); }
.trend-summary .item b.up { color: var(--success); } .trend-summary .item b.down { color: var(--danger); }
.trend-controls { margin-left: auto; display: flex; gap: 4px; align-items: center; font-size: 11px; color: var(--text-muted); }
.seg { font-size: 11px; border: 1px solid var(--border); background: var(--surface); border-radius: 5px; padding: 2px 8px; cursor: pointer; color: var(--text-muted); }
.seg.active { background: var(--topbar); color: #fff; border-color: var(--topbar); }
td.spark { text-align: center; }
.streak { font-weight: 700; color: var(--success); font-size: 11px; }
.streak.new { color: var(--purple); }
.rank-change { font-size: 11px; color: var(--text-muted); }
.rank-change.up { color: var(--success); } .rank-change.down { color: var(--danger); } .rank-change.new { color: var(--purple); }
.dropped { margin-top: 14px; font-size: 12px; color: var(--text-muted); }
.dropped summary { cursor: pointer; font-weight: 600; color: var(--text); }
.dropped ul { margin: 6px 0 0; padding-left: 18px; }

.empty-card { background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); padding: 16px; margin: 16px 0; color: var(--text-muted); font-size: 13px; }
.footer { text-align: center; padding: 20px 0 4px; font-size: 11px; color: var(--text-faint); }

@media (max-width: 720px) {
  .stats { grid-template-columns: 1fr 1fr; }
  .cards { grid-template-columns: 1fr; }
  .board-table .hide-sm { display: none; }
  .chips { overflow-x: auto; flex-wrap: nowrap; }
}
```

- [ ] **Step 3: 构建验证并提交**

Run: `npm run build ; git add -A ; git commit -m "feat: Primer 设计令牌与全局样式"`
Expected: 构建成功，提交成功。

---

### Task 3: scripts/lib/dates.mjs（TDD）

**Files:**
- Test: `scripts/lib/dates.test.mjs`
- Create: `scripts/lib/dates.mjs`

- [ ] **Step 1: 写失败测试 `scripts/lib/dates.test.mjs`**

```js
import { describe, expect, it } from 'vitest'
import { dateRange, shDate, shDaysAgo } from './dates.mjs'

describe('dates', () => {
  it('shDate 返回 Asia/Shanghai 日期', () => {
    expect(shDate(new Date('2026-08-15T16:30:00Z'))).toBe('2026-08-16')
    expect(shDate(new Date('2026-08-15T15:30:00Z'))).toBe('2026-08-15')
  })
  it('shDaysAgo 回退 N 天', () => {
    const now = new Date('2026-08-16T02:00:00Z')
    expect(shDaysAgo(7, now)).toBe('2026-08-09')
  })
  it('dateRange 生成 from/to', () => {
    const now = new Date('2026-08-15T16:30:00Z')
    expect(dateRange(now, 7)).toEqual({ from: '2026-08-09', to: '2026-08-16' })
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL（无法加载 `./dates.mjs`）。

- [ ] **Step 3: 实现 `scripts/lib/dates.mjs`**

```js
const TZ_OFFSET_MS = 8 * 3600 * 1000

export function shDate(now = new Date()) {
  return new Date(now.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10)
}

export function shDaysAgo(n, now = new Date()) {
  return shDate(new Date(now.getTime() - n * 86400 * 1000))
}

export function dateRange(now = new Date(), daysBack = 7) {
  return { from: shDaysAgo(daysBack, now), to: shDate(now) }
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: PASS（3 个用例）。

- [ ] **Step 5: 提交**

Run: `git add scripts/lib/dates.mjs scripts/lib/dates.test.mjs ; git commit -m "feat: 上海时区日期工具（TDD）"`

---

### Task 4: scripts/lib/queries.mjs（TDD）

**Files:**
- Test: `scripts/lib/queries.test.mjs`
- Create: `scripts/lib/queries.mjs`

- [ ] **Step 1: 写失败测试 `scripts/lib/queries.test.mjs`**

```js
import { describe, expect, it } from 'vitest'
import { LANGUAGES, qAI, qLanguage, qOverall, qRising, qTools } from './queries.mjs'

describe('queries', () => {
  const from = '2026-08-09'
  it('qOverall', () => expect(qOverall(from)).toBe('stars:>200 pushed:>2026-08-09'))
  it('qLanguage', () => expect(qLanguage(from, 'Python')).toBe('stars:>200 pushed:>2026-08-09 language:Python'))
  it('qAI 含关键词与门槛', () => {
    const q = qAI(from)
    expect(q).toContain('LLM')
    expect(q).toContain('stars:>500 pushed:>2026-08-09')
  })
  it('qTools 含关键词与门槛', () => {
    const q = qTools(from)
    expect(q).toContain('devtools')
    expect(q).toContain('stars:>500 pushed:>2026-08-09')
  })
  it('qRising', () => expect(qRising(from)).toBe('stars:>100 created:>2026-08-09'))
  it('LANGUAGES 覆盖 7 种', () => expect(LANGUAGES).toHaveLength(7))
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 实现 `scripts/lib/queries.mjs`**

```js
export const LANGUAGES = ['Python', 'TypeScript', 'Go', 'Rust', 'C++', 'Java', 'JavaScript']

export const qOverall = (from) => `stars:>200 pushed:>${from}`
export const qLanguage = (from, lang) => `stars:>200 pushed:>${from} language:${lang}`
export const qAI = (from) => `LLM OR GPT OR agent OR "large language model" OR RAG OR "AI framework" stars:>500 pushed:>${from}`
export const qTools = (from) => `"developer tools" OR devtools OR productivity OR "command line" OR "automation tool" stars:>500 pushed:>${from}`
export const qRising = (from) => `stars:>100 created:>${from}`
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

Run: `git add scripts/lib/queries.mjs scripts/lib/queries.test.mjs ; git commit -m "feat: Search API 查询构建器（TDD）"`

---

### Task 5: scripts/lib/clean.mjs（TDD）

**Files:**
- Test: `scripts/lib/clean.test.mjs`
- Create: `scripts/lib/clean.mjs`

- [ ] **Step 1: 写失败测试 `scripts/lib/clean.test.mjs`**

```js
import { describe, expect, it } from 'vitest'
import { buildPool, cleanRepo, daysOld, dedupe } from './clean.mjs'

const raw = {
  full_name: 'a/b',
  description: 'x'.repeat(300),
  stargazers_count: 100,
  forks_count: 5,
  language: 'Rust',
  html_url: 'https://github.com/a/b',
  topics: ['t1', 't2', 't3', 't4', 't5', 't6'],
  created_at: '2026-08-10T01:02:03Z',
  pushed_at: '2026-08-15T01:02:03Z',
  owner: { login: 'a', avatar_url: 'https://avatars.githubusercontent.com/u/1' },
}

describe('clean', () => {
  it('cleanRepo 截断描述并裁剪 topics', () => {
    const r = cleanRepo(raw)
    expect(r.name).toBe('a/b')
    expect(r.description).toHaveLength(160)
    expect(r.topics).toEqual(['t1', 't2', 't3', 't4'])
    expect(r.language).toBe('Rust')
    expect(r.createdAt).toBe('2026-08-10')
  })
  it('cleanRepo 处理空字段', () => {
    const r = cleanRepo({ full_name: 'x/y' })
    expect(r.description).toBe('')
    expect(r.language).toBeNull()
    expect(r.topics).toEqual([])
  })
  it('dedupe 按 name 去重保序', () => {
    const a = { name: 'a/b' }, b = { name: 'c/d' }
    expect(dedupe([a, b, { name: 'a/b' }])).toEqual([a, b])
  })
  it('buildPool 生成 name→stars 映射', () => {
    expect(buildPool([{ name: 'a/b', stars: 10 }, { name: 'c/d', stars: 20 }])).toEqual({ 'a/b': 10, 'c/d': 20 })
  })
  it('daysOld 正确且至少为 1', () => {
    expect(daysOld('2026-08-10', '2026-08-16')).toBe(6)
    expect(daysOld('2026-08-16', '2026-08-16')).toBe(1)
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL。

- [ ] **Step 3: 实现 `scripts/lib/clean.mjs`**

```js
const DAY_MS = 86400 * 1000

export function cleanRepo(item) {
  return {
    name: item.full_name,
    owner: item.owner?.login ?? '',
    avatar: item.owner?.avatar_url ?? '',
    description: (item.description ?? '').slice(0, 160),
    url: item.html_url,
    stars: item.stargazers_count ?? 0,
    forks: item.forks_count ?? 0,
    language: item.language ?? null,
    topics: (item.topics ?? []).slice(0, 4),
    createdAt: (item.created_at ?? '').slice(0, 10),
    pushedAt: (item.pushed_at ?? '').slice(0, 10),
  }
}

export function dedupe(list) {
  const seen = new Set()
  return list.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)))
}

export function buildPool(repos) {
  return Object.fromEntries(repos.map((r) => [r.name, r.stars]))
}

export function daysOld(createdAt, toDate) {
  return Math.max(1, Math.round((Date.parse(toDate) - Date.parse(createdAt)) / DAY_MS))
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

Run: `git add scripts/lib/clean.mjs scripts/lib/clean.test.mjs ; git commit -m "feat: 仓库数据清洗与候选池构建（TDD）"`

---

### Task 6: scripts/lib/diff.mjs（TDD）

**Files:**
- Test: `scripts/lib/diff.test.mjs`
- Create: `scripts/lib/diff.mjs`

- [ ] **Step 1: 写失败测试 `scripts/lib/diff.test.mjs`**

```js
import { describe, expect, it } from 'vitest'
import { computeGains, entryChanges, rankOverall } from './diff.mjs'

const c = (name, stars) => ({ name, stars })

describe('computeGains', () => {
  it('已知 gain = 本期 − 上期；新面孔为 null', () => {
    const gains = computeGains([c('a/b', 110), c('c/d', 50)], { 'a/b': 100 })
    expect(gains.get('a/b')).toBe(10)
    expect(gains.get('c/d')).toBeNull()
  })
  it('无上期时全部 null', () => {
    const gains = computeGains([c('a/b', 1)], {})
    expect(gains.get('a/b')).toBeNull()
  })
})

describe('rankOverall', () => {
  const candidates = [c('big', 5000), c('hot', 800), c('new', 3000), c('warm', 600)]
  const gains = new Map([['big', null], ['hot', 200], ['new', null], ['warm', 50]])
  const prevRanks = { hot: 1 }
  it('已知 gain 优先按 gain 降序，未知按 stars 补足，标注 prevRank', () => {
    const ranked = rankOverall(candidates, gains, prevRanks, 3)
    expect(ranked.map((r) => r.name)).toEqual(['hot', 'warm', 'new'])
    expect(ranked[0]).toMatchObject({ rank: 1, weeklyGain: 200, prevRank: 1 })
    expect(ranked[2]).toMatchObject({ rank: 3, weeklyGain: null, prevRank: null })
  })
  it('默认取 25', () => {
    const many = Array.from({ length: 40 }, (_, i) => c(`r${i}`, 1000 + i))
    const g = new Map(many.map((r) => [r.name, 0]))
    expect(rankOverall(many, g)).toHaveLength(25)
  })
})

describe('entryChanges', () => {
  it('统计新上榜与掉榜', () => {
    expect(entryChanges(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual({ newEntries: 1, droppedEntries: 1 })
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL。

- [ ] **Step 3: 实现 `scripts/lib/diff.mjs`**

```js
export function computeGains(candidates, prevPool = {}) {
  const gains = new Map()
  for (const r of candidates) {
    const prev = prevPool[r.name]
    gains.set(r.name, prev === undefined ? null : r.stars - prev)
  }
  return gains
}

export function rankOverall(candidates, gains, prevRanks = {}, topN = 25) {
  const known = []
  const unknown = []
  for (const r of candidates) {
    const gain = gains.get(r.name)
    if (gain === null || gain === undefined) unknown.push({ repo: r, gain: null })
    else known.push({ repo: r, gain })
  }
  known.sort((a, b) => b.gain - a.gain || b.repo.stars - a.repo.stars)
  unknown.sort((a, b) => b.repo.stars - a.repo.stars)
  return [...known, ...unknown].slice(0, topN).map((e, i) => ({
    ...e.repo,
    rank: i + 1,
    weeklyGain: e.gain,
    prevRank: prevRanks[e.repo.name] ?? null,
  }))
}

export function entryChanges(currentNames, prevNames = []) {
  const cur = new Set(currentNames)
  const prev = new Set(prevNames)
  let newEntries = 0
  let droppedEntries = 0
  for (const n of cur) if (!prev.has(n)) newEntries++
  for (const n of prev) if (!cur.has(n)) droppedEntries++
  return { newEntries, droppedEntries }
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

Run: `git add scripts/lib/diff.mjs scripts/lib/diff.test.mjs ; git commit -m "feat: 周涨星计算与热榜排名（TDD）"`

---

### Task 7: scripts/lib/persist.mjs（TDD）

**Files:**
- Test: `scripts/lib/persist.test.mjs`
- Create: `scripts/lib/persist.mjs`

- [ ] **Step 1: 写失败测试 `scripts/lib/persist.test.mjs`**

```js
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { buildHistory, buildSnapshot, buildTrends, writeDataFiles } from './persist.mjs'

const dir = mkdtempSync(join(tmpdir(), 'radar-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

const mkRepo = (name, stars, extra = {}) => ({
  name, owner: 'o', avatar: '', description: 'd', url: `https://github.com/${name}`,
  stars, forks: 1, language: 'Rust', topics: [], createdAt: '2026-01-01', pushedAt: '2026-08-15', ...extra,
})
const range = { from: '2026-08-09', to: '2026-08-16' }

describe('buildSnapshot', () => {
  const boards = {
    overall: [{ ...mkRepo('a/b', 110), rank: 1, weeklyGain: 10, prevRank: null },
              { ...mkRepo('c/d', 50), rank: 2, weeklyGain: null, prevRank: 2 }],
    ai: [mkRepo('a/b', 110)],
    tools: [mkRepo('t/u', 70)],
    rising: [{ ...mkRepo('n/e', 20, { createdAt: '2026-08-14' }), daysOld: 2, starsPerDay: 10 }],
  }
  it('stats 汇总正确（去重、涨星和、新上榜/掉榜）', () => {
    const s = buildSnapshot({ issue: 2, generatedAt: 'T', range, boards, pool: { 'a/b': 110, 'c/d': 50, 't/u': 70 },
      prev: { overall: [{ name: 'c/d', rank: 2 }, { name: 'x/y', rank: 1 }] } })
    expect(s.stats.totalRepos).toBe(4)
    expect(s.stats.totalStars).toBe(110 + 50 + 70 + 20)
    expect(s.stats.weeklyStarGain).toBe(10)
    expect(s.stats.aiCount).toBe(1)
    expect(s.stats.toolsCount).toBe(1)
    expect(s.stats.languageCount).toBe(1)
    expect(s.stats.newEntries).toBe(1)
    expect(s.stats.droppedEntries).toBe(1)
    expect(s.dateRange).toEqual(range)
  })
})

describe('buildHistory', () => {
  it('追加新期且按期号升序', () => {
    const prev = { issues: [{ issue: 1, date: '2026-08-09', file: 'snapshots/2026-08-09.json', stats: {} }] }
    const snap = { issue: 2, dateRange: range, stats: { totalRepos: 1 } }
    const h = buildHistory(prev, snap)
    expect(h.issues).toHaveLength(2)
    expect(h.issues[1]).toMatchObject({ issue: 2, date: '2026-08-16', file: 'snapshots/2026-08-16.json' })
  })
  it('同期重跑则替换该期', () => {
    const prev = { issues: [{ issue: 1, date: '2026-08-16', file: 'snapshots/2026-08-16.json', stats: { totalRepos: 1 } }] }
    const snap = { issue: 1, dateRange: range, stats: { totalRepos: 2 } }
    const h = buildHistory(prev, snap)
    expect(h.issues).toHaveLength(1)
    expect(h.issues[0].stats.totalRepos).toBe(2)
  })
})

describe('buildTrends', () => {
  const snap = { issue: 3, dateRange: range,
    overall: [{ name: 'a/b', rank: 1, stars: 120, weeklyGain: 10 }],
    topics: { ai: [{ name: 'z/z', stars: 30 }], tools: [] },
    risingStars: [{ name: 'n/n', stars: 5 }] }
  it('为上榜仓库追加本周记录，rank 未上热榜为 0', () => {
    const prev = { repos: { 'a/b': { weeks: [{ issue: 2, date: '2026-08-09', stars: 110, rank: 1, weeklyGain: 8 }] } } }
    const t = buildTrends(prev, snap)
    expect(t.repos['a/b'].weeks).toHaveLength(2)
    expect(t.repos['a/b'].weeks[1]).toEqual({ issue: 3, date: '2026-08-16', stars: 120, rank: 1, weeklyGain: 10 })
    expect(t.repos['z/z'].weeks[0].rank).toBe(0)
  })
  it('超过 16 周未上榜的仓库被剔除', () => {
    const prev = { repos: { ghost: { weeks: [{ issue: 1, date: '2026-04-12', stars: 1, rank: 0, weeklyGain: 0 }] } } }
    const t = buildTrends(prev, snap)
    expect(t.repos.ghost).toBeUndefined()
  })
})

describe('writeDataFiles', () => {
  it('写入 4 个文件，snapshots 目录自动创建', () => {
    const snap = { issue: 1, generatedAt: 'T', dateRange: range, stats: {}, overall: [], topics: { ai: [], tools: [] }, risingStars: [], pool: {} }
    const history = { issues: [{ issue: 1, date: '2026-08-16', file: 'snapshots/2026-08-16.json', stats: {} }] }
    const trends = { repos: {} }
    writeDataFiles(dir, snap, history, trends)
    expect(JSON.parse(readFileSync(join(dir, 'latest.json'), 'utf8')).issue).toBe(1)
    expect(JSON.parse(readFileSync(join(dir, 'history.json'), 'utf8')).issues).toHaveLength(1)
    expect(JSON.parse(readFileSync(join(dir, 'trends.json'), 'utf8')).repos).toEqual({})
    expect(JSON.parse(readFileSync(join(dir, 'snapshots', '2026-08-16.json'), 'utf8')).issue).toBe(1)
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL。

- [ ] **Step 3: 实现 `scripts/lib/persist.mjs`**

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { entryChanges } from './diff.mjs'

const TREND_WINDOW = 16

export function buildSnapshot({ issue, generatedAt, range, boards, pool, prev }) {
  const { overall, ai, tools, rising } = boards
  const tracked = []
  const seen = new Set()
  for (const r of [...overall, ...ai, ...tools, ...rising]) {
    if (!seen.has(r.name)) { seen.add(r.name); tracked.push(r) }
  }
  const prevNames = (prev?.overall ?? []).map((r) => r.name)
  const { newEntries, droppedEntries } = entryChanges(overall.map((r) => r.name), prevNames)
  const languages = new Set(tracked.map((r) => r.language).filter(Boolean))
  return {
    issue,
    generatedAt,
    dateRange: range,
    stats: {
      totalRepos: tracked.length,
      totalStars: tracked.reduce((s, r) => s + r.stars, 0),
      weeklyStarGain: overall.reduce((s, r) => s + (r.weeklyGain ?? 0), 0),
      aiCount: ai.length,
      toolsCount: tools.length,
      languageCount: languages.size,
      newEntries,
      droppedEntries,
    },
    overall,
    topics: { ai, tools },
    risingStars: rising,
    pool,
  }
}

export function buildHistory(prev, snapshot) {
  const entry = {
    issue: snapshot.issue,
    date: snapshot.dateRange.to,
    file: `snapshots/${snapshot.dateRange.to}.json`,
    stats: snapshot.stats,
  }
  const issues = (prev?.issues ?? []).filter((e) => e.issue !== snapshot.issue)
  issues.push(entry)
  issues.sort((a, b) => a.issue - b.issue)
  return { issues }
}

export function buildTrends(prev, snapshot) {
  const rankMap = new Map(snapshot.overall.map((r) => [r.name, r.rank]))
  const starMap = new Map()
  const gainMap = new Map()
  for (const r of snapshot.overall) { starMap.set(r.name, r.stars); gainMap.set(r.name, r.weeklyGain ?? 0) }
  for (const r of [...snapshot.topics.ai, ...snapshot.topics.tools, ...snapshot.risingStars]) {
    if (!starMap.has(r.name)) { starMap.set(r.name, r.stars); gainMap.set(r.name, 0) }
  }
  const repos = {}
  for (const name of starMap.keys()) {
    const weeks = [...(prev?.repos?.[name]?.weeks ?? []),
      { issue: snapshot.issue, date: snapshot.dateRange.to, stars: starMap.get(name), rank: rankMap.get(name) ?? 0, weeklyGain: gainMap.get(name) }]
      .slice(-TREND_WINDOW)
    repos[name] = { weeks }
  }
  for (const [name, v] of Object.entries(prev?.repos ?? {})) {
    const lastIssue = v.weeks.at(-1)?.issue ?? 0
    if (lastIssue > snapshot.issue - TREND_WINDOW && !repos[name]) repos[name] = { weeks: v.weeks }
  }
  return { repos }
}

export function writeDataFiles(dataDir, snapshot, history, trends) {
  mkdirSync(join(dataDir, 'snapshots'), { recursive: true })
  const json = JSON.stringify(snapshot, null, 2)
  writeFileSync(join(dataDir, 'snapshots', `${snapshot.dateRange.to}.json`), json + '\n', 'utf8')
  writeFileSync(join(dataDir, 'latest.json'), json + '\n', 'utf8')
  writeFileSync(join(dataDir, 'history.json'), JSON.stringify(history, null, 2) + '\n', 'utf8')
  writeFileSync(join(dataDir, 'trends.json'), JSON.stringify(trends, null, 2) + '\n', 'utf8')
}

export function readJsonIfExists(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: PASS（含窗口剔除与同期替换）。

- [ ] **Step 5: 提交**

Run: `git add scripts/lib/persist.mjs scripts/lib/persist.test.mjs ; git commit -m "feat: 快照/历史/趋势落盘构建器（TDD）"`

---

### Task 8: GitHub API 客户端与抓取入口

**Files:**
- Create: `scripts/lib/github-api.mjs`
- Create: `scripts/fetch-trending.mjs`

- [ ] **Step 1: 写 `scripts/lib/github-api.mjs`**

```js
import https from 'node:https'

function requestOnce(endpoint, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'github-radar/1.0',
      Accept: 'application/vnd.github.v3+json',
    }
    if (token) headers.Authorization = `Bearer ${token}`
    https.get({ hostname: 'api.github.com', path: endpoint, headers }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API ${res.statusCode}: ${body.slice(0, 200)}`))
          return
        }
        try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function searchRepos({ q, sort = 'stars', order = 'desc', perPage = 30, page = 1 }, token, retries = 3) {
  const endpoint = `/search/repositories?q=${encodeURIComponent(q)}&sort=${sort}&order=${order}&per_page=${perPage}&page=${page}`
  let lastErr
  for (let attempt = 1; attempt <= retries; attempt++) {
    try { return await requestOnce(endpoint, token) }
    catch (e) {
      lastErr = e
      if (attempt < retries) await sleep(2000 * 2 ** (attempt - 1))
    }
  }
  throw lastErr
}
```

- [ ] **Step 2: 写 `scripts/fetch-trending.mjs`**

```js
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPool, cleanRepo, daysOld, dedupe } from './lib/clean.mjs'
import { computeGains, rankOverall } from './lib/diff.mjs'
import { LANGUAGES, qAI, qLanguage, qOverall, qRising, qTools } from './lib/queries.mjs'
import { buildHistory, buildSnapshot, buildTrends, readJsonIfExists, writeDataFiles } from './lib/persist.mjs'
import { searchRepos } from './lib/github-api.mjs'
import { dateRange } from './lib/dates.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const dateIdx = args.indexOf('--date')
const DATE = dateIdx !== -1 ? args[dateIdx + 1] : null
const dirIdx = args.indexOf('--data-dir')
const DATA_DIR = dirIdx !== -1 ? args[dirIdx + 1] : join(ROOT, 'public', 'data')
const TOKEN = process.env.GITHUB_TOKEN ?? ''
const SPACING = TOKEN ? 2500 : 6500
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchItems(q, perPage, page = 1) {
  const data = await searchRepos({ q, perPage, page }, TOKEN)
  console.log(`  ${q.slice(0, 60)}… → ${data.items?.length ?? 0} 条`)
  return data.items ?? []
}

async function main() {
  const range = DATE
    ? { from: new Date((Date.parse(`${DATE}T12:00:00Z`) - 7 * 86400 * 1000)).toISOString().slice(0, 10), to: DATE }
    : dateRange()
  const { from, to } = range
  console.log(`GitHub Radar 抓取开始：${from} → ${to}（token: ${TOKEN ? '有，2.5s 间隔' : '无，6.5s 限速'}）`)

  const prevSnapshot = readJsonIfExists(join(DATA_DIR, 'snapshots', `${to}.json`))
    ?? readJsonIfExists(join(DATA_DIR, 'latest.json'))
  const prevHistory = readJsonIfExists(join(DATA_DIR, 'history.json'))
  const prevTrends = readJsonIfExists(join(DATA_DIR, 'trends.json'))

  const overallRaw = [...await fetchItems(qOverall(from), 100, 1)]
  await sleep(SPACING)
  overallRaw.push(...await fetchItems(qOverall(from), 100, 2))
  await sleep(SPACING)
  const langRaw = []
  for (const lang of LANGUAGES) {
    langRaw.push(...await fetchItems(qLanguage(from, lang), 30))
    await sleep(SPACING)
  }
  const aiRaw = await fetchItems(qAI(from), 12)
  await sleep(SPACING)
  const toolsRaw = await fetchItems(qTools(from), 12)
  await sleep(SPACING)
  const risingRaw = await fetchItems(qRising(from), 10)

  const candidates = dedupe([...overallRaw, ...langRaw].map(cleanRepo))
  const ai = dedupe(aiRaw.map(cleanRepo)).slice(0, 12)
  const tools = dedupe(toolsRaw.map(cleanRepo)).slice(0, 12)
  const rising = dedupe(risingRaw.map(cleanRepo))
    .slice(0, 10)
    .map((r) => {
      const days = daysOld(r.createdAt, to)
      return { ...r, daysOld: days, starsPerDay: Math.ceil(r.stars / days) }
    })

  const gains = computeGains(candidates, prevSnapshot?.pool)
  const prevRanks = Object.fromEntries((prevSnapshot?.overall ?? []).map((r) => [r.name, r.rank]))
  const overall = rankOverall(candidates, gains, prevRanks, 25)

  const sameDay = (prevHistory?.issues ?? []).find((e) => e.date === to)
  const issue = sameDay?.issue ?? (prevHistory?.issues?.at(-1)?.issue ?? 0) + 1
  const snapshot = buildSnapshot({ issue, generatedAt: new Date().toISOString(), range,
    boards: { overall, ai, tools, rising }, pool: buildPool(candidates), prev: prevSnapshot })
  const history = buildHistory(prevHistory, snapshot)
  const trends = buildTrends(prevTrends, snapshot)

  writeDataFiles(DATA_DIR, snapshot, history, trends)
  console.log(`完成：第 ${issue} 期 · 热榜 ${overall.length} · 候选池 ${Object.keys(snapshot.pool).length} · 数据目录 ${DATA_DIR}`)
}

main().catch((e) => { console.error('抓取失败：', e.message); process.exit(1) })
```

- [ ] **Step 3: 语法检查**

Run: `node --check scripts/fetch-trending.mjs ; node --check scripts/lib/github-api.mjs`
Expected: 无输出（语法通过）。

- [ ] **Step 4: 提交**

Run: `git add scripts/fetch-trending.mjs scripts/lib/github-api.mjs ; git commit -m "feat: GitHub API 客户端与抓取入口（限速/重试/幂等重跑）"`

---

### Task 9: 生成首期数据（seed）

**Files:**
- Create（脚本生成）: `public/data/snapshots/2026-08-16.json`, `public/data/latest.json`, `public/data/history.json`, `public/data/trends.json`

- [ ] **Step 1: 运行抓取（以 2026-08-16 作为首期日期）**

Run: `node scripts/fetch-trending.mjs --date 2026-08-16`
Expected: 输出各查询条数，最终 `完成：第 1 期 · 热榜 25 · 候选池 200+`；`public/data/` 下生成 4 组文件。
若 API 超时/连接重置：稍后重试一次（脚本幂等，同日重跑覆盖）。

- [ ] **Step 2: 校验数据形状**

Run: `node -e "const s=require('./public/data/latest.json'); console.log(s.issue, s.dateRange.to, s.overall.length, Object.keys(s.pool).length, s.stats.totalRepos, s.risingStars[0]?.starsPerDay)"`
Expected: `1 2026-08-16 25 <候选池数> <去重仓库数> <正整数>`

- [ ] **Step 3: 提交**

Run: `git add public/data ; git commit -m "data: 2026-08-16 weekly snapshot (#1)"`

---

### Task 10: src/lib 类型与格式化工具（TDD）

**Files:**
- Create: `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/langColors.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: 写 `src/lib/types.ts`**

```ts
export interface Repo {
  name: string
  owner: string
  avatar: string
  description: string
  url: string
  stars: number
  forks: number
  language: string | null
  topics: string[]
  createdAt: string
  pushedAt: string
}

export interface RankedRepo extends Repo {
  rank: number
  weeklyGain: number | null
  prevRank: number | null
}

export interface NewRepo extends Repo {
  daysOld: number
  starsPerDay: number
}

export interface SnapshotStats {
  totalRepos: number
  totalStars: number
  weeklyStarGain: number
  aiCount: number
  toolsCount: number
  languageCount: number
  newEntries: number
  droppedEntries: number
}

export interface Snapshot {
  issue: number
  generatedAt: string
  dateRange: { from: string; to: string }
  stats: SnapshotStats
  overall: RankedRepo[]
  topics: { ai: Repo[]; tools: Repo[] }
  risingStars: NewRepo[]
  pool: Record<string, number>
}

export interface HistoryEntry { issue: number; date: string; file: string; stats: SnapshotStats }
export interface HistoryFile { issues: HistoryEntry[] }

export interface TrendWeek { issue: number; date: string; stars: number; rank: number; weeklyGain: number }
export interface TrendsFile { repos: Record<string, { weeks: TrendWeek[] }> }
```

- [ ] **Step 2: 写失败测试 `src/lib/format.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { fmtStars, speedBadge } from './format'

describe('fmtStars', () => {
  it('千/百万缩写', () => {
    expect(fmtStars(999)).toBe('999')
    expect(fmtStars(1000)).toBe('1k')
    expect(fmtStars(1200)).toBe('1.2k')
    expect(fmtStars(46200)).toBe('46.2k')
    expect(fmtStars(1200000)).toBe('1.2M')
  })
})

describe('speedBadge', () => {
  it('>1000 紫、>300 蓝、其余灰', () => {
    expect(speedBadge(2051)).toBe('purple')
    expect(speedBadge(476)).toBe('blue')
    expect(speedBadge(100)).toBe('gray')
  })
})
```

- [ ] **Step 3: 运行确认失败**

Run: `npm test`
Expected: FAIL（模块不存在）。

- [ ] **Step 4: 实现 `src/lib/format.ts`**

```ts
const trim = (s: string) => s.replace(/\.0$/, '')

export function fmtStars(n: number): string {
  if (n >= 1e6) return trim((n / 1e6).toFixed(1)) + 'M'
  if (n >= 1e3) return trim((n / 1e3).toFixed(1)) + 'k'
  return String(n)
}

export function speedBadge(spd: number): 'purple' | 'blue' | 'gray' {
  if (spd > 1000) return 'purple'
  if (spd > 300) return 'blue'
  return 'gray'
}
```

- [ ] **Step 5: 写 `src/lib/langColors.ts`**

```ts
const COLORS: Record<string, string> = {
  Python: '#3572A5', TypeScript: '#3178C6', JavaScript: '#F1E05A', Go: '#00ADD8',
  Rust: '#DEA584', 'C++': '#F34B7D', C: '#555555', Java: '#B07219', 'C#': '#178600',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Dart: '#00B4AB', Shell: '#89E051', HTML: '#E34C26', CSS: '#563D7C',
  Vue: '#41B883', Svelte: '#FF3E00', Zig: '#EC915C', Lua: '#000080', Haskell: '#5E5086',
  Elixir: '#6E4A7E', Scala: '#C22D40', 'Jupyter Notebook': '#DA5B0B', MDX: '#FCB32C',
}

export function langColor(lang: string | null): string {
  return (lang && COLORS[lang]) || '#8c959f'
}
```

- [ ] **Step 6: 运行确认通过并提交**

Run: `npm test ; npm run build ; git add src/lib/types.ts src/lib/format.ts src/lib/format.test.ts src/lib/langColors.ts ; git commit -m "feat: 前端类型与格式化工具（TDD）"`
Expected: 测试 PASS，构建成功。

---

### Task 11: src/lib 数据加载与趋势计算（TDD）

**Files:**
- Create: `src/lib/data.ts`, `src/lib/trends.ts`
- Test: `src/lib/trends.test.ts`

- [ ] **Step 1: 写 `src/lib/data.ts`**

```ts
import type { HistoryFile, Snapshot, TrendsFile } from './types'

const base = import.meta.env.BASE_URL

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base}data/${path}`)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export const loadLatest = () => getJson<Snapshot>('latest.json')
export const loadHistory = () => getJson<HistoryFile>('history.json')
export const loadSnapshot = (file: string) => getJson<Snapshot>(file)
export const loadTrends = () => getJson<TrendsFile>('trends.json')
```

- [ ] **Step 2: 写失败测试 `src/lib/trends.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { TrendsFile } from './types'
import { buildTrendRows, computeStreak, droppedRepos, sortTrendRows, sparklineColor } from './trends'

const w = (issue: number, rank: number, gain: number) => ({ issue, date: `d${issue}`, stars: 100 + issue, rank, weeklyGain: gain })

describe('computeStreak', () => {
  it('从当前期往回数连续期数', () => {
    expect(computeStreak([w(1, 1, 5), w(2, 1, 5), w(3, 1, 5)], 3)).toBe(3)
    expect(computeStreak([w(1, 1, 5), w(3, 1, 5)], 3)).toBe(1)
    expect(computeStreak([w(1, 1, 5), w(2, 1, 5)], 3)).toBe(0)
  })
})

describe('buildTrendRows', () => {
  const trends: TrendsFile = { repos: {
    'a/a': { weeks: [w(1, 1, 5), w(2, 1, 6)] },
    'b/b': { weeks: [w(2, 0, 2), w(3, 2, 3)] },
    'c/c': { weeks: [w(3, 5, 1)] },
  } }
  it('streak/rankNow/prevRank/avgGain 正确', () => {
    const rows = buildTrendRows(trends, 3)
    const b = rows.find((r) => r.name === 'b/b')!
    expect(b).toMatchObject({ streak: 2, rankNow: 2, prevRank: 0, avgGain: 2.5 })
    expect(rows.find((r) => r.name === 'a/a')!.streak).toBe(0)
  })
})

describe('droppedRepos', () => {
  it('最后记录早于当前期即掉榜', () => {
    const trends: TrendsFile = { repos: { 'a/a': { weeks: [w(2, 1, 5)] }, 'b/b': { weeks: [w(3, 1, 5)] } } }
    expect(droppedRepos(trends, 3)).toEqual([{ name: 'a/a', lastIssue: 2, stars: 102 }])
  })
})

describe('sortTrendRows', () => {
  const rows = [
    { name: 'x', weeks: [] as never[], streak: 2, rankNow: 1, prevRank: 3, avgGain: 10 },
    { name: 'y', weeks: [] as never[], streak: 5, rankNow: 2, prevRank: 1, avgGain: 50 },
    { name: 'z', weeks: [] as never[], streak: 5, rankNow: 0, prevRank: 0, avgGain: 5 },
  ]
  it('按 streak/gain/rise 排序', () => {
    expect(sortTrendRows(rows, 'streak').map((r) => r.name)).toEqual(['y', 'z', 'x'])
    expect(sortTrendRows(rows, 'gain').map((r) => r.name)).toEqual(['y', 'x', 'z'])
    expect(sortTrendRows(rows, 'rise').map((r) => r.name)).toEqual(['x', 'y', 'z'])
  })
})

describe('sparklineColor', () => {
  it('streak=1 紫；末值≥首值绿否则红', () => {
    expect(sparklineColor({ streak: 1, weeks: [w(1, 1, 1), w(2, 1, 9)] })).toBe('purple')
    expect(sparklineColor({ streak: 3, weeks: [w(1, 1, 2), w(2, 1, 9)] })).toBe('green')
    expect(sparklineColor({ streak: 3, weeks: [w(1, 1, 9), w(2, 1, 2)] })).toBe('red')
  })
})
```

- [ ] **Step 3: 运行确认失败**

Run: `npm test`
Expected: FAIL。

- [ ] **Step 4: 实现 `src/lib/trends.ts`**

```ts
import type { TrendWeek, TrendsFile } from './types'

export interface TrendRow {
  name: string
  weeks: TrendWeek[]
  streak: number
  rankNow: number
  prevRank: number
  avgGain: number
}

export function computeStreak(weeks: TrendWeek[], currentIssue: number): number {
  let expected = currentIssue
  let streak = 0
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].issue !== expected) break
    streak++
    expected--
  }
  return streak
}

export function buildTrendRows(trends: TrendsFile, currentIssue: number): TrendRow[] {
  return Object.entries(trends.repos).map(([name, { weeks }]) => {
    const last = weeks[weeks.length - 1]
    const prev = weeks.find((wk) => wk.issue === currentIssue - 1)
    return {
      name,
      weeks,
      streak: computeStreak(weeks, currentIssue),
      rankNow: last?.rank ?? 0,
      prevRank: prev?.rank ?? 0,
      avgGain: Math.round((weeks.reduce((s, wk) => s + wk.weeklyGain, 0) / weeks.length) * 10) / 10,
    }
  })
}

export function droppedRepos(trends: TrendsFile, currentIssue: number) {
  return Object.entries(trends.repos)
    .map(([name, { weeks }]) => ({ name, lastIssue: weeks[weeks.length - 1]?.issue ?? 0, stars: weeks[weeks.length - 1]?.stars ?? 0 }))
    .filter((r) => r.lastIssue < currentIssue)
    .sort((a, b) => b.lastIssue - a.lastIssue)
}

export type TrendSort = 'streak' | 'gain' | 'rise'

export function sortTrendRows(rows: TrendRow[], by: TrendSort): TrendRow[] {
  const riseScore = (r: TrendRow) => (r.prevRank > 0 && r.rankNow > 0 ? r.prevRank - r.rankNow : -999)
  const sorted = [...rows]
  if (by === 'streak') sorted.sort((a, b) => b.streak - a.streak || b.avgGain - a.avgGain)
  else if (by === 'gain') sorted.sort((a, b) => b.avgGain - a.avgGain)
  else sorted.sort((a, b) => riseScore(b) - riseScore(a))
  return sorted
}

export function sparklineColor(row: Pick<TrendRow, 'streak' | 'weeks'>): 'green' | 'red' | 'purple' {
  if (row.streak === 1) return 'purple'
  const first = row.weeks[0]?.weeklyGain ?? 0
  const last = row.weeks[row.weeks.length - 1]?.weeklyGain ?? 0
  return last >= first ? 'green' : 'red'
}
```

- [ ] **Step 5: 运行确认通过并提交**

Run: `npm test ; git add src/lib/data.ts src/lib/trends.ts src/lib/trends.test.ts ; git commit -m "feat: 数据加载与趋势计算（streak/掉榜/排序，TDD）"`
Expected: PASS。

---

### Task 12: 应用骨架（App / Topbar / Stats）

**Files:**
- Modify: `src/App.tsx`（替换占位）
- Modify: `src/vite-env.d.ts`（追加版本常量声明）
- Create: `src/components/Topbar.tsx`, `src/components/Stats.tsx`

- [ ] **Step 1: `src/vite-env.d.ts` 追加一行**

```ts
declare const __APP_VERSION__: string
```

- [ ] **Step 2: 写 `src/components/Topbar.tsx`**

```tsx
import type { HistoryEntry, Snapshot } from '../lib/types'

interface Props {
  snapshot: Snapshot
  history: HistoryEntry[]
  weekFile: string
  onWeekChange: (file: string) => void
}

export default function Topbar({ snapshot, history, weekFile, onWeekChange }: Props) {
  const options = [
    { value: 'latest', label: `最新 · 第 ${snapshot.issue} 期` },
    ...[...history].reverse().map((e) => ({ value: e.file, label: `第 ${e.issue} 期 · ${e.date}` })),
  ]
  return (
    <header className="topbar">
      <span className="topbar-logo">📡</span>
      <span className="topbar-title">GitHub Radar</span>
      <span className="issue-badge">第 {snapshot.issue} 期</span>
      <span className="topbar-range">{snapshot.dateRange.from} ~ {snapshot.dateRange.to}</span>
      <select className="week-select" value={weekFile} onChange={(e) => onWeekChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="topbar-note">每周日自动更新</span>
    </header>
  )
}
```

- [ ] **Step 3: 写 `src/components/Stats.tsx`**

```tsx
import { fmtStars } from '../lib/format'
import type { SnapshotStats } from '../lib/types'

export default function Stats({ stats }: { stats: SnapshotStats }) {
  const items = [
    { num: String(stats.totalRepos), label: '追踪仓库', gain: false },
    { num: fmtStars(stats.weeklyStarGain), label: '周涨星合计', gain: true },
    { num: `+${stats.newEntries} / -${stats.droppedEntries}`, label: '新上榜 / 掉榜', gain: false },
    { num: String(stats.aiCount), label: 'AI 主题入库', gain: false },
    { num: `${stats.languageCount} 种`, label: '覆盖语言', gain: false },
  ]
  return (
    <section className="stats">
      {items.map((it) => (
        <div key={it.label} className={`stat-card${it.gain ? ' gain' : ''}`}>
          <div className="num">{it.num}</div>
          <div className="label">{it.label}</div>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: 替换 `src/App.tsx`**

```tsx
import { useEffect, useState } from 'react'
import Leaderboard from './components/Leaderboard'
import RisingStars from './components/RisingStars'
import Stats from './components/Stats'
import Topbar from './components/Topbar'
import TopicBoards from './components/TopicBoards'
import TrendView from './components/TrendView'
import { loadHistory, loadLatest, loadSnapshot } from './lib/data'
import type { HistoryEntry, Snapshot } from './lib/types'

type TabId = 'leaderboard' | 'topics' | 'rising' | 'trends'
const TABS: { id: TabId; label: string }[] = [
  { id: 'leaderboard', label: '周榜总览' },
  { id: 'topics', label: '主题榜' },
  { id: 'rising', label: '新星榜' },
  { id: 'trends', label: '趋势' },
]

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [weekFile, setWeekFile] = useState('latest')
  const [tab, setTab] = useState<TabId>('leaderboard')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([loadLatest(), loadHistory()])
      .then(([snap, hist]) => {
        setSnapshot(snap)
        setHistory(hist.issues)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const switchWeek = (file: string) => {
    setWeekFile(file)
    const p = file === 'latest' ? loadLatest() : loadSnapshot(file)
    p.then(setSnapshot).catch((e: Error) => setError(e.message))
  }

  if (error) {
    return <div className="page"><div className="empty-card">数据加载失败：{error}</div></div>
  }
  if (!snapshot) {
    return <div className="page"><div className="empty-card">加载中…</div></div>
  }

  return (
    <div className="page">
      <Topbar snapshot={snapshot} history={history} weekFile={weekFile} onWeekChange={switchWeek} />
      <Stats stats={snapshot.stats} />
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <span className="tabs-right topbar-note">v{__APP_VERSION__}</span>
      </nav>
      {tab === 'leaderboard' && <Leaderboard rows={snapshot.overall} />}
      {tab === 'topics' && <TopicBoards topics={snapshot.topics} />}
      {tab === 'rising' && <RisingStars rows={snapshot.risingStars} />}
      {tab === 'trends' && <TrendView currentIssue={snapshot.issue} />}
      <footer className="footer">数据来自 GitHub Search API · 每周日自动更新 · Powered by GitHub Actions</footer>
    </div>
  )
}
```

- [ ] **Step 5: 构建验证（组件未写会失败，属预期）**

Run: `npm run build`
Expected: FAIL，报 `./components/Leaderboard` 等模块不存在——下一个 Task 补齐。

---

### Task 13: Leaderboard 周榜总览

**Files:**
- Create: `src/components/Leaderboard.tsx`

- [ ] **Step 1: 写 `src/components/Leaderboard.tsx`**

```tsx
import { fmtStars } from '../lib/format'
import { langColor } from '../lib/langColors'
import type { RankedRepo } from '../lib/types'

function rankChange(r: RankedRepo): { text: string; cls: string } | null {
  if (r.prevRank == null) return { text: 'NEW', cls: 'new' }
  if (r.prevRank === r.rank) return null
  const up = r.prevRank > r.rank
  return { text: `${up ? '↑' : '↓'}${Math.abs(r.prevRank - r.rank)}`, cls: up ? 'up' : 'down' }
}

export default function Leaderboard({ rows }: { rows: RankedRepo[] }) {
  if (!rows.length) return <div className="empty-card">本期暂无数据</div>
  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>#</th>
          <th>仓库</th>
          <th className="num">周涨星</th>
          <th className="num">总星数</th>
          <th className="hide-sm">语言</th>
          <th className="hide-sm">最近推送</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const chg = rankChange(r)
          return (
            <tr key={r.name} className={r.rank <= 3 ? `hl-${r.rank}` : ''} onClick={() => window.open(r.url, '_blank')}>
              <td>
                <span className={`rank${r.rank <= 3 ? ` r${r.rank}` : ''}`}>{r.rank}</span>
                {chg && <div className={`rank-change ${chg.cls}`}>{chg.text}</div>}
              </td>
              <td>
                <img src={r.avatar} alt="" width="20" height="20" loading="lazy"
                  style={{ borderRadius: 4, marginRight: 6, verticalAlign: 'middle' }} />
                <a href={r.url} target="_blank" rel="noreferrer" className="repo-name">{r.name}</a>
                <div className="repo-desc">{r.description}</div>
              </td>
              <td className="num">
                {r.weeklyGain == null
                  ? <span className="gain-na">—</span>
                  : <span className="gain-up">+{r.weeklyGain}</span>}
              </td>
              <td className="num stars-cell">{fmtStars(r.stars)}</td>
              <td className="hide-sm">
                {r.language && <>
                  <span className="lang-dot" style={{ background: langColor(r.language) }} />{r.language}
                </>}
              </td>
              <td className="hide-sm stars-cell">{r.pushedAt.slice(0, 10)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 仍 FAIL（TopicBoards/RisingStars/TrendView 未写）。

---

### Task 14: TopicBoards 主题榜

**Files:**
- Create: `src/components/TopicBoards.tsx`

- [ ] **Step 1: 写 `src/components/TopicBoards.tsx`**

```tsx
import { fmtStars } from '../lib/format'
import { langColor } from '../lib/langColors'
import type { Repo } from '../lib/types'

function Card({ repo }: { repo: Repo }) {
  return (
    <div className="repo-card" onClick={() => window.open(repo.url, '_blank')}>
      <span className="repo-badge">
        {repo.name.slice(0, 2)}
        {repo.avatar && <img src={repo.avatar} alt="" loading="lazy" />}
      </span>
      <div className="repo-card-body">
        <a href={repo.url} target="_blank" rel="noreferrer" className="repo-name">{repo.name}</a>
        <div className="repo-desc">{repo.description}</div>
        <div className="repo-card-meta">
          <span>★ {fmtStars(repo.stars)}</span>
          {repo.language && <span>
            <span className="lang-dot" style={{ background: langColor(repo.language) }} />{repo.language}
          </span>}
          {repo.topics.slice(0, 2).map((t) => <span key={t} className="topic-tag">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

interface SectionProps {
  kind: 'ai' | 'tools'
  title: string
  keywords: string
  repos: Repo[]
}

function Section({ kind, title, keywords, repos }: SectionProps) {
  return (
    <section className="topic-section">
      <div className="topic-head">
        <span className={`topic-icon ${kind}`}>{kind === 'ai' ? '🧠' : '🛠'}</span>
        <span className="topic-title">{title}</span>
        <span className="topic-count">{repos.length} 个项目</span>
        <span className={`topic-kw ${kind}`}>{keywords}</span>
      </div>
      {repos.length
        ? <div className="cards">{repos.map((r) => <Card key={r.name} repo={r} />)}</div>
        : <div className="empty-card">本期暂无符合条件的项目</div>}
    </section>
  )
}

export default function TopicBoards({ topics }: { topics: { ai: Repo[]; tools: Repo[] } }) {
  return (
    <div>
      <Section kind="ai" title="AI · 大模型与应用" keywords="LLM / GPT / agent / RAG" repos={topics.ai} />
      <Section kind="tools" title="开发者工具与效率" keywords="devtools / CLI / automation" repos={topics.tools} />
    </div>
  )
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 仍 FAIL（RisingStars/TrendView 未写）。

---

### Task 15: RisingStars 新星榜

**Files:**
- Create: `src/components/RisingStars.tsx`

- [ ] **Step 1: 写 `src/components/RisingStars.tsx`**

```tsx
import { fmtStars, speedBadge } from '../lib/format'
import { langColor } from '../lib/langColors'
import type { NewRepo } from '../lib/types'

export default function RisingStars({ rows }: { rows: NewRepo[] }) {
  if (!rows.length) return <div className="empty-card">本期暂无新星项目</div>
  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>仓库</th>
          <th className="num">总星数</th>
          <th className="num">速度</th>
          <th className="num">库龄</th>
          <th className="hide-sm">语言</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} onClick={() => window.open(r.url, '_blank')}>
            <td>
              <img src={r.avatar} alt="" width="20" height="20" loading="lazy"
                style={{ borderRadius: 4, marginRight: 6, verticalAlign: 'middle' }} />
              <a href={r.url} target="_blank" rel="noreferrer" className="repo-name">{r.name}</a>
              <span className="new-badge">NEW</span>
              <div className="repo-desc">{r.description}</div>
            </td>
            <td className="num stars-cell">{fmtStars(r.stars)}</td>
            <td className="num"><span className={`speed ${speedBadge(r.starsPerDay)}`}>{r.starsPerDay} ★/天</span></td>
            <td className="num stars-cell">{r.daysOld} 天</td>
            <td className="hide-sm">
              {r.language && <>
                <span className="lang-dot" style={{ background: langColor(r.language) }} />{r.language}
              </>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 仍 FAIL（TrendView 未写）。

---

### Task 16: TrendView 趋势视图与 Sparkline

**Files:**
- Create: `src/components/Sparkline.tsx`, `src/components/TrendView.tsx`

- [ ] **Step 1: 写 `src/components/Sparkline.tsx`**

```tsx
const COLORS = { green: 'var(--success)', red: 'var(--danger)', purple: 'var(--purple)' } as const

export default function Sparkline({ values, color }: { values: number[]; color: keyof typeof COLORS }) {
  if (values.length < 2) return <span className="gain-na">—</span>
  const w = 72
  const h = 24
  const pad = 2
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (values.length - 1)
    const y = h - pad - ((v - min) / span) * (h - 2 * pad)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="涨星趋势">
      <polyline points={pts.join(' ')} fill="none" stroke={COLORS[color]} strokeWidth="1.5" />
    </svg>
  )
}
```

- [ ] **Step 2: 写 `src/components/TrendView.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { loadTrends } from '../lib/data'
import { fmtStars } from '../lib/format'
import {
  buildTrendRows,
  droppedRepos,
  sortTrendRows,
  sparklineColor,
  type TrendSort,
} from '../lib/trends'
import type { TrendsFile } from '../lib/types'
import Sparkline from './Sparkline'

const SORTS: { id: TrendSort; label: string }[] = [
  { id: 'streak', label: '连任' },
  { id: 'gain', label: '周均涨星' },
  { id: 'rise', label: '蹿升' },
]

function RankCell({ row }: { row: ReturnType<typeof buildTrendRows>[number] }) {
  if (row.rankNow === 0) return <span className="gain-na">未上热榜</span>
  if (row.prevRank === 0) return <>{row.rankNow} <span className="rank-change new">NEW</span></>
  if (row.prevRank === row.rankNow) return <>{row.rankNow} <span className="rank-change">—</span></>
  const up = row.prevRank > row.rankNow
  return (
    <>{row.rankNow}{' '}
      <span className={`rank-change ${up ? 'up' : 'down'}`}>
        {up ? '↑' : '↓'}{Math.abs(row.prevRank - row.rankNow)}
      </span>
    </>
  )
}

export default function TrendView({ currentIssue }: { currentIssue: number }) {
  const [trends, setTrends] = useState<TrendsFile | null>(null)
  const [sort, setSort] = useState<TrendSort>('streak')
  const [error, setError] = useState('')

  useEffect(() => {
    loadTrends().then(setTrends).catch((e: Error) => setError(e.message))
  }, [])

  const rows = useMemo(() => {
    if (!trends) return []
    return sortTrendRows(buildTrendRows(trends, currentIssue).filter((r) => r.streak > 0), sort).slice(0, 30)
  }, [trends, currentIssue, sort])

  const dropped = useMemo(() => (trends ? droppedRepos(trends, currentIssue) : []), [trends, currentIssue])
  const maxStreak = rows.reduce((m, r) => Math.max(m, r.streak), 0)
  const totalGain = rows.reduce((s, r) => s + r.avgGain, 0)

  if (error) return <div className="empty-card">趋势数据加载失败：{error}</div>
  if (!trends) return <div className="empty-card">加载中…</div>

  return (
    <div>
      <div className="trend-summary">
        <span className="item">在榜仓库<b>{rows.length}</b></span>
        <span className="item">最长连任<b className="up">{maxStreak} 周</b></span>
        <span className="item">周均涨星合计<b className="up">{fmtStars(Math.round(totalGain))}</b></span>
        <span className="item">本期掉榜<b className="down">{dropped.length}</b></span>
        <span className="trend-controls">
          排序
          {SORTS.map((s) => (
            <button key={s.id} className={`seg${sort === s.id ? ' active' : ''}`} onClick={() => setSort(s.id)}>
              {s.label}
            </button>
          ))}
        </span>
      </div>
      {rows.length === 0
        ? <div className="empty-card">暂无趋势数据（首期数据需下周对比）</div>
        : (
          <table className="board-table">
            <thead>
              <tr>
                <th>仓库</th>
                <th className="spark">周涨星走势</th>
                <th className="num">连任</th>
                <th className="num">当前排名</th>
                <th className="num">周均涨星</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const last = r.weeks[r.weeks.length - 1]
                return (
                  <tr key={r.name} onClick={() => window.open(`https://github.com/${r.name}`, '_blank')}>
                    <td><span className="repo-name">{r.name}</span></td>
                    <td className="spark"><Sparkline values={r.weeks.map((w) => w.weeklyGain)} color={sparklineColor(r)} /></td>
                    <td className="num">
                      <span className={`streak${r.streak === 1 ? ' new' : ''}`}>{r.streak} 周</span>
                    </td>
                    <td className="num"><RankCell row={r} /></td>
                    <td className="num stars-cell">{r.avgGain}（累计 {fmtStars(last?.stars ?? 0)}）</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      {dropped.length > 0 && (
        <details className="dropped">
          <summary>本期掉榜仓库（{dropped.length}）</summary>
          <ul>
            {dropped.map((d) => (
              <li key={d.name}>{d.name} — 最后在榜：第 {d.lastIssue} 期（{fmtStars(d.stars)} ★）</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 构建与测试全部通过**

Run: `npm test ; npm run build`
Expected: 测试 PASS，构建成功。

- [ ] **Step 4: 提交**

Run: `git add src ; git commit -m "feat: 四大视图组件（周榜/主题/新星/趋势）与应用骨架"`

---

### Task 17: GitHub Actions 周更工作流与 CHANGELOG

**Files:**
- Create: `.github/workflows/weekly.yml`, `CHANGELOG.md`

- [ ] **Step 1: 写 `.github/workflows/weekly.yml`**

```yaml
name: Weekly Update

on:
  schedule:
    - cron: '0 3 * * 0'
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: weekly-update
  cancel-in-progress: false

jobs:
  update-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Fetch weekly data
        run: node scripts/fetch-trending.mjs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - run: npm test
      - run: npm run build

      - name: Commit data snapshot
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/data
          git diff --cached --quiet && echo "no data change" && exit 0
          git commit -m "data: weekly snapshot ($(date -u +%F))"
          git push

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

说明：cron `0 3 * * 0` = 每周日 03:00 UTC（北京时间 11:00）。GitHub 计划任务按 UTC 执行且高峰期可能延迟，属正常。

- [ ] **Step 2: 写 `CHANGELOG.md`**

```markdown
# Changelog

本项目的版本与数据双轨跟踪：
- **代码版本**：本文件 + git tag（如 `v1.0.0`），记录功能变更。
- **数据期号**：`public/data/history.json` + 每周 snapshot 提交，记录每周榜单。

## [1.0.0] - 2026-08-16

### Added
- 周榜总览：Top 25 综合热榜，周涨星、排名变化（NEW/↑/↓）
- 主题榜：AI 大模型应用、开发者工具两个垂直榜单
- 新星榜：库龄 ≤ 7 天的新仓库，按星/天速度分级
- 趋势视图：16 周滚动窗口，连任/周均涨星/蹿升排序，sparkline 走势，掉榜追踪
- 历史回看：顶栏期号选择器加载任意往期快照
- 数据管道：零依赖 Node 脚本（查询→清洗→diff→落盘），幂等可重跑
- CI：GitHub Actions 每周日抓取数据、构建并发布 GitHub Pages
- 首期数据：2026-08-16 快照（第 1 期）
```

- [ ] **Step 3: 提交**

Run: `git add .github/workflows/weekly.yml CHANGELOG.md ; git commit -m "ci: 每周日自动抓取并部署 Pages 工作流 + CHANGELOG"`

---

### Task 18: 端到端验证与版本标记

- [ ] **Step 1: 全量测试与构建**

Run: `npm test ; npm run build`
Expected: 全部 PASS；`dist/github-radar/` 下含 `index.html` 与 `data/latest.json`、`data/history.json`、`data/trends.json`、`data/snapshots/`。

Run: `Get-ChildItem dist/github-radar/data -Recurse -File | Select-Object -ExpandProperty FullName`
Expected: 列出上述文件。

- [ ] **Step 2: 本地预览冒烟**

Run: `npm run preview`
浏览器打开 `http://localhost:4173/github-radar/`，逐项检查：
1. 顶栏显示「第 1 期」与日期范围，期号下拉可选
2. 5 张统计卡有数字
3. 四个 Tab 均能切换且渲染数据（趋势 Tab 首期显示全部 streak=1 周）
4. 缩窄窗口到 720px 以下，语言列隐藏、卡片单列
5. 点击表格行在新标签打开对应 GitHub 仓库
验证后 Ctrl+C 停止。

- [ ] **Step 3: 打版本标签**

Run: `git tag -a v1.0.0 -m "v1.0.0: GitHub Radar 重建首版"`

- [ ] **Step 4: 输出用户上线步骤（不代执行）**

向用户说明：
1. 在 GitHub 新建空仓库（建议名 `github-radar`）
2. `git remote add origin https://github.com/<用户名>/github-radar.git ; git push -u origin main --tags`
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**
4. Settings → Actions → General → Workflow permissions 选 **Read and write permissions**
5. 手动触发一次 Workflow（Actions → Weekly Update → Run workflow）验证全链路

---

## 完成定义

- [ ] `npm test` 全绿（dates/queries/clean/diff/persist/format/trends 7 组）
- [ ] `npm run build` 成功，产物含数据文件
- [ ] 四个 Tab 本地预览正常，移动端响应式正常
- [ ] `.github/workflows/weekly.yml` 已提交，CHANGELOG.md 记录 v1.0.0，git tag v1.0.0 已打
- [ ] 用户知晓上线四步（建仓库/推送/开启 Pages/触发工作流）


