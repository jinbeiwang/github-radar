const COLORS: Record<string, string> = {
  Python: '#3572A5', TypeScript: '#3178C6', JavaScript: '#F1E05A', Go: '#00ADD8',
  Rust: '#DEA584', 'C++': '#F34B7D', C: '#555555', Java: '#B07219', 'C#': '#178600',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Dart: '#00B4AB', Shell: '#89E051', HTML: '#E34C26', CSS: '#563D7C',
  Vue: '#41B883', Svelte: '#FF3E00', Zig: '#EC915C', Lua: '#000080', Haskell: '#5E5086',
  Elixir: '#6E4A7E', Scala: '#C22D40', 'Jupyter Notebook': '#DA5B0B', MDX: '#FCB32C',
}

export function langColor(lang: string | null): string {
  return (lang && COLORS[lang]) || '#8c959f'
}
