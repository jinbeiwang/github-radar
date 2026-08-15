import { useState } from "react";
import {
  Star, GitFork, ExternalLink, Calendar, Eye,
  TrendingUp, Bot, Wrench, Flame, Zap,
  Clock, BarChart3, Award, ArrowUpRight
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
//  DATA — 由 GitHub Radar 自动生成，请勿手动修改
// ══════════════════════════════════════════════════════════════
const DATA = {"generatedAt":"2026-07-17T13:54:14.466Z","dateRange":{"from":"2026-07-10","to":"2026-07-17"},"stats":{"totalRepos":44,"aiCount":12,"toolsCount":12,"trendingCount":10,"totalStars":7216097,"languages":9},"ai":[{"name":"obra/superpowers","description":"An agentic skills framework & software development methodology that works.","stars":256430,"forks":22830,"language":"Shell","url":"https://github.com/obra/superpowers","topics":["ai","brainstorming","coding","obra","sdlc","skills"],"createdAt":"2025-10-09","updatedAt":"2026-07-17","openIssues":318,"owner":"obra","ownerAvatar":"https://avatars.githubusercontent.com/u/45416?v=4"},{"name":"affaan-m/ECC","description":"The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond.","stars":230551,"forks":35185,"language":"JavaScript","url":"https://github.com/affaan-m/ECC","topics":["ai-agents","anthropic","claude","claude-code","developer-tools","llm"],"createdAt":"2026-01-18","updatedAt":"2026-07-17","openIssues":111,"owner":"affaan-m","ownerAvatar":"https://avatars.githubusercontent.com/u/124439313?v=4"},{"name":"NousResearch/hermes-agent","description":"The agent that grows with you","stars":216288,"forks":40475,"language":"Python","url":"https://github.com/NousResearch/hermes-agent","topics":["ai","ai-agent","ai-agents","anthropic","chatgpt","claude"],"createdAt":"2025-07-22","updatedAt":"2026-07-17","openIssues":23308,"owner":"NousResearch","ownerAvatar":"https://avatars.githubusercontent.com/u/134168893?v=4"},{"name":"anomalyco/opencode","description":"The open source coding agent.","stars":186797,"forks":23442,"language":"TypeScript","url":"https://github.com/anomalyco/opencode","topics":[],"createdAt":"2025-04-30","updatedAt":"2026-07-17","openIssues":4764,"owner":"anomalyco","ownerAvatar":"https://avatars.githubusercontent.com/u/66570915?v=4"},{"name":"Significant-Gravitas/AutoGPT","description":"AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools, so that you can focus on what matters.","stars":185589,"forks":46078,"language":"Python","url":"https://github.com/Significant-Gravitas/AutoGPT","topics":["agentic-ai","agents","ai","artificial-intelligence","autonomous-agents","claude"],"createdAt":"2023-03-16","updatedAt":"2026-07-17","openIssues":501,"owner":"Significant-Gravitas","ownerAvatar":"https://avatars.githubusercontent.com/u/130738209?v=4"},{"name":"ollama/ollama","description":"Get up and running with Kimi-K2.6, GLM-5.1, MiniMax, DeepSeek, gpt-oss, Qwen, Gemma and other models.","stars":176310,"forks":16992,"language":"Go","url":"https://github.com/ollama/ollama","topics":["deepseek","gemma","gemma3","glm","go","golang"],"createdAt":"2023-06-26","updatedAt":"2026-07-17","openIssues":3463,"owner":"ollama","ownerAvatar":"https://avatars.githubusercontent.com/u/151674099?v=4"},{"name":"mattpocock/skills","description":"Skills for Real Engineers. Straight from my .agents directory.","stars":175280,"forks":15023,"language":"Shell","url":"https://github.com/mattpocock/skills","topics":[],"createdAt":"2026-02-03","updatedAt":"2026-07-17","openIssues":187,"owner":"mattpocock","ownerAvatar":"https://avatars.githubusercontent.com/u/28293365?v=4"},{"name":"f/prompts.chat","description":"f.k.a. Awesome ChatGPT Prompts. Share, discover, and collect prompts from the community. Free and open source — self-host for your organization with complete privacy.","stars":165896,"forks":21456,"language":"HTML","url":"https://github.com/f/prompts.chat","topics":["ai","artificial-intelligence","awesome-list","chatgpt","chatgpt-prompts","claude"],"createdAt":"2022-12-05","updatedAt":"2026-07-17","openIssues":66,"owner":"f","ownerAvatar":"https://avatars.githubusercontent.com/u/196477?v=4"},{"name":"huggingface/transformers","description":"Transformers: the model-definition framework for state-of-the-art machine learning models in text, vision, audio, and multimodal models, for both inference and training.","stars":162685,"forks":33907,"language":"Python","url":"https://github.com/huggingface/transformers","topics":["audio","deep-learning","deepseek","gemma","glm","hacktoberfest"],"createdAt":"2018-10-29","updatedAt":"2026-07-17","openIssues":2468,"owner":"huggingface","ownerAvatar":"https://avatars.githubusercontent.com/u/25720743?v=4"},{"name":"anthropics/skills","description":"Public repository for Agent Skills","stars":162009,"forks":19180,"language":"Python","url":"https://github.com/anthropics/skills","topics":["agent-skills"],"createdAt":"2025-09-22","updatedAt":"2026-07-17","openIssues":1034,"owner":"anthropics","ownerAvatar":"https://avatars.githubusercontent.com/u/76263028?v=4"},{"name":"firecrawl/firecrawl","description":"The API to search, scrape, and interact with the web at scale.","stars":152259,"forks":8695,"language":"TypeScript","url":"https://github.com/firecrawl/firecrawl","topics":["ai","ai-agents","ai-crawler","ai-scraping","ai-search","crawler"],"createdAt":"2024-04-15","updatedAt":"2026-07-17","openIssues":413,"owner":"firecrawl","ownerAvatar":"https://avatars.githubusercontent.com/u/135057108?v=4"},{"name":"langflow-ai/langflow","description":"Langflow is a powerful tool for building and deploying AI-powered agents and workflows.","stars":151946,"forks":9584,"language":"Python","url":"https://github.com/langflow-ai/langflow","topics":["agents","chatgpt","generative-ai","large-language-models","multiagent","react-flow"],"createdAt":"2023-02-08","updatedAt":"2026-07-17","openIssues":977,"owner":"langflow-ai","ownerAvatar":"https://avatars.githubusercontent.com/u/85702467?v=4"}],"tools":[{"name":"affaan-m/ECC","description":"The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond.","stars":230551,"forks":35185,"language":"JavaScript","url":"https://github.com/affaan-m/ECC","topics":["ai-agents","anthropic","claude","claude-code","developer-tools","llm"],"createdAt":"2026-01-18","updatedAt":"2026-07-17","openIssues":111,"owner":"affaan-m","ownerAvatar":"https://avatars.githubusercontent.com/u/124439313?v=4"},{"name":"ohmyzsh/ohmyzsh","description":"A delightful community-driven framework for managing your zsh configuration. Includes 300+ optional plugins.","stars":188668,"forks":26467,"language":"Shell","url":"https://github.com/ohmyzsh/ohmyzsh","topics":["cli","cli-app","oh-my-zsh","oh-my-zsh-plugin","oh-my-zsh-theme","ohmyzsh"],"createdAt":"2009-08-28","updatedAt":"2026-07-17","openIssues":583,"owner":"ohmyzsh","ownerAvatar":"https://avatars.githubusercontent.com/u/22552083?v=4"},{"name":"yt-dlp/yt-dlp","description":"A feature-rich command-line audio/video downloader","stars":178456,"forks":15169,"language":"Python","url":"https://github.com/yt-dlp/yt-dlp","topics":["cli","downloader","python","sponsorblock","youtube-dl","youtube-downloader"],"createdAt":"2020-10-26","updatedAt":"2026-07-17","openIssues":2535,"owner":"yt-dlp","ownerAvatar":"https://avatars.githubusercontent.com/u/79589310?v=4"},{"name":"microsoft/PowerToys","description":"Microsoft PowerToys is a collection of utilities that supercharge productivity and customization on Windows","stars":136519,"forks":8286,"language":"C","url":"https://github.com/microsoft/PowerToys","topics":["advanced-paste","color-picker","command-palette","desktop","fancyzones","keyboard-manager"],"createdAt":"2019-05-01","updatedAt":"2026-07-17","openIssues":7399,"owner":"microsoft","ownerAvatar":"https://avatars.githubusercontent.com/u/6154722?v=4"},{"name":"excalidraw/excalidraw","description":"Virtual whiteboard for sketching hand-drawn like diagrams","stars":127723,"forks":14428,"language":"TypeScript","url":"https://github.com/excalidraw/excalidraw","topics":["canvas","collaboration","diagrams","drawing","hacktoberfest","productivity"],"createdAt":"2020-01-02","updatedAt":"2026-07-17","openIssues":3211,"owner":"excalidraw","ownerAvatar":"https://avatars.githubusercontent.com/u/59452120?v=4"},{"name":"junegunn/fzf","description":"A command-line fuzzy finder","stars":81796,"forks":2817,"language":"Go","url":"https://github.com/junegunn/fzf","topics":["bash","cli","fish","fzf","go","neovim"],"createdAt":"2013-10-23","updatedAt":"2026-07-17","openIssues":323,"owner":"junegunn","ownerAvatar":"https://avatars.githubusercontent.com/u/700826?v=4"},{"name":"rtk-ai/rtk","description":"CLI proxy that reduces LLM token consumption by 60-90% on common dev commands. Single Rust binary, zero dependencies","stars":71532,"forks":4450,"language":"Rust","url":"https://github.com/rtk-ai/rtk","topics":["agentic-coding","ai-coding","anthropic","claude-code","cli","command-line-tool"],"createdAt":"2026-01-22","updatedAt":"2026-07-17","openIssues":1626,"owner":"rtk-ai","ownerAvatar":"https://avatars.githubusercontent.com/u/258253854?v=4"},{"name":"hesreallyhim/awesome-claude-code","description":"A hand-picked collection of the finest resources for Claude Code, the champion of coding companions.","stars":50230,"forks":4375,"language":"Python","url":"https://github.com/hesreallyhim/awesome-claude-code","topics":["agent-skills","agentic-code","agentic-coding","ai-workflow-optimization","ai-workflows","anthropic"],"createdAt":"2025-04-19","updatedAt":"2026-07-17","openIssues":690,"owner":"hesreallyhim","ownerAvatar":"https://avatars.githubusercontent.com/u/172150522?v=4"},{"name":"CherryHQ/cherry-studio","description":"AI productivity studio with smart chat, autonomous agents, and 300+ assistants. Unified access to frontier LLMs","stars":48692,"forks":4625,"language":"TypeScript","url":"https://github.com/CherryHQ/cherry-studio","topics":["agent-skills","ai-agent","awesome-skills","claude-code","codex","deepseek"],"createdAt":"2024-05-24","updatedAt":"2026-07-17","openIssues":1217,"owner":"CherryHQ","ownerAvatar":"https://avatars.githubusercontent.com/u/187777663?v=4"},{"name":"ChromeDevTools/chrome-devtools-mcp","description":"Chrome DevTools for coding agents","stars":47083,"forks":3135,"language":"TypeScript","url":"https://github.com/ChromeDevTools/chrome-devtools-mcp","topics":["browser","chrome","chrome-devtools","debugging","devtools","mcp"],"createdAt":"2025-09-11","updatedAt":"2026-07-17","openIssues":106,"owner":"ChromeDevTools","ownerAvatar":"https://avatars.githubusercontent.com/u/11260967?v=4"},{"name":"cli/cli","description":"GitHub's official command line tool","stars":45296,"forks":8703,"language":"Go","url":"https://github.com/cli/cli","topics":["cli","git","github-api-v4","golang"],"createdAt":"2019-10-03","updatedAt":"2026-07-17","openIssues":1036,"owner":"cli","ownerAvatar":"https://avatars.githubusercontent.com/u/59704711?v=4"},{"name":"files-community/Files","description":"A modern file manager that helps users organize their files and folders.","stars":44335,"forks":2793,"language":"C#","url":"https://github.com/files-community/Files","topics":["alternatives","csharp","customization","developer-tools","dotnet","file-manager"],"createdAt":"2019-01-04","updatedAt":"2026-07-17","openIssues":468,"owner":"files-community","ownerAvatar":"https://avatars.githubusercontent.com/u/65931357?v=4"}],"trending":[{"name":"xai-org/grok-build","description":"SpaceXAI's coding agent harness and TUI. Fullscreen, mouse interactive, extensible.","stars":15036,"forks":2798,"language":"Rust","url":"https://github.com/xai-org/grok-build","topics":[],"createdAt":"2026-07-14","updatedAt":"2026-07-17","openIssues":0,"owner":"xai-org","ownerAvatar":"https://avatars.githubusercontent.com/u/130314967?v=4"},{"name":"Fei-Away/Codex-Dream-Skin","description":"Codex Dream Skin","stars":8308,"forks":881,"language":"JavaScript","url":"https://github.com/Fei-Away/Codex-Dream-Skin","topics":[],"createdAt":"2026-07-15","updatedAt":"2026-07-17","openIssues":72,"owner":"Fei-Away","ownerAvatar":"https://avatars.githubusercontent.com/u/100042407?v=4"},{"name":"MDX-Tom/gpt-5.6-instruct","description":"A Codex CLI jailbreak prompt and test pack for gpt-5.6-sol.","stars":1835,"forks":350,"language":"Python","url":"https://github.com/MDX-Tom/gpt-5.6-instruct","topics":[],"createdAt":"2026-07-11","updatedAt":"2026-07-17","openIssues":3,"owner":"MDX-Tom","ownerAvatar":"https://avatars.githubusercontent.com/u/6468993?v=4"},{"name":"pixel-point/aval","description":"A new open-source format for interactive video on the web, with a built-in state machine, frame-accurate transitions, and packed-alpha transparency.","stars":1133,"forks":62,"language":"TypeScript","url":"https://github.com/pixel-point/aval","topics":[],"createdAt":"2026-07-13","updatedAt":"2026-07-17","openIssues":2,"owner":"pixel-point","ownerAvatar":"https://avatars.githubusercontent.com/u/29034027?v=4"},{"name":"littledivy/mimic","description":"Intercept any app, then call it from Python like a library","stars":1128,"forks":62,"language":"Python","url":"https://github.com/littledivy/mimic","topics":[],"createdAt":"2026-07-13","updatedAt":"2026-07-17","openIssues":4,"owner":"littledivy","ownerAvatar":"https://avatars.githubusercontent.com/u/34997667?v=4"},{"name":"CluvexStudio/Aether","description":"Aether","stars":1019,"forks":60,"language":"Rust","url":"https://github.com/CluvexStudio/Aether","topics":[],"createdAt":"2026-07-14","updatedAt":"2026-07-17","openIssues":3,"owner":"CluvexStudio","ownerAvatar":"https://avatars.githubusercontent.com/u/125141320?v=4"},{"name":"x4gKing/Marzban-Panel","description":"Marzban Panel","stars":880,"forks":1650,"language":"Dockerfile","url":"https://github.com/x4gKing/Marzban-Panel","topics":[],"createdAt":"2026-07-12","updatedAt":"2026-07-17","openIssues":1,"owner":"x4gKing","ownerAvatar":"https://avatars.githubusercontent.com/u/298382259?v=4"},{"name":"mereyabdenbekuly-ctrl/clodex-ide","description":"Local-first, zero-trust agentic IDE for verifiable autonomous software development.","stars":831,"forks":148,"language":"TypeScript","url":"https://github.com/mereyabdenbekuly-ctrl/clodex-ide","topics":["agentic-ai","agentic-ide","ai-agents","developer-tools","electron","ide"],"createdAt":"2026-07-12","updatedAt":"2026-07-17","openIssues":1,"owner":"mereyabdenbekuly-ctrl","ownerAvatar":"https://avatars.githubusercontent.com/u/234955825?v=4"},{"name":"tandpfun/wardrobe","description":"Your clothes, extracted and organized with gpt-image.","stars":792,"forks":116,"language":"JavaScript","url":"https://github.com/tandpfun/wardrobe","topics":[],"createdAt":"2026-07-16","updatedAt":"2026-07-17","openIssues":2,"owner":"tandpfun","ownerAvatar":"https://avatars.githubusercontent.com/u/28990589?v=4"},{"name":"Kappaemme-git/codex-first-customer-finder-skill","description":"A Codex skill that finds evidence-backed potential first customers from recent public signals.","stars":775,"forks":80,"language":"Python","url":"https://github.com/Kappaemme-git/codex-first-customer-finder-skill","topics":["codex","codex-skill","customer-discovery","early-adopters","prospecting","startup"],"createdAt":"2026-07-12","updatedAt":"2026-07-17","openIssues":3,"owner":"Kappaemme-git","ownerAvatar":"https://avatars.githubusercontent.com/u/203409268?v=4"}],"weeklyHot":[{"name":"codecrafters-io/build-your-own-x","description":"Master programming by recreating your favorite technologies from scratch.","stars":526906,"forks":49866,"language":"Markdown","url":"https://github.com/codecrafters-io/build-your-own-x","topics":["awesome-list","free","programming","tutorial-code","tutorial-exercises","tutorials"],"createdAt":"2018-05-09","updatedAt":"2026-07-17","openIssues":522,"owner":"codecrafters-io","ownerAvatar":"https://avatars.githubusercontent.com/u/58904235?v=4"},{"name":"freeCodeCamp/freeCodeCamp","description":"freeCodeCamp.org's open-source codebase and curriculum. Learn math, programming, and computer science for free.","stars":451931,"forks":45574,"language":"TypeScript","url":"https://github.com/freeCodeCamp/freeCodeCamp","topics":["careers","certification","community","curriculum","d3","education"],"createdAt":"2014-12-24","updatedAt":"2026-07-17","openIssues":273,"owner":"freeCodeCamp","ownerAvatar":"https://avatars.githubusercontent.com/u/9892522?v=4"},{"name":"public-apis/public-apis","description":"A collective list of free APIs","stars":450861,"forks":49592,"language":"Python","url":"https://github.com/public-apis/public-apis","topics":["api","apis","dataset","development","free","list"],"createdAt":"2016-03-20","updatedAt":"2026-07-17","openIssues":1554,"owner":"public-apis","ownerAvatar":"https://avatars.githubusercontent.com/u/51121562?v=4"},{"name":"EbookFoundation/free-programming-books","description":"Freely available programming books","stars":392293,"forks":66535,"language":"Python","url":"https://github.com/EbookFoundation/free-programming-books","topics":["books","education","hacktoberfest","list","resource"],"createdAt":"2013-10-11","updatedAt":"2026-07-17","openIssues":73,"owner":"EbookFoundation","ownerAvatar":"https://avatars.githubusercontent.com/u/14127308?v=4"},{"name":"openclaw/openclaw","description":"Your own personal AI assistant. Any OS. Any Platform.","stars":383236,"forks":80504,"language":"TypeScript","url":"https://github.com/openclaw/openclaw","topics":["ai","assistant","crustacean","molty","openclaw","own-your-data"],"createdAt":"2025-11-24","updatedAt":"2026-07-17","openIssues":6860,"owner":"openclaw","ownerAvatar":"https://avatars.githubusercontent.com/u/252820863?v=4"},{"name":"nilbuild/developer-roadmap","description":"Interactive roadmaps, guides and other educational content to help developers grow in their careers.","stars":361305,"forks":44557,"language":"TypeScript","url":"https://github.com/nilbuild/developer-roadmap","topics":["angular-roadmap","backend-roadmap","blockchain-roadmap","computer-science","dba-roadmap","developer-roadmap"],"createdAt":"2017-03-15","updatedAt":"2026-07-17","openIssues":11,"owner":"nilbuild","ownerAvatar":"https://avatars.githubusercontent.com/u/4921183?v=4"},{"name":"vinta/awesome-python","description":"An opinionated list of Python frameworks, libraries, tools, and resources","stars":308669,"forks":28337,"language":"Python","url":"https://github.com/vinta/awesome-python","topics":["awesome","collections","python","python-frameworks","python-libraries","python-tools"],"createdAt":"2014-06-27","updatedAt":"2026-07-17","openIssues":19,"owner":"vinta","ownerAvatar":"https://avatars.githubusercontent.com/u/652070?v=4"},{"name":"awesome-selfhosted/awesome-selfhosted","description":"A list of Free Software network services and web applications which can be hosted on your own servers","stars":306083,"forks":14346,"language":"N/A","url":"https://github.com/awesome-selfhosted/awesome-selfhosted","topics":["awesome","awesome-list","cloud","free-software","hosting","privacy"],"createdAt":"2015-06-01","updatedAt":"2026-07-17","openIssues":0,"owner":"awesome-selfhosted","ownerAvatar":"https://avatars.githubusercontent.com/u/24270415?v=4"},{"name":"practical-tutorials/project-based-learning","description":"Curated list of project-based tutorials","stars":273725,"forks":35304,"language":"Python","url":"https://github.com/practical-tutorials/project-based-learning","topics":["beginner-project","cpp","golang","javascript","project","python"],"createdAt":"2017-04-12","updatedAt":"2026-07-17","openIssues":289,"owner":"practical-tutorials","ownerAvatar":"https://avatars.githubusercontent.com/u/89421154?v=4"},{"name":"obra/superpowers","description":"An agentic skills framework & software development methodology that works.","stars":256430,"forks":22830,"language":"Shell","url":"https://github.com/obra/superpowers","topics":["ai","brainstorming","coding","obra","sdlc","skills"],"createdAt":"2025-10-09","updatedAt":"2026-07-17","openIssues":318,"owner":"obra","ownerAvatar":"https://avatars.githubusercontent.com/u/45416?v=4"}]};

// ══════════════════════════════════════════════════════════════
//  工具函数
// ══════════════════════════════════════════════════════════════
const fmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
};

const LANG_COLORS = {
  Python: "#3572A5", TypeScript: "#3178C6", JavaScript: "#F1E05A",
  Go: "#00ADD8", Rust: "#DEA584", Shell: "#89E051",
  "C#": "#178600", C: "#555555", HTML: "#E34C26",
  Java: "#B07219", "C++": "#F34B7D", Ruby: "#701516",
  Markdown: "#083FA1", Dockerfile: "#384D54", N: "#6E7681"
};

// ══════════════════════════════════════════════════════════════
//  模块注册表 — 添加新功能只需在此注册
// ══════════════════════════════════════════════════════════════
const MODULES = [
  { id: "ai", label: "AI / LLM", icon: Bot, dataKey: "ai" },
  { id: "tools", label: "Tools", icon: Wrench, dataKey: "tools" },
  { id: "trending", label: "Trending", icon: TrendingUp, dataKey: "trending" },
  { id: "weekly", label: "Weekly Hot", icon: Flame, dataKey: "weeklyHot" },
];

// ══════════════════════════════════════════════════════════════
//  Header 组件
// ══════════════════════════════════════════════════════════════
const Header = ({ data }) => {
  const updatedDate = new Date(data.generatedAt).toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric",
  });
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8">
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-orange-500 via-red-500 to-purple-600" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-400 opacity-10 blur-3xl" style={{ transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500 opacity-10 blur-3xl" style={{ transform: "translate(-20%, 40%)" }} />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GitHub Radar</h1>
        </div>
        <p className="text-slate-300 text-sm">
          {data.dateRange.from} — {data.dateRange.to}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400 text-xs">
            更新于 {updatedDate}
          </span>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  StatsBar 统计卡片
// ══════════════════════════════════════════════════════════════
const STATS_CONFIG = [
  { icon: Eye, label: "追踪仓库", valueKey: "totalRepos", color: "bg-blue-500" },
  { icon: Star, label: "Total Stars", valueKey: "totalStars", color: "bg-orange-500", format: true },
  { icon: Bot, label: "AI 项目", valueKey: "aiCount", color: "bg-purple-500" },
  { icon: Wrench, label: "工具项目", valueKey: "toolsCount", color: "bg-emerald-500" },
];

const StatsBar = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
    {STATS_CONFIG.map((s) => {
      const Icon = s.icon;
      const val = s.format ? fmt(stats[s.valueKey]) : stats[s.valueKey];
      return (
        <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} bg-opacity-10 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${s.color.replace("bg-", "")}`} style={{ color: s.color === "bg-blue-500" ? "#3B82F6" : s.color === "bg-orange-500" ? "#F97316" : s.color === "bg-purple-500" ? "#A855F7" : "#10B981" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{val}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ══════════════════════════════════════════════════════════════
//  RepoCard 仓库卡片
// ══════════════════════════════════════════════════════════════
const RepoCard = ({ repo, index }) => {
  const langColor = LANG_COLORS[repo.language] || "#6E7681";
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl p-4 border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-3">
        <img
          src={repo.ownerAvatar}
          alt={repo.owner}
          className="w-10 h-10 rounded-lg flex-shrink-0"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">#{index + 1}</span>
            <h4 className="font-semibold text-sm text-slate-900 truncate group-hover:text-orange-600 transition-colors">
              {repo.name}
            </h4>
            <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {repo.description || "No description"}
          </p>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {fmt(repo.stars)}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <GitFork className="w-3 h-3" />
              {fmt(repo.forks)}
            </span>
            {repo.language !== "N/A" && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: langColor }} />
                {repo.language}
              </span>
            )}
            {repo.topics.length > 0 && (
              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {repo.topics[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

// ══════════════════════════════════════════════════════════════
//  RepoSection 通用仓库列表模块
// ══════════════════════════════════════════════════════════════
const RepoSection = ({ title, subtitle, icon: Icon, repos, iconColor }) => (
  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + "18" }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
        {repos.length}
      </span>
    </div>
    <p className="text-xs text-slate-500 mb-4 ml-11">{subtitle}</p>
    <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      {repos.map((repo, i) => (
        <RepoCard key={repo.name} repo={repo} index={i} />
      ))}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  TrendingSection 新创趋势模块（大卡片布局）
// ══════════════════════════════════════════════════════════════
const TrendingSection = ({ repos }) => (
  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50">
        <TrendingUp className="w-4 h-4 text-amber-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">本周新创趋势</h2>
      <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
        {repos.length}
      </span>
    </div>
    <p className="text-xs text-slate-500 mb-4 ml-11">最近 7 天内新创建的明星项目</p>
    <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      {repos.map((repo, i) => {
        const langColor = LANG_COLORS[repo.language] || "#6E7681";
        return (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl p-5 border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
              {i + 1}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src={repo.ownerAvatar}
                alt={repo.owner}
                className="w-6 h-6 rounded"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <span className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                {repo.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
              {repo.description || "No description"}
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {fmt(repo.stars)}
              </span>
              {repo.language !== "N/A" && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />
                {repo.createdAt}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  WeeklyHot 周榜 Top 10 排行榜
// ══════════════════════════════════════════════════════════════
const WeeklyHot = ({ repos }) => (
  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
        <Flame className="w-4 h-4 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">本周全站 Top 10</h2>
    </div>
    <p className="text-xs text-slate-500 mb-5 ml-11">近 7 天活跃度最高的仓库</p>
    <div className="space-y-2">
      {repos.map((repo, i) => {
        const langColor = LANG_COLORS[repo.language] || "#6E7681";
        const isTop3 = i < 3;
        const rankColors = ["#F97316", "#64748B", "#D97706"];
        return (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-all"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                isTop3 ? "text-white" : "text-slate-400 bg-slate-100"
              }`}
              style={isTop3 ? { backgroundColor: rankColors[i] } : {}}
            >
              {i + 1}
            </div>
            <img
              src={repo.ownerAvatar}
              alt={repo.owner}
              className="w-8 h-8 rounded-lg flex-shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                {repo.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{repo.description}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              {repo.language !== "N/A" && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 min-w-16 justify-end">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {fmt(repo.stars)}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        );
      })}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  Footer 页脚
// ══════════════════════════════════════════════════════════════
const Footer = () => (
  <div className="text-center py-4">
    <p className="text-xs text-slate-400">
      Powered by GitHub Radar · Data from GitHub Search API · Updated weekly
    </p>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  主应用
// ══════════════════════════════════════════════════════════════
export default function GitHubRadar() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-100 p-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Header data={DATA} />

        {/* Stats */}
        <StatsBar stats={DATA.stats} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "leaderboard", label: "Leaderboard", icon: Award },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* AI / LLM */}
            <RepoSection
              title="AI / LLM / Agent"
              subtitle="近期最活跃的 AI 与大语言模型项目"
              icon={Bot}
              repos={DATA.ai}
              iconColor="#A855F7"
            />

            {/* Tools & Productivity */}
            <RepoSection
              title="工具 & 效率"
              subtitle="开发者工具、命令行工具与效率利器"
              icon={Wrench}
              repos={DATA.tools}
              iconColor="#10B981"
            />

            {/* Trending (new repos this week) */}
            <TrendingSection repos={DATA.trending} />
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === "leaderboard" && <WeeklyHot repos={DATA.weeklyHot} />}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
