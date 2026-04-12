import fs from 'node:fs'
import path from 'node:path'
import type { FileNode } from '../types.js'

const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', '__pycache__', 'venv', 'dist', '.env',
  '.blacksmith-studio', '.claude', '.vscode', '.idea',
  'htmlcov', '.pytest_cache', '.mypy_cache',
])

const IGNORE_EXTENSIONS = new Set(['.pyc', '.pyo', '.egg-info'])

export function buildFileTree(
  projectRoot: string,
  dir?: string,
  depth = 0,
  maxDepth = 6,
): FileNode {
  const currentDir = dir || projectRoot
  const name = dir ? path.basename(currentDir) : path.basename(projectRoot)
  const relativePath = path.relative(projectRoot, currentDir)

  if (depth >= maxDepth) {
    return { name, path: relativePath || '.', type: 'directory', children: [] }
  }

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true })
  } catch {
    return { name, path: relativePath || '.', type: 'directory', children: [] }
  }

  const children: FileNode[] = []

  for (const entry of entries.sort((a, b) => {
    // Directories first, then alphabetical
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })) {
    if (entry.name.startsWith('.') && DEFAULT_IGNORE.has(entry.name)) continue
    if (DEFAULT_IGNORE.has(entry.name)) continue
    if (IGNORE_EXTENSIONS.has(path.extname(entry.name))) continue

    const fullPath = path.join(currentDir, entry.name)
    const relPath = path.relative(projectRoot, fullPath)

    if (entry.isDirectory()) {
      children.push(buildFileTree(projectRoot, fullPath, depth + 1, maxDepth))
    } else {
      children.push({ name: entry.name, path: relPath, type: 'file' })
    }
  }

  return {
    name,
    path: relativePath || '.',
    type: 'directory',
    children,
  }
}

export function readFileContent(
  projectRoot: string,
  relativePath: string,
): { content: string; language: string; size: number } {
  const fullPath = path.resolve(projectRoot, relativePath)

  // Security: ensure the path is within the project root
  if (!fullPath.startsWith(projectRoot)) {
    throw new Error('This file is outside the project directory and can\'t be accessed.')
  }

  const stat = fs.statSync(fullPath)
  if (stat.size > 1024 * 512) {
    throw new Error('This file is too large to open (over 512 KB). Try opening it in an external editor.')
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  const ext = path.extname(relativePath).slice(1)
  const languageMap: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', json: 'json', md: 'markdown', css: 'css', html: 'html',
    yml: 'yaml', yaml: 'yaml', toml: 'toml', sql: 'sql', sh: 'bash',
    txt: 'text', hbs: 'handlebars',
  }

  return { content, language: languageMap[ext] || ext || 'text', size: stat.size }
}

export function writeFileContent(
  projectRoot: string,
  relativePath: string,
  content: string,
): void {
  const fullPath = path.resolve(projectRoot, relativePath)

  // Security: ensure the path is within the project root
  if (!fullPath.startsWith(projectRoot)) {
    throw new Error('This file is outside the project directory and can\'t be saved.')
  }

  fs.writeFileSync(fullPath, content, 'utf-8')
}

/* ── Content Search ── */

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md', '.css', '.scss',
  '.html', '.yml', '.yaml', '.toml', '.sql', '.sh', '.txt', '.hbs',
  '.env', '.cfg', '.ini', '.xml', '.svg', '.go', '.rs', '.java', '.rb',
  '.php', '.c', '.cpp', '.h', '.vue', '.svelte',
])

const MAX_FILE_SIZE = 256 * 1024 // 256KB — skip large files

export interface SearchResult {
  path: string
  name: string
  matches: { line: number; text: string }[]
}

/**
 * Search file contents in the project for a query string.
 * Returns matching file paths with line-level matches (max 3 per file).
 */
export function searchFileContents(
  projectRoot: string,
  query: string,
  maxResults = 20,
): SearchResult[] {
  if (!query || query.length < 2) return []

  const results: SearchResult[] = []
  const q = query.toLowerCase()

  function walk(dir: string) {
    if (results.length >= maxResults) return

    let entries: fs.Dirent[]
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) }
    catch { return }

    for (const entry of entries) {
      if (results.length >= maxResults) return
      if (DEFAULT_IGNORE.has(entry.name)) continue
      if (entry.name.startsWith('.') && DEFAULT_IGNORE.has(entry.name)) continue

      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        walk(fullPath)
      } else {
        const ext = path.extname(entry.name).toLowerCase()
        if (!TEXT_EXTENSIONS.has(ext)) continue

        try {
          const stat = fs.statSync(fullPath)
          if (stat.size > MAX_FILE_SIZE) continue

          const content = fs.readFileSync(fullPath, 'utf-8')
          const lines = content.split('\n')
          const matches: { line: number; text: string }[] = []

          for (let i = 0; i < lines.length && matches.length < 3; i++) {
            if (lines[i].toLowerCase().includes(q)) {
              matches.push({ line: i + 1, text: lines[i].trim().slice(0, 120) })
            }
          }

          if (matches.length > 0) {
            results.push({
              path: path.relative(projectRoot, fullPath),
              name: entry.name,
              matches,
            })
          }
        } catch { /* skip unreadable files */ }
      }
    }
  }

  walk(projectRoot)
  return results
}
