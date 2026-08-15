import { fmtStars } from '../lib/format'
import type { SnapshotStats } from '../lib/types'

export default function Stats({ stats }: { stats: SnapshotStats }) {
  const items = [
    { num: String(stats.totalRepos), label: '追踪仓库', gain: false },
    { num: fmtStars(stats.weeklyStarGain), label: '周涨星合计', gain: true },
    { num: `+${stats.newEntries} / -${stats.droppedEntries}`, label: '新上榜 / 掉榜', gain: false },
    { num: String(stats.aiCount), label: 'AI 主题入库', gain: false },
    { num: `${stats.languageCount} 种`, label: '覆盖语言', gain: false },
  ]
  return (
    <section className="stats">
      {items.map((it) => (
        <div key={it.label} className={`stat-card${it.gain ? ' gain' : ''}`}>
          <div className="num">{it.num}</div>
          <div className="label">{it.label}</div>
        </div>
      ))}
    </section>
  )
}
