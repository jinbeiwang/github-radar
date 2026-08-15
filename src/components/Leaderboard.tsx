import { fmtStars } from '../lib/format'
import { langColor } from '../lib/langColors'
import type { RankedRepo } from '../lib/types'

function rankChange(r: RankedRepo): { text: string; cls: string } | null {
  if (r.prevRank == null) return { text: 'NEW', cls: 'new' }
  if (r.prevRank === r.rank) return null
  const up = r.prevRank > r.rank
  return { text: `${up ? '↑' : '↓'}${Math.abs(r.prevRank - r.rank)}`, cls: up ? 'up' : 'down' }
}

export default function Leaderboard({ rows }: { rows: RankedRepo[] }) {
  if (!rows.length) return <div className="empty-card">本期暂无数据</div>
  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>#</th>
          <th>仓库</th>
          <th className="num">周涨星</th>
          <th className="num">总星数</th>
          <th className="hide-sm">语言</th>
          <th className="hide-sm">最近推送</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const chg = rankChange(r)
          return (
            <tr key={r.name} className={r.rank <= 3 ? `hl-${r.rank}` : ''} onClick={() => window.open(r.url, '_blank')}>
              <td>
                <span className={`rank${r.rank <= 3 ? ` r${r.rank}` : ''}`}>{r.rank}</span>
                {chg && <div className={`rank-change ${chg.cls}`}>{chg.text}</div>}
              </td>
              <td>
                <img src={r.avatar} alt="" width="20" height="20" loading="lazy"
                  style={{ borderRadius: 4, marginRight: 6, verticalAlign: 'middle' }} />
                <a href={r.url} target="_blank" rel="noreferrer" className="repo-name">{r.name}</a>
                <div className="repo-desc">{r.description}</div>
              </td>
              <td className="num">
                {r.weeklyGain == null
                  ? <span className="gain-na">—</span>
                  : <span className="gain-up">+{r.weeklyGain}</span>}
              </td>
              <td className="num stars-cell">{fmtStars(r.stars)}</td>
              <td className="hide-sm">
                {r.language && <>
                  <span className="lang-dot" style={{ background: langColor(r.language) }} />{r.language}
                </>}
              </td>
              <td className="hide-sm stars-cell">{r.pushedAt.slice(0, 10)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
