import { describe, expect, it } from 'vitest'
import { fmtStars, speedBadge } from './format'

describe('fmtStars', () => {
  it('千/百万缩写', () => {
    expect(fmtStars(999)).toBe('999')
    expect(fmtStars(1000)).toBe('1k')
    expect(fmtStars(1200)).toBe('1.2k')
    expect(fmtStars(46200)).toBe('46.2k')
    expect(fmtStars(1200000)).toBe('1.2M')
  })
})

describe('speedBadge', () => {
  it('>1000 紫、>300 蓝、其余灰', () => {
    expect(speedBadge(2051)).toBe('purple')
    expect(speedBadge(476)).toBe('blue')
    expect(speedBadge(100)).toBe('gray')
  })
})
