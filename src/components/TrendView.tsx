import { useEffect, useMemo, useState } from 'react'
import { loadTrends } from '../lib/data'
import { fmtStars } from '../lib/format'
import {
  buildTrendRows,
  droppedRepos,
  sortTrendRows,
  sparklineColor,
  type TrendRow,
  type TrendSort,
} from '../lib/trends'
import type { TrendsFile } from '../lib/types'
import Sparkline from './Sparkline'

const SORTS: { id: TrendSort; label: string }[] = [
  { id: 'streak', label: '连任' },
  { id: 'gain', label: '周均涨星' },
  { id: 'rise', label: '蹿升' },
]

function RankCell({ row }: { row: TrendRow }) {
  if (row.rankNow === 0) return <span className="gain-na">未上热榜</span>
  if (row.prevRank === 0) return <>{row.rankNow} <span className="rank-change new">NEW</span></>
  if (row.prevRank === row.rankNow) return <>{row.rankNow} <span className="rank-change">—</span></>
  const up = row.prevRank > row.rankNow
  return (
    <>{row.rankNow}{' '}
      <span className={`rank-change ${up ? 'up' : 'down'}`}>
        {up ? '↑' : '↓'}{Math.abs(row.prevRank - row.rankNow)}
      </span>
    </>
  )
}

export default function TrendView({ currentIssue }: { currentIssue: number }) {
  const [trends, setTrends] = useState<TrendsFile | null>(null)
  const [sort, setSort] = useState<TrendSort>('streak')
  const [error, setError] = useState('')

  useEffect(() => {
    loadTrends().then(setTrends).catch((e: Error) => setError(e.message))
  }, [])

  const rows = useMemo(() => {
    if (!trends) return []
    return sortTrendRows(buildTrendRows(trends, currentIssue).filter((r) => r.streak > 0), sort).slice(0, 30)
  }, [trends, currentIssue, sort])

  const dropped = useMemo(() => (trends ? droppedRepos(trends, currentIssue) : []), [trends, currentIssue])
  const maxStreak = rows.reduce((m, r) => Math.max(m, r.streak), 0)
  const totalGain = rows.reduce((s, r) => s + r.avgGain, 0)

  if (error) return <div className="empty-card">趋势数据加载失败：{error}</div>
  if (!trends) return <div className="empty-card">加载中…</div>

  return (
    <div>
      <div className="trend-summary">
        <span className="item">在榜仓库<b>{rows.length}</b></span>
        <span className="item">最长连任<b className="up">{maxStreak} 周</b></span>
        <span className="item">周均涨星合计<b className="up">{fmtStars(Math.round(totalGain))}</b></span>
        <span className="item">本期掉榜<b className="down">{dropped.length}</b></span>
        <span className="trend-controls">
          排序
          {SORTS.map((s) => (
            <button key={s.id} className={`seg${sort === s.id ? ' active' : ''}`} onClick={() => setSort(s.id)}>
              {s.label}
            </button>
          ))}
        </span>
      </div>
      {rows.length === 0
        ? <div className="empty-card">暂无趋势数据（首期数据需下周对比）</div>
        : (
          <table className="board-table">
            <thead>
              <tr>
                <th>仓库</th>
                <th className="spark">周涨星走势</th>
                <th className="num">连任</th>
                <th className="num">当前排名</th>
                <th className="num">周均涨星</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const last = r.weeks[r.weeks.length - 1]
                return (
                  <tr key={r.name} onClick={() => window.open(`https://github.com/${r.name}`, '_blank')}>
                    <td><span className="repo-name">{r.name}</span></td>
                    <td className="spark"><Sparkline values={r.weeks.map((wk) => wk.weeklyGain)} color={sparklineColor(r)} /></td>
                    <td className="num">
                      <span className={`streak${r.streak === 1 ? ' new' : ''}`}>{r.streak} 周</span>
                    </td>
                    <td className="num"><RankCell row={r} /></td>
                    <td className="num stars-cell">{r.avgGain}（累计 {fmtStars(last?.stars ?? 0)}）</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      {dropped.length > 0 && (
        <details className="dropped">
          <summary>本期掉榜仓库（{dropped.length}）</summary>
          <ul>
            {dropped.map((d) => (
              <li key={d.name}>{d.name} — 最后在榜：第 {d.lastIssue} 期（{fmtStars(d.stars)} ★）</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
