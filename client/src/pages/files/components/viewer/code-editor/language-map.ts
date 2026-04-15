const languageMap: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  json: "json",
  html: "html",
  css: "css",
  scss: "scss",
  less: "less",
  markdown: "markdown",
  yaml: "yaml",
  toml: "toml",
  sql: "sql",
  bash: "shell",
  text: "plaintext",
  handlebars: "handlebars",
  xml: "xml",
  go: "go",
  rust: "rust",
  java: "java",
  ruby: "ruby",
  php: "php",
  c: "c",
  cpp: "cpp",
};

export function getMonacoLanguage(language: string): string {
  return languageMap[language] || "plaintext";
}
