const TZ_OFFSET_MS = 8 * 3600 * 1000

export function shDate(now = new Date()) {
  return new Date(now.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10)
}

export function shDaysAgo(n, now = new Date()) {
  return shDate(new Date(now.getTime() - n * 86400 * 1000))
}

export function dateRange(now = new Date(), daysBack = 7) {
  return { from: shDaysAgo(daysBack, now), to: shDate(now) }
}
