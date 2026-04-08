import fs from 'node:fs'
import path from 'node:path'

/* ── Types ── */

export interface KnowledgeDoc {
  name: string
  size: number
  updatedAt: string
}

export interface KnowledgeDocContent {
  name: string
  content: string
}

/* ── Default templates ── */

const DEFAULT_DOCS: Record<string, string> = {
  'requirements.md': `# Product Requirements

## Overview
Describe the purpose and goals of this project.

## Target Users
Who is this product for?

## Core Features
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Non-Functional Requirements
- Performance: ...
- Security: ...
- Accessibility: ...
`,
  'architecture.md': `# Technical Architecture

## Stack
- **Backend**: Django + Django REST Framework
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL / SQLite

## Project Structure
Describe the folder layout and key modules.

## Data Model
Describe the core entities and their relationships.

## API Design
Describe the API patterns and conventions used.

## Authentication & Authorization
How users are authenticated and what permissions exist.
`,
}

/* ── Manager ── */

export class KnowledgeManager {
  private docsDir(projectRoot: string): string {
    return path.join(projectRoot, '.blacksmith', 'docs')
  }

  private ensureDir(projectRoot: string): void {
    const dir = this.docsDir(projectRoot)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      // Seed with default templates
      for (const [name, content] of Object.entries(DEFAULT_DOCS)) {
        fs.writeFileSync(path.join(dir, name), content, 'utf-8')
      }
    }
  }

  list(projectRoot: string): KnowledgeDoc[] {
    this.ensureDir(projectRoot)
    const dir = this.docsDir(projectRoot)

    try {
      return fs.readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const stat = fs.statSync(path.join(dir, f))
          return {
            name: f,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch {
      return []
    }
  }

  get(projectRoot: string, name: string): KnowledgeDocContent | null {
    const filePath = path.join(this.docsDir(projectRoot), name)
    if (!fs.existsSync(filePath)) return null
    try {
      return { name, content: fs.readFileSync(filePath, 'utf-8') }
    } catch {
      return null
    }
  }

  save(projectRoot: string, name: string, content: string): void {
    this.ensureDir(projectRoot)
    const filePath = path.join(this.docsDir(projectRoot), name)
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  create(projectRoot: string, name: string): void {
    this.ensureDir(projectRoot)
    const safeName = name.endsWith('.md') ? name : `${name}.md`
    const filePath = path.join(this.docsDir(projectRoot), safeName)
    if (fs.existsSync(filePath)) {
      throw new Error(`Document "${safeName}" already exists`)
    }
    const title = safeName.replace('.md', '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    fs.writeFileSync(filePath, `# ${title}\n\nDescribe this aspect of your project.\n`, 'utf-8')
  }

  remove(projectRoot: string, name: string): void {
    const filePath = path.join(this.docsDir(projectRoot), name)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  /**
   * Concatenate all knowledge docs into a single string for context injection.
   * Capped at ~32KB to avoid token limits.
   */
  getAllContent(projectRoot: string): string {
    const dir = this.docsDir(projectRoot)
    if (!fs.existsSync(dir)) return ''

    const parts: string[] = []
    let totalSize = 0
    const MAX_SIZE = 32 * 1024

    try {
      const files = fs.readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort()

      for (const file of files) {
        const filePath = path.join(dir, file)
        try {
          const content = fs.readFileSync(filePath, 'utf-8').trim()
          if (!content) continue
          if (totalSize + content.length > MAX_SIZE) break
          parts.push(`### ${file}\n${content}`)
          totalSize += content.length
        } catch { /* skip */ }
      }
    } catch { /* empty */ }

    return parts.length > 0 ? parts.join('\n\n') : ''
  }
}
