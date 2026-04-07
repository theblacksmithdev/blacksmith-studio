import fs from 'node:fs'
import path from 'node:path'

/* ── Types ── */

export interface SkillEntry {
  name: string
  description: string
  content: string
}

/* ── Manager ── */

export class SkillsManager {
  private skillsDir(projectRoot: string): string {
    return path.join(projectRoot, '.claude', 'skills')
  }

  private ensureDir(projectRoot: string): void {
    const dir = this.skillsDir(projectRoot)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  private parseSkill(filePath: string): { name: string; description: string; content: string } | null {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (!fmMatch) return null

      const frontmatter = fmMatch[1]
      const content = fmMatch[2].trim()

      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
      const descMatch = frontmatter.match(/^description:\s*(.+)$/m)

      return {
        name: nameMatch?.[1]?.trim() || path.basename(path.dirname(filePath)),
        description: descMatch?.[1]?.trim() || '',
        content,
      }
    } catch {
      return null
    }
  }

  list(projectRoot: string): SkillEntry[] {
    const dir = this.skillsDir(projectRoot)
    if (!fs.existsSync(dir)) return []

    const entries: SkillEntry[] = []

    try {
      const folders = fs.readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())

      for (const folder of folders) {
        const skillFile = path.join(dir, folder.name, 'SKILL.md')
        if (fs.existsSync(skillFile)) {
          const parsed = this.parseSkill(skillFile)
          if (parsed) entries.push(parsed)
        }
      }
    } catch { /* empty */ }

    return entries.sort((a, b) => a.name.localeCompare(b.name))
  }

  get(projectRoot: string, name: string): SkillEntry | null {
    const skillFile = path.join(this.skillsDir(projectRoot), name, 'SKILL.md')
    if (!fs.existsSync(skillFile)) return null
    return this.parseSkill(skillFile)
  }

  add(projectRoot: string, name: string, description: string, content: string): void {
    this.ensureDir(projectRoot)
    const skillDir = path.join(this.skillsDir(projectRoot), name)

    if (fs.existsSync(skillDir)) {
      throw new Error(`Skill "${name}" already exists`)
    }

    fs.mkdirSync(skillDir, { recursive: true })

    const fileContent = `---\nname: ${name}\ndescription: ${description}\n---\n\n${content}\n`
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), fileContent, 'utf-8')
  }

  update(projectRoot: string, name: string, description: string, content: string): void {
    const skillFile = path.join(this.skillsDir(projectRoot), name, 'SKILL.md')
    if (!fs.existsSync(skillFile)) {
      throw new Error(`Skill "${name}" not found`)
    }

    const fileContent = `---\nname: ${name}\ndescription: ${description}\n---\n\n${content}\n`
    fs.writeFileSync(skillFile, fileContent, 'utf-8')
  }

  remove(projectRoot: string, name: string): void {
    const skillDir = path.join(this.skillsDir(projectRoot), name)
    if (fs.existsSync(skillDir)) {
      fs.rmSync(skillDir, { recursive: true })
    }
  }
}
