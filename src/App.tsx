import { useEffect, useState } from 'react'
import Leaderboard from './components/Leaderboard'
import RisingStars from './components/RisingStars'
import Stats from './components/Stats'
import Topbar from './components/Topbar'
import TopicBoards from './components/TopicBoards'
import TrendView from './components/TrendView'
import { loadHistory, loadLatest, loadSnapshot } from './lib/data'
import type { HistoryEntry, Snapshot } from './lib/types'

type TabId = 'leaderboard' | 'topics' | 'rising' | 'trends'
const TABS: { id: TabId; label: string }[] = [
  { id: 'leaderboard', label: '周榜总览' },
  { id: 'topics', label: '主题榜' },
  { id: 'rising', label: '新星榜' },
  { id: 'trends', label: '趋势' },
]

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [weekFile, setWeekFile] = useState('latest')
  const [tab, setTab] = useState<TabId>('leaderboard')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([loadLatest(), loadHistory()])
      .then(([snap, hist]) => {
        setSnapshot(snap)
        setHistory(hist.issues)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const switchWeek = (file: string) => {
    setWeekFile(file)
    const p = file === 'latest' ? loadLatest() : loadSnapshot(file)
    p.then(setSnapshot).catch((e: Error) => setError(e.message))
  }

  if (error) {
    return <div className="page"><div className="empty-card">数据加载失败：{error}</div></div>
  }
  if (!snapshot) {
    return <div className="page"><div className="empty-card">加载中…</div></div>
  }

  return (
    <div className="page">
      <Topbar snapshot={snapshot} history={history} weekFile={weekFile} onWeekChange={switchWeek} />
      <Stats stats={snapshot.stats} />
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <span className="tabs-right topbar-note">v{__APP_VERSION__}</span>
      </nav>
      {tab === 'leaderboard' && <Leaderboard rows={snapshot.overall} />}
      {tab === 'topics' && <TopicBoards topics={snapshot.topics} />}
      {tab === 'rising' && <RisingStars rows={snapshot.risingStars} />}
      {tab === 'trends' && <TrendView currentIssue={snapshot.issue} />}
      <footer className="footer">数据来自 GitHub Search API · 每周日自动更新 · Powered by GitHub Actions</footer>
    </div>
  )
}
