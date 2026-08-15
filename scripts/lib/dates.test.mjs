import { describe, expect, it } from 'vitest'
import { dateRange, shDate, shDaysAgo } from './dates.mjs'

describe('dates', () => {
  it('shDate 返回 Asia/Shanghai 日期', () => {
    expect(shDate(new Date('2026-08-15T16:30:00Z'))).toBe('2026-08-16')
    expect(shDate(new Date('2026-08-15T15:30:00Z'))).toBe('2026-08-15')
  })
  it('shDaysAgo 回退 N 天', () => {
    const now = new Date('2026-08-16T02:00:00Z')
    expect(shDaysAgo(7, now)).toBe('2026-08-09')
  })
  it('dateRange 生成 from/to', () => {
    const now = new Date('2026-08-15T16:30:00Z')
    expect(dateRange(now, 7)).toEqual({ from: '2026-08-09', to: '2026-08-16' })
  })
})
