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
    if (lastIssue >= snapshot.issue - TREND_WINDOW && !repos[name]) repos[name] = { weeks: v.weeks }
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
