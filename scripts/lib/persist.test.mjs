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
  it('超过 16 周未上榜的仓库被剔除，边界内保留', () => {
    const prev = {
      repos: {
        ghost: { weeks: [{ issue: 3, date: '2026-04-12', stars: 1, rank: 0, weeklyGain: 0 }] },
        recent: { weeks: [{ issue: 4, date: '2026-04-19', stars: 2, rank: 0, weeklyGain: 0 }] },
      },
    }
    const t = buildTrends(prev, { ...snap, issue: 20 })
    expect(t.repos.ghost).toBeUndefined()
    expect(t.repos.recent).toEqual({ weeks: prev.repos.recent.weeks })
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
