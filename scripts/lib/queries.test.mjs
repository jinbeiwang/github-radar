import { describe, expect, it } from 'vitest'
import { LANGUAGES, qAI, qLanguage, qOverall, qRising, qTools } from './queries.mjs'

describe('queries', () => {
  const from = '2026-08-09'
  it('qOverall', () => expect(qOverall(from)).toBe('stars:>200 pushed:>2026-08-09'))
  it('qLanguage', () => expect(qLanguage(from, 'Python')).toBe('stars:>200 pushed:>2026-08-09 language:Python'))
  it('qAI 含关键词与门槛', () => {
    const q = qAI(from)
    expect(q).toContain('LLM')
    expect(q).toContain('stars:>500 pushed:>2026-08-09')
  })
  it('qTools 含关键词与门槛', () => {
    const q = qTools(from)
    expect(q).toContain('devtools')
    expect(q).toContain('stars:>500 pushed:>2026-08-09')
  })
  it('qRising', () => expect(qRising(from)).toBe('stars:>100 created:>2026-08-09'))
  it('LANGUAGES 覆盖 7 种', () => expect(LANGUAGES).toHaveLength(7))
})
