# GitHub Radar 重新设计 · 设计规格

- 日期：2026-08-15
- 状态：已与用户逐节确认
- 仓库：jinbeiwang/github-radar（远程空仓库，main 分支）
- 线上地址：https://jinbeiwang.github.io/github-radar/

## 1. 背景与目标

当前文件夹为历史遗留原型：`fetch-data.js`（Node 抓取脚本）+ `dashboard.html`（依赖 Tailwind CDN 与 React UMD 的单文件页面）+ 三个数据文件。未 git 化、无自动化、无历史数据积累。

重新设计目标：

1. 当作真正的项目重建：Vite + React + TypeScript 工程，清晰的模块边界
2. 每周日（北京时间 08:00）由 GitHub Actions 自动抓取、生成快照、提交回仓库并发布 GitHub Pages
3. 双轨 tracking：每周数据快照 + 趋势积累（数据轨）；CHANGELOG + git tag（版本轨）
4. 视觉采用 GitHub 原生风（浅色、克制、高信息密度），中文界面

## 2. 已确认的关键决策

| 决策点 | 结论 |
|---|---|
| 视觉方向 | A · GitHub 原生风（Primer 配色体系） |
| 技术栈 | Vite + React 18 + TypeScript，不引入 UI 框架，手写 CSS 设计令牌 |
| 数据板块 | 热榜（周涨星排序 + 语言筛选）、专题（AI / 工具）、新星、趋势，全部保留 |
| 部署 | GitHub Pages（Source 选 GitHub Actions） |
| 调度 | cron `0 0 * * 0`（UTC 周日 00:00 = 北京周日 08:00）+ 手动触发 |
| API 认证 | Actions 内置 `GITHUB_TOKEN`，用户无需配置 secret |
| tracking | 数据快照永久进 git + CHANGELOG/tag 双轨 |

## 3. 目录结构

```
github-radar/
├─ .github/workflows/update.yml    # 每周日：抓取 → 提交 → 构建 → 部署
├─ scripts/
│  ├─ fetch-trending.mjs           # 入口（零 npm 依赖）
│  └─ lib/                         # 查询构建 / 清洗 / 差值计算 / 落盘，可单测
├─ public/
│  └─ data/
│     ├─ snapshots/<YYYY-MM-DD>.json  # 每周快照（含候选池 stars 映射）
│     ├─ latest.json                  # 最新一期快照副本
│     ├─ history.json                 # 各期索引（升序）
│     └─ trends.json                  # 追踪仓库周度序列（上限 16 周）
├─ src/
│  ├─ main.tsx / App.tsx
│  ├─ components/  # Header / StatsBar / TabNav / WeekPicker / Leaderboard /
│  │               # TopicBoards / RisingStars / TrendView / Sparkline / RepoCard / Footer
│  ├─ lib/         # data.ts（加载） / diff.ts / format.ts / stats.ts（纯函数）
│  └─ styles/      # tokens.css（Primer 设计令牌）+ 组件样式
├─ docs/superpowers/specs/
├─ CHANGELOG.md
├─ README.md
└─ 遗留文件在实现阶段删除（dashboard.html / dashboard.jsx / data.js / fetch-data.js / dashboard-data.json）
```

## 4. 数据管道

### 4.1 抓取（GitHub Search API v3）

日期以 Asia/Shanghai 时区计算；`from = 今天-7天`，`to = 今天`。所有请求顺序执行、间隔 2.5s、失败重试 3 次（指数退避 2s/4s/8s）。共约 15 个请求（认证限额 30 次/分钟）。

| 板块 | 查询（编码后） | 排序与数量 |
|---|---|---|
| 综合候选池 | `stars:>200 pushed:>{from}` | stars 降序，2 页 × 100 |
| 语言补充 | 上述条件 + `language:{X}`，X ∈ Python/TypeScript/Go/Rust/C++/Java/JavaScript | stars 降序，各 30 |
| AI 专题 | `LLM OR GPT OR agent OR "large language model" OR RAG OR "AI framework" stars:>500 pushed:>{from}` | stars 降序，Top 12 |
| 工具专题 | `"developer tools" OR devtools OR productivity OR "command line" OR "automation tool" stars:>500 pushed:>{from}` | stars 降序，Top 12 |
| 新星 | `stars:>100 created:>{from}` | stars 降序，Top 10 |

去重规则：按 `full_name` 去重；语言补充结果并入候选池。

### 4.2 涨星计算与排名

- `weeklyGain = stars(本期) − stars(上期)`，以上期快照的候选池映射（`pool`）为查询源
- 热榜排名：已知 gain 的仓库按 gain 降序取前 25；未知 gain（上期不在池中的新面孔）排在已知 gain 之后，按 stars 降序补足，标记"新上榜"
- 首期（无历史）：全部按 stars 降序，gain 显示为"—"
- 新星指标：`daysOld = to − createdAt`（天）、`starsPerDay = stars / daysOld`（向上取整）

### 4.3 快照 Schema（`snapshots/<YYYY-MM-DD>.json`）

```jsonc
{
  "issue": 1,                       // 期号，自增
  "generatedAt": "ISO-8601",
  "dateRange": { "from": "...", "to": "..." },
  "stats": {
    "totalRepos": 0,                // 各板块上榜仓库去重数
    "totalStars": 0,                // 上榜仓库 stars 总和
    "weeklyStarGain": 0,            // 热榜 Top25 的 gain 之和（null 记 0）
    "aiCount": 0, "toolsCount": 0, "languageCount": 0,
    "newEntries": 0, "droppedEntries": 0   // 相对上期热榜成员
  },
  "overall": [ /* RankedRepo × 25 */ ],
  "topics": { "ai": [ /* Repo × 12 */ ], "tools": [ /* Repo × 12 */ ] },
  "risingStars": [ /* NewRepo × 10 */ ],
  "pool": { "owner/name": 12345 }   // 全部候选仓库名→stars（供下期 diff，压缩存储）
}
```

- RankedRepo：`rank, name(full), owner, avatar, description(≤160字符), url, stars, forks, language|null, topics(≤4), weeklyGain|null, prevRank|null, createdAt, pushedAt`
- NewRepo 在 Repo 基础上增加 `daysOld, starsPerDay`
- `pool` 仅存 `full_name → stars`，约 200 条

### 4.4 history.json

`{ "issues": [{ "issue": 1, "date": "2026-08-16", "file": "snapshots/2026-08-16.json", "stats": { 同快照 stats } }] }`，按期号升序。

### 4.5 trends.json

`{ "repos": { "owner/name": { "weeks": [{ "issue": 1, "date": "...", "stars": 0, "rank": 0, "weeklyGain": 0 }] } } }`

- 只收录当期任一榜单（热榜/两专题/新星）上榜仓库
- 每仓库保留最近 16 周；超过 16 周未上榜的仓库整体剔除
- 掉榜判定（前端计算）：`lastIssue < 当前期号`

### 4.6 落盘与提交

- 快照文件名日期 = 运行日（Asia/Shanghai）；同日重复运行则覆盖（幂等）
- 每次成功运行更新 `latest.json` / `history.json` / `trends.json`
- commit：`data: <日期> weekly snapshot (#<期号>)`，bot 身份 `github-actions[bot]`
- 数据只追加不删除（trends 滚动窗口除外），失败保留上一期内容

## 5. 网站功能

四个 Tab + 期数切换器；中文界面。

### 5.1 热榜（默认 Tab）

- 5 张统计卡：上榜仓库 / 追踪总 Stars / 本周涨星（绿色强调）/ AI 项目数 / 语言分布数
- 语言筛选 chips：动态生成（按热榜中语言出现频次降序），显示各语言上榜数；"全部"为默认
- 行式榜单 25 行：排名（Top3 强调色 #bc4c00/#8250df/#9a6700）/ 仓库全名（链接）/ 一行描述 / 语言色点 / 周涨星（▲ 绿）/ 总 Stars
- 空描述显示 "No description"；整行可点直达 GitHub（新窗口）

### 5.2 专题

- 子筛选：全部 / AI·LLM·Agent / 工具&效率
- 卡片 2 列网格，每板块 12 张：仓库图标（首字母渐变块，加载 owner 头像）/ 名称 / 两行描述 / stars/forks/语言 / 周涨星徽章 / topics 标签（紫色）
- 说明行标注命中关键词

### 5.3 新星

- 规则说明 + 表格 10 行：排名 / 仓库 / 创建于（N 天前）/ 总 Stars / 日均涨星
- 速度徽章：紫 #8250df（>1000/天）、蓝 #0969da（>300/天）、灰（其余）
- Top1 行渐变强调

### 5.4 趋势

- 汇总条：追踪仓库数 / 本期新上榜 / 本期掉榜 + 走势范围切换（近 8 周 / 近 16 周）
- 排序切换：连续上榜周数（默认）/ 涨星速度 / 排名上升幅度
- 表格行：仓库（含当前排名徽章）+ 周涨星 Sparkline（绿升/红降/紫新入）+ 连续上榜周数 + 排名变化（#x → #y ▲/▼）+ 当前 Stars
- 掉榜仓库折叠区
- 空状态（第 1 期）：显示说明卡"趋势数据从第 2 期开始积累"，不渲染空表

### 5.5 期数切换

- Header 右侧下拉列出 history.json 全部期次；选择后加载对应快照，趋势 Tab 联动
- 移动端：统计卡 2 列、榜单单列、筛选 chips 横向滚动

## 6. 视觉设计令牌（GitHub Primer）

| 用途 | 值 |
|---|---|
| 页面背景 | `#f6f8fa` |
| 卡片/表面 | `#ffffff`，边框 `#d0d7de`，圆角 6px |
| 主文本 / 次文本 | `#1f2328` / `#656d76` |
| 品牌蓝（链接/主按钮） | `#0969da` |
| 成功/涨 | `#1a7f37`（底 `#f0fff4`，边 `#dafbe1`） |
| 危险/降 | `#cf222e` |
| 强调紫（AI 专题/新星） | `#8250df`（底 `#faf5ff`） |
| 顶栏 | `#24292f`，白字，期号徽章 `#238636`/`#aff5b4` |
| 字体 | 系统栈 + PingFang SC / Microsoft YaHei；数字 `tabular-nums` |

Top3 排名色：`#bc4c00` / `#8250df` / `#9a6700`。语言色点沿用 GitHub linguist 主色（内置常见 20 种，未知用 `#8c959f`）。

## 7. GitHub Actions（.github/workflows/update.yml）

- 触发：`schedule: cron '0 0 * * 0'` + `workflow_dispatch`
- 权限：`contents: write`、`pages: write`、`id-token: write`
- `concurrency` 串行化，避免并发部署
- 步骤：checkout → setup-node 20 → `node scripts/fetch-trending.mjs`（env `GITHUB_TOKEN: secrets.GITHUB_TOKEN`）→ 若数据有变：commit + push（`github-actions[bot]`）→ `npm ci` → `npm run build` → `upload-pages-artifact`（dist）→ `deploy-pages`
- 失败通知：GitHub 默认邮件；站点保持上一期
- 推送不触发自身 workflow（本 workflow 仅 schedule/dispatch 触发），无循环风险

## 8. 部署

- Vite `base: '/github-radar/'`
- 数据经 `public/data/` 进入构建产物，前端相对路径 `data/...` 加载
- 用户一次性设置：Settings → Pages → Source = GitHub Actions（README 图文步骤）
- 首次发布：实现完成后手动 `workflow_dispatch` 触发

## 9. 版本跟踪

- `CHANGELOG.md`：Keep a Changelog 1.1 格式，semver
- 首发 tag `v1.0.0`；页脚显示当前版本（`package.json` version 经 Vite define 注入）
- 约定：功能/视觉 → minor；快照 schema 变更 → major；修复 → patch

## 10. 测试

- vitest 覆盖纯函数：`scripts/lib`（查询构建、清洗、gain 计算、trends 滚窗）、`src/lib`（diff、format、stats、语言列表）
- 组件不强制单测；验收靠本地 `npm run fetch` + `npm run dev` 预览
- CI 不跑测试（保持工作流轻量），本地 `npm test` 保证

## 11. 网络备注

- 本地直连 github.com 可能被重置（已实测）；Actions 在 GitHub 侧运行不受影响
- 最终推送代码时如遇网络问题，提供 git HTTP 代理配置建议（由用户决定）

## 12. 非目标（本期不做）

- 搜索、收藏、多用户、RSS、评论
- 服务端渲染 / SEO 优化
- 除 GitHub Search API 外的其他数据源（如 star history 单仓库明细）
