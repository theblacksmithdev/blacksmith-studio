import type { AttachmentKind } from "./types";

const IMAGE = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif",
  "heic",
]);
const CODE = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "kt",
  "swift",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "php",
  "sh",
  "bash",
  "sql",
  "graphql",
  "html",
  "vue",
  "css",
  "scss",
]);
const TEXT = new Set([
  "txt",
  "md",
  "mdx",
  "json",
  "yaml",
  "yml",
  "toml",
  "xml",
  "csv",
  "tsv",
  "log",
  "env",
]);

export function kindFromName(name: string): AttachmentKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE.has(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (CODE.has(ext)) return "code";
  if (TEXT.has(ext)) return "text";
  return "file";
}
