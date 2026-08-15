const DAY_MS = 86400 * 1000

export function cleanRepo(item) {
  return {
    name: item.full_name,
    owner: item.owner?.login ?? '',
    avatar: item.owner?.avatar_url ?? '',
    description: (item.description ?? '').slice(0, 160),
    url: item.html_url,
    stars: item.stargazers_count ?? 0,
    forks: item.forks_count ?? 0,
    language: item.language ?? null,
    topics: (item.topics ?? []).slice(0, 4),
    createdAt: (item.created_at ?? '').slice(0, 10),
    pushedAt: (item.pushed_at ?? '').slice(0, 10),
  }
}

export function dedupe(list) {
  const seen = new Set()
  return list.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)))
}

export function buildPool(repos) {
  return Object.fromEntries(repos.map((r) => [r.name, r.stars]))
}

export function daysOld(createdAt, toDate) {
  return Math.max(1, Math.round((Date.parse(toDate) - Date.parse(createdAt)) / DAY_MS))
}
