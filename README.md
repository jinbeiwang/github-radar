# GitHub Radar

![Weekly Update](https://github.com/jinbeiwang/github-radar/actions/workflows/weekly.yml/badge.svg)

GitHub 热榜周报：每周日自动抓取 GitHub 趋势数据，生成可视化榜单网站并发布。

**线上地址**：<https://jinbeiwang.github.io/github-radar/>

## 功能特性

- **热榜** —— 本周综合 Top 25 仓库，含周涨幅与排名变化
- **主题榜** —— AI 与开发工具两个专题榜单
- **新星榜** —— 创建不久但涨星迅猛的新仓库
- **趋势** —— 各仓库跨期星数/排名走势（16 周滚动窗口）
- **每周自动更新** —— 无人值守，周周出新刊
- **数据永久归档** —— 每期快照存入 git，可回溯任意一期

## 自动更新机制

全部自动化由 [`.github/workflows/weekly.yml`](.github/workflows/weekly.yml) 驱动：

```
触发（三选一）                         自动执行
─────────────────                    ─────────────────────────────
推送代码到 main        ┐
每周日 11:00（北京时间）┼──────────────▶ 抓取数据 → 测试 → 构建
网页手动触发           ┘                  │
                                        ├─ 机器人提交数据快照并推回仓库
                                        └─ 部署 GitHub Pages（约 2-3 分钟上线）
```

数据抓取与涨幅计算由零依赖 Node.js 脚本完成（`scripts/fetch-trending.mjs`），核心模块均有单元测试（`npm test`，33 个用例）。

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 本地开发预览（热更新）
npm test           # 运行全部测试
npm run build      # 构建产物到 dist/
npm run fetch      # 手动抓取一期数据（可用 --date YYYY-MM-DD 指定期号）
```

## 项目结构

```
├── .github/workflows/weekly.yml  # 自动化工作流
├── public/data/                  # 数据文件（git 追踪，构成历史档案）
│   ├── latest.json               # 最新一期完整数据
│   ├── history.json              # 各期目录与统计
│   ├── trends.json               # 跨期走势
│   └── snapshots/                # 每期快照，永久保留
├── scripts/                      # 数据流水线（抓取/清洗/计算/持久化）
├── src/                          # React 前端（Vite + TypeScript）
├── docs/                         # 设计文档与实现计划
└── CHANGELOG.md                  # 版本更新记录
```

## 数据与期号规则

- 每期对应一个自然周，**期号日期 = 北京时间本周日的周日**；非周日运行只刷新当期，日期永不倒退
- 涨幅基准为上一期快照，可准确计算周涨幅、新上榜与掉榜
- 榜单覆盖：综合榜（Top 25）、7 种语言榜（Python / TypeScript / Go / Rust / C++ / Java / JavaScript）、AI 榜、工具榜、新星榜

## 版本追踪

- 更新记录见 [CHANGELOG.md](CHANGELOG.md)
- 里程碑使用 git tag 标记（当前：`v1.0.0`）
