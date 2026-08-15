const COLORS = { green: 'var(--success)', red: 'var(--danger)', purple: 'var(--purple)' } as const

export default function Sparkline({ values, color }: { values: number[]; color: keyof typeof COLORS }) {
  if (values.length < 2) return <span className="gain-na">—</span>
  const w = 72
  const h = 24
  const pad = 2
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (values.length - 1)
    const y = h - pad - ((v - min) / span) * (h - 2 * pad)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="涨星趋势">
      <polyline points={pts.join(' ')} fill="none" stroke={COLORS[color]} strokeWidth="1.5" />
    </svg>
  )
}
