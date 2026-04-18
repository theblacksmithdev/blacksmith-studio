import type { AttachmentKind } from "./types.js";

const IMAGE_EXTS = new Set([
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

const CODE_EXTS = new Set([
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
  "zsh",
  "sql",
  "graphql",
  "html",
  "vue",
  "css",
  "scss",
]);

const TEXT_EXTS = new Set([
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
  "ini",
  "conf",
]);

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
  heic: "image/heic",
  pdf: "application/pdf",
  json: "application/json",
  md: "text/markdown",
  txt: "text/plain",
  csv: "text/csv",
};

export function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function kindFor(name: string): AttachmentKind {
  const ext = extOf(name);
  if (IMAGE_EXTS.has(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (CODE_EXTS.has(ext)) return "code";
  if (TEXT_EXTS.has(ext)) return "text";
  return "file";
}

export function mimeFor(name: string): string {
  const ext = extOf(name);
  return MIME_MAP[ext] ?? "application/octet-stream";
}
