export function computeGains(candidates, prevPool = {}) {
  const gains = new Map()
  for (const r of candidates) {
    const prev = prevPool[r.name]
    gains.set(r.name, prev === undefined ? null : r.stars - prev)
  }
  return gains
}

export function rankOverall(candidates, gains, prevRanks = {}, topN = 25) {
  const known = []
  const unknown = []
  for (const r of candidates) {
    const gain = gains.get(r.name)
    if (gain === null || gain === undefined) unknown.push({ repo: r, gain: null })
    else known.push({ repo: r, gain })
  }
  known.sort((a, b) => b.gain - a.gain || b.repo.stars - a.repo.stars)
  unknown.sort((a, b) => b.repo.stars - a.repo.stars)
  return [...known, ...unknown].slice(0, topN).map((e, i) => ({
    ...e.repo,
    rank: i + 1,
    weeklyGain: e.gain,
    prevRank: prevRanks[e.repo.name] ?? null,
  }))
}

export function entryChanges(currentNames, prevNames = []) {
  const cur = new Set(currentNames)
  const prev = new Set(prevNames)
  let newEntries = 0
  let droppedEntries = 0
  for (const n of cur) if (!prev.has(n)) newEntries++
  for (const n of prev) if (!cur.has(n)) droppedEntries++
  return { newEntries, droppedEntries }
}
