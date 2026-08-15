import https from 'node:https'

function requestOnce(endpoint, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'github-radar/1.0',
      Accept: 'application/vnd.github.v3+json',
    }
    if (token) headers.Authorization = `Bearer ${token}`
    https.get({ hostname: 'api.github.com', path: endpoint, headers }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API ${res.statusCode}: ${body.slice(0, 200)}`))
          return
        }
        try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function searchRepos({ q, sort = 'stars', order = 'desc', perPage = 30, page = 1 }, token, retries = 3) {
  const endpoint = `/search/repositories?q=${encodeURIComponent(q)}&sort=${sort}&order=${order}&per_page=${perPage}&page=${page}`
  let lastErr
  for (let attempt = 1; attempt <= retries; attempt++) {
    try { return await requestOnce(endpoint, token) }
    catch (e) {
      lastErr = e
      if (attempt < retries) await sleep(2000 * 2 ** (attempt - 1))
    }
  }
  throw lastErr
}
