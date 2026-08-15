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
