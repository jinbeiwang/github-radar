import { describe, expect, it } from 'vitest'
import { buildPool, cleanRepo, daysOld, dedupe } from './clean.mjs'

const raw = {
  full_name: 'a/b',
  description: 'x'.repeat(300),
  stargazers_count: 100,
  forks_count: 5,
  language: 'Rust',
  html_url: 'https://github.com/a/b',
  topics: ['t1', 't2', 't3', 't4', 't5', 't6'],
  created_at: '2026-08-10T01:02:03Z',
  pushed_at: '2026-08-15T01:02:03Z',
  owner: { login: 'a', avatar_url: 'https://avatars.githubusercontent.com/u/1' },
}

describe('clean', () => {
  it('cleanRepo 截断描述并裁剪 topics', () => {
    const r = cleanRepo(raw)
    expect(r.name).toBe('a/b')
    expect(r.description).toHaveLength(160)
    expect(r.topics).toEqual(['t1', 't2', 't3', 't4'])
    expect(r.language).toBe('Rust')
    expect(r.createdAt).toBe('2026-08-10')
  })
  it('cleanRepo 处理空字段', () => {
    const r = cleanRepo({ full_name: 'x/y' })
    expect(r.description).toBe('')
    expect(r.language).toBeNull()
    expect(r.topics).toEqual([])
  })
  it('dedupe 按 name 去重保序', () => {
    const a = { name: 'a/b' }, b = { name: 'c/d' }
    expect(dedupe([a, b, { name: 'a/b' }])).toEqual([a, b])
  })
  it('buildPool 生成 name→stars 映射', () => {
    expect(buildPool([{ name: 'a/b', stars: 10 }, { name: 'c/d', stars: 20 }])).toEqual({ 'a/b': 10, 'c/d': 20 })
  })
  it('daysOld 正确且至少为 1', () => {
    expect(daysOld('2026-08-10', '2026-08-16')).toBe(6)
    expect(daysOld('2026-08-16', '2026-08-16')).toBe(1)
  })
})
