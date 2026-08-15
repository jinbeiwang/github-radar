const trim = (s: string) => s.replace(/\.0$/, '')

export function fmtStars(n: number): string {
  if (n >= 1e6) return trim((n / 1e6).toFixed(1)) + 'M'
  if (n >= 1e3) return trim((n / 1e3).toFixed(1)) + 'k'
  return String(n)
}

export function speedBadge(spd: number): 'purple' | 'blue' | 'gray' {
  if (spd > 1000) return 'purple'
  if (spd > 300) return 'blue'
  return 'gray'
}
