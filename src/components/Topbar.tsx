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
