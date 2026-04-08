import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export interface NodeInstallation {
  label: string
  path: string
  version: string
}

function getNodeVersion(nodeBinary: string): string | null {
  try {
    return execSync(`"${nodeBinary}" --version`, { timeout: 5000, encoding: 'utf-8' }).trim()
  } catch {
    return null
  }
}

function findNvmVersions(): NodeInstallation[] {
  const nvmDir = process.env.NVM_DIR || path.join(os.homedir(), '.nvm')
  const versionsDir = path.join(nvmDir, 'versions', 'node')
  if (!fs.existsSync(versionsDir)) return []

  const results: NodeInstallation[] = []
  try {
    const dirs = fs.readdirSync(versionsDir).filter((d) => d.startsWith('v'))
    for (const dir of dirs) {
      const nodeBin = path.join(versionsDir, dir, 'bin', 'node')
      if (fs.existsSync(nodeBin)) {
        results.push({
          label: `nvm ${dir}`,
          path: nodeBin,
          version: dir,
        })
      }
    }
  } catch { /* ignore */ }
  return results
}

function findFnmVersions(): NodeInstallation[] {
  const fnmDir = process.env.FNM_DIR || path.join(os.homedir(), '.local', 'share', 'fnm')
  const versionsDir = path.join(fnmDir, 'node-versions')
  if (!fs.existsSync(versionsDir)) return []

  const results: NodeInstallation[] = []
  try {
    const dirs = fs.readdirSync(versionsDir).filter((d) => d.startsWith('v'))
    for (const dir of dirs) {
      const nodeBin = path.join(versionsDir, dir, 'installation', 'bin', 'node')
      if (fs.existsSync(nodeBin)) {
        results.push({
          label: `fnm ${dir}`,
          path: nodeBin,
          version: dir,
        })
      }
    }
  } catch { /* ignore */ }
  return results
}

function findSystemNode(): NodeInstallation | null {
  // Check common system paths
  const candidates = [
    '/usr/local/bin/node',
    '/usr/bin/node',
    '/opt/homebrew/bin/node',
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const version = getNodeVersion(candidate)
      if (version) {
        const label = candidate.includes('homebrew') ? `Homebrew (${version})` : `System (${version})`
        return { label, path: candidate, version }
      }
    }
  }
  return null
}

function findWhichNode(): NodeInstallation | null {
  try {
    const nodePath = execSync('which node', { timeout: 5000, encoding: 'utf-8' }).trim()
    if (nodePath && fs.existsSync(nodePath)) {
      const version = getNodeVersion(nodePath)
      if (version) {
        return { label: `Default (${version})`, path: nodePath, version }
      }
    }
  } catch { /* ignore */ }
  return null
}

export function detectNodeInstallations(): NodeInstallation[] {
  const seen = new Set<string>()
  const results: NodeInstallation[] = []

  const add = (install: NodeInstallation) => {
    const resolved = fs.realpathSync(install.path)
    if (!seen.has(resolved)) {
      seen.add(resolved)
      results.push(install)
    }
  }

  // Default (what's on PATH) first
  const defaultNode = findWhichNode()
  if (defaultNode) add(defaultNode)

  // nvm versions
  for (const n of findNvmVersions()) add(n)

  // fnm versions
  for (const n of findFnmVersions()) add(n)

  // System-installed node
  const systemNode = findSystemNode()
  if (systemNode) add(systemNode)

  return results
}
