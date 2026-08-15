import { describe, expect, it } from 'vitest'
import { dateRange, shDate, shDaysAgo, weekSunday } from './dates.mjs'

describe('dates', () => {
  it('shDate 返回 Asia/Shanghai 日期', () => {
    expect(shDate(new Date('2026-08-15T16:30:00Z'))).toBe('2026-08-16')
    expect(shDate(new Date('2026-08-15T15:30:00Z'))).toBe('2026-08-15')
  })
  it('shDaysAgo 回退 N 天', () => {
    const now = new Date('2026-08-16T02:00:00Z')
    expect(shDaysAgo(7, now)).toBe('2026-08-09')
  })
  it('weekSunday 取本期周日（北京时间）', () => {
    // 周六（2026-08-15）运行 → 归入 8/16 那期
    expect(weekSunday(new Date('2026-08-15T06:49:00Z'))).toBe('2026-08-16')
    // 周日当天（cron 03:00 UTC）→ 就是当天
    expect(weekSunday(new Date('2026-08-16T03:00:00Z'))).toBe('2026-08-16')
    // 周一 → 归入下一个周日
    expect(weekSunday(new Date('2026-08-17T03:00:00Z'))).toBe('2026-08-23')
  })
  it('dateRange 生成 from/to，to 为本期周日', () => {
    // 周六下午（北京时间）运行：to 不应是当天 8/15，而是本期周日 8/16
    const now = new Date('2026-08-15T06:49:00Z')
    expect(dateRange(now, 7)).toEqual({ from: '2026-08-09', to: '2026-08-16' })
  })
})
