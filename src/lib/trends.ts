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
