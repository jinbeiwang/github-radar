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
