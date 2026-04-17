import type { LucideIcon } from "lucide-react";
import {
  Braces,
  FileCode2,
  FileJson,
  FileText,
  FileType,
  FileType2,
  Hash,
  Palette,
  Terminal,
  Image,
  Boxes,
  Database,
  Settings,
  FileCog,
} from "lucide-react";

const ICON_BY_LANGUAGE: Record<string, LucideIcon> = {
  typescript: FileCode2,
  tsx: FileCode2,
  javascript: FileCode2,
  jsx: FileCode2,
  python: FileCode2,
  ruby: FileCode2,
  go: FileCode2,
  rust: FileCode2,
  java: FileCode2,
  kotlin: FileCode2,
  swift: FileCode2,
  c: FileCode2,
  cpp: FileCode2,
  csharp: FileCode2,
  php: FileCode2,
  vue: FileCode2,
  json: Braces,
  yaml: FileCog,
  toml: FileCog,
  markdown: FileText,
  html: FileType2,
  xml: FileType2,
  css: Palette,
  scss: Palette,
  sass: Palette,
  less: Palette,
  sql: Database,
  graphql: Database,
  bash: Terminal,
  shell: Terminal,
  dockerfile: Boxes,
  nix: Settings,
  env: FileCog,
  proto: FileCog,
  protobuf: FileCog,
};

const ICON_BY_EXT: Record<string, LucideIcon> = {
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  svg: Image,
  webp: Image,
  txt: FileText,
  log: FileText,
};

export function getFileIcon(
  language: string | undefined,
  filename: string | undefined,
): LucideIcon {
  if (language && ICON_BY_LANGUAGE[language]) return ICON_BY_LANGUAGE[language];
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext && ICON_BY_EXT[ext]) return ICON_BY_EXT[ext];
  }
  return language ? FileCode2 : FileText;
}

export { Hash, FileJson, FileType };
