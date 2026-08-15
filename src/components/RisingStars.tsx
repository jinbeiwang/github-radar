import { fmtStars, speedBadge } from '../lib/format'
import { langColor } from '../lib/langColors'
import type { NewRepo } from '../lib/types'

export default function RisingStars({ rows }: { rows: NewRepo[] }) {
  if (!rows.length) return <div className="empty-card">本期暂无新星项目</div>
  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>仓库</th>
          <th className="num">总星数</th>
          <th className="num">速度</th>
          <th className="num">库龄</th>
          <th className="hide-sm">语言</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} onClick={() => window.open(r.url, '_blank')}>
            <td>
              <img src={r.avatar} alt="" width="20" height="20" loading="lazy"
                style={{ borderRadius: 4, marginRight: 6, verticalAlign: 'middle' }} />
              <a href={r.url} target="_blank" rel="noreferrer" className="repo-name">{r.name}</a>
              <span className="new-badge">NEW</span>
              <div className="repo-desc">{r.description}</div>
            </td>
            <td className="num stars-cell">{fmtStars(r.stars)}</td>
            <td className="num"><span className={`speed ${speedBadge(r.starsPerDay)}`}>{r.starsPerDay} ★/天</span></td>
            <td className="num stars-cell">{r.daysOld} 天</td>
            <td className="hide-sm">
              {r.language && <>
                <span className="lang-dot" style={{ background: langColor(r.language) }} />{r.language}
              </>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
