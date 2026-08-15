import { describe, expect, it } from 'vitest'
import { computeGains, entryChanges, rankOverall } from './diff.mjs'

const c = (name, stars) => ({ name, stars })

describe('computeGains', () => {
  it('已知 gain = 本期 − 上期；新面孔为 null', () => {
    const gains = computeGains([c('a/b', 110), c('c/d', 50)], { 'a/b': 100 })
    expect(gains.get('a/b')).toBe(10)
    expect(gains.get('c/d')).toBeNull()
  })
  it('无上期时全部 null', () => {
    const gains = computeGains([c('a/b', 1)], {})
    expect(gains.get('a/b')).toBeNull()
  })
})

describe('rankOverall', () => {
  const candidates = [c('big', 5000), c('hot', 800), c('new', 3000), c('warm', 600)]
  const gains = new Map([['big', null], ['hot', 200], ['new', null], ['warm', 50]])
  const prevRanks = { hot: 1 }
  it('已知 gain 优先按 gain 降序，未知按 stars 降序补足，标注 prevRank', () => {
    const ranked = rankOverall(candidates, gains, prevRanks, 3)
    expect(ranked.map((r) => r.name)).toEqual(['hot', 'warm', 'big'])
    expect(ranked[0]).toMatchObject({ rank: 1, weeklyGain: 200, prevRank: 1 })
    expect(ranked[2]).toMatchObject({ rank: 3, weeklyGain: null, prevRank: null })
  })
  it('默认取 25', () => {
    const many = Array.from({ length: 40 }, (_, i) => c(`r${i}`, 1000 + i))
    const g = new Map(many.map((r) => [r.name, 0]))
    expect(rankOverall(many, g)).toHaveLength(25)
  })
})

describe('entryChanges', () => {
  it('统计新上榜与掉榜', () => {
    expect(entryChanges(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual({ newEntries: 1, droppedEntries: 1 })
  })
})
