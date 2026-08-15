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

  const prevHistory = readJsonIfExists(join(DATA_DIR, 'history.json'))
  const prevTrends = readJsonIfExists(join(DATA_DIR, 'trends.json'))
  const sameDay = (prevHistory?.issues ?? []).find((e) => e.date === to)
  // 刷新已有期数时，涨幅基准取上一期快照；本期为新期时取 latest（即上一期）
  const prevIssueEntry = sameDay
    ? (prevHistory?.issues ?? []).find((e) => e.issue === sameDay.issue - 1)
    : null
  const prevSnapshot = prevIssueEntry
    ? readJsonIfExists(join(DATA_DIR, prevIssueEntry.file))
    : (sameDay ? null : readJsonIfExists(join(DATA_DIR, 'latest.json')))

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

  const issue = sameDay?.issue ?? (prevHistory?.issues?.at(-1)?.issue ?? 0) + 1
  const snapshot = buildSnapshot({ issue, generatedAt: new Date().toISOString(), range,
    boards: { overall, ai, tools, rising }, pool: buildPool(candidates), prev: prevSnapshot })
  const history = buildHistory(prevHistory, snapshot)
  const trends = buildTrends(prevTrends, snapshot)

  writeDataFiles(DATA_DIR, snapshot, history, trends)
  console.log(`完成：第 ${issue} 期 · 热榜 ${overall.length} · 候选池 ${Object.keys(snapshot.pool).length} · 数据目录 ${DATA_DIR}`)
}

main().catch((e) => { console.error('抓取失败：', e.message); process.exit(1) })
