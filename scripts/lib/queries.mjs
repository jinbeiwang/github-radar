export const LANGUAGES = ['Python', 'TypeScript', 'Go', 'Rust', 'C++', 'Java', 'JavaScript']

export const qOverall = (from) => `stars:>200 pushed:>${from}`
export const qLanguage = (from, lang) => `stars:>200 pushed:>${from} language:${lang}`
export const qAI = (from) => `LLM OR GPT OR agent OR "large language model" OR RAG OR "AI framework" stars:>500 pushed:>${from}`
export const qTools = (from) => `"developer tools" OR devtools OR productivity OR "command line" OR "automation tool" stars:>500 pushed:>${from}`
export const qRising = (from) => `stars:>100 created:>${from}`
