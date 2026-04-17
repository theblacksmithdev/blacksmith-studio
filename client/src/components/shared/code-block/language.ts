const EXT_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  swift: "swift",
  c: "c",
  h: "c",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  md: "markdown",
  mdx: "markdown",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  html: "html",
  xml: "xml",
  svg: "xml",
  sql: "sql",
  graphql: "graphql",
  proto: "protobuf",
  dockerfile: "dockerfile",
  nix: "nix",
  vue: "vue",
  env: "bash",
};

export function inferLanguage(
  explicit: string | undefined,
  filename: string | undefined,
): string {
  if (explicit) return explicit;
  if (!filename) return "";
  const name = filename.split(/[\\/]/).pop() ?? filename;
  if (name.toLowerCase() === "dockerfile") return "dockerfile";
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return "";
  return EXT_MAP[ext] ?? ext;
}

export function shortFilename(filename: string): string {
  return filename.split(/[\\/]/).pop() ?? filename;
}
