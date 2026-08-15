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
