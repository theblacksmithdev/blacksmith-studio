import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { nodeEnv } from '../../node-env.js'

export interface VerificationResult {
  passed: boolean
  summary: string
  output: string
}

/** Search common locations for a file, return the first match's directory */
function findProjectFile(projectRoot: string, filename: string, subdirs: string[]): string | null {
  // Check root first
  if (fs.existsSync(path.join(projectRoot, filename))) return projectRoot

  // Check common subdirectories
  for (const sub of subdirs) {
    const dir = path.join(projectRoot, sub)
    if (fs.existsSync(path.join(dir, filename))) return dir
  }

  return null
}

/**
 * Run type checker and framework checks to verify a phase's output.
 * Searches common project structures for tsconfig.json and manage.py.
 */
export function runVerification(projectRoot: string, nodePath?: string): VerificationResult {
  const results: string[] = []
  let allPassed = true

  // TypeScript type check — search common locations
  const tscDir = findProjectFile(projectRoot, 'tsconfig.json', ['frontend', 'client', 'src', 'app'])
  if (tscDir) {
    try {
      execSync('npx tsc --noEmit 2>&1', {
        cwd: tscDir,
        encoding: 'utf-8',
        timeout: 60000,
        env: nodeEnv(nodePath) as NodeJS.ProcessEnv,
      })
      results.push('TypeScript: OK')
    } catch (err: any) {
      const errOutput = err.stdout ?? err.message ?? ''
      const errorCount = (errOutput.match(/error TS/g) || []).length
      results.push(`TypeScript: ${errorCount} error(s)`)
      allPassed = false
    }
  }

  // Django system check — search common locations
  const djangoDir = findProjectFile(projectRoot, 'manage.py', ['backend', 'server', 'api'])
  if (djangoDir) {
    try {
      execSync('python manage.py check 2>&1', {
        cwd: djangoDir,
        encoding: 'utf-8',
        timeout: 30000,
      })
      results.push('Django check: OK')
    } catch {
      results.push('Django check: errors found')
      allPassed = false
    }
  }

  return {
    passed: allPassed,
    summary: results.join(', '),
    output: results.join('\n'),
  }
}
