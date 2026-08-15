import { fmtStars } from '../lib/format'
import { langColor } from '../lib/langColors'
import type { Repo } from '../lib/types'

function Card({ repo }: { repo: Repo }) {
  return (
    <div className="repo-card" onClick={() => window.open(repo.url, '_blank')}>
      <span className="repo-badge">
        {repo.name.slice(0, 2)}
        {repo.avatar && <img src={repo.avatar} alt="" loading="lazy" />}
      </span>
      <div className="repo-card-body">
        <a href={repo.url} target="_blank" rel="noreferrer" className="repo-name">{repo.name}</a>
        <div className="repo-desc">{repo.description}</div>
        <div className="repo-card-meta">
          <span>★ {fmtStars(repo.stars)}</span>
          {repo.language && <span>
            <span className="lang-dot" style={{ background: langColor(repo.language) }} />{repo.language}
          </span>}
          {repo.topics.slice(0, 2).map((t) => <span key={t} className="topic-tag">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

interface SectionProps {
  kind: 'ai' | 'tools'
  title: string
  keywords: string
  repos: Repo[]
}

function Section({ kind, title, keywords, repos }: SectionProps) {
  return (
    <section className="topic-section">
      <div className="topic-head">
        <span className={`topic-icon ${kind}`}>{kind === 'ai' ? '🧠' : '🛠'}</span>
        <span className="topic-title">{title}</span>
        <span className="topic-count">{repos.length} 个项目</span>
        <span className={`topic-kw ${kind}`}>{keywords}</span>
      </div>
      {repos.length
        ? <div className="cards">{repos.map((r) => <Card key={r.name} repo={r} />)}</div>
        : <div className="empty-card">本期暂无符合条件的项目</div>}
    </section>
  )
}

export default function TopicBoards({ topics }: { topics: { ai: Repo[]; tools: Repo[] } }) {
  return (
    <div>
      <Section kind="ai" title="AI · 大模型与应用" keywords="LLM / GPT / agent / RAG" repos={topics.ai} />
      <Section kind="tools" title="开发者工具与效率" keywords="devtools / CLI / automation" repos={topics.tools} />
    </div>
  )
}
