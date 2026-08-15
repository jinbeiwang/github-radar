const TZ_OFFSET_MS = 8 * 3600 * 1000

export function shDate(now = new Date()) {
  return new Date(now.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10)
}

export function shDaysAgo(n, now = new Date()) {
  return shDate(new Date(now.getTime() - n * 86400 * 1000))
}

// 期号日期 = 本周日的周日（北京时间）。周六/周一等非周日运行都归入本期，
// 与 cron（周日 03:00 UTC = 北京周日 11:00）保持一致，避免期号日期倒退。
export function weekSunday(now = new Date()) {
  const d = new Date(now.getTime() + TZ_OFFSET_MS)
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7))
  return d.toISOString().slice(0, 10)
}

export function dateRange(now = new Date(), daysBack = 7) {
  const to = weekSunday(now)
  const from = new Date(Date.parse(`${to}T12:00:00Z`) - daysBack * 86400 * 1000)
    .toISOString().slice(0, 10)
  return { from, to }
}
