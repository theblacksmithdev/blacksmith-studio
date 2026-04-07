import { ipcMain } from 'electron'
import { spawn, execSync } from 'node:child_process'
import { SETUP_CHECK, SETUP_INSTALL_CLAUDE } from './channels.js'

export interface NodeStatus {
  installed: boolean
  version?: string
  outdated?: boolean
}

export interface SetupStatus {
  node: NodeStatus
  claude: { installed: boolean; version?: string }
  auth: { authenticated: boolean }
}

function checkNode(): NodeStatus {
  try {
    const version = execSync('node --version', { timeout: 5000 }).toString().trim()
    const major = parseInt(version.replace('v', '').split('.')[0], 10)
    if (major >= 18) return { installed: true, version }
    return { installed: false, version, outdated: true }
  } catch {
    return { installed: false }
  }
}

function checkClaude(): Promise<{ installed: boolean; version?: string }> {
  return new Promise((resolve) => {
    try {
      const version = execSync('claude --version', { timeout: 10000 }).toString().trim()
      resolve({ installed: true, version })
    } catch {
      resolve({ installed: false })
    }
  })
}

function checkAuth(): Promise<{ authenticated: boolean }> {
  return new Promise((resolve) => {
    const proc = spawn('claude', ['-p', 'ping', '--max-turns', '0', '--output-format', 'json'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 15000,
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('close', (code) => {
      const hasAuthError = stderr.toLowerCase().includes('not authenticated') ||
        stderr.toLowerCase().includes('api key') ||
        stderr.toLowerCase().includes('login') ||
        stderr.toLowerCase().includes('unauthorized')
      resolve({ authenticated: code === 0 || !hasAuthError })
    })

    proc.on('error', () => resolve({ authenticated: false }))
  })
}

function installClaude(): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['install', '-g', '@anthropic-ai/claude-code'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000,
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('close', (code) => {
      resolve(code === 0 ? { success: true } : { success: false, error: stderr.trim() || 'Installation failed' })
    })

    proc.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
  })
}

export function setupSetupIPC() {
  ipcMain.handle(SETUP_CHECK, async (): Promise<SetupStatus> => {
    const node = checkNode()
    const claude = await checkClaude()

    // If Claude is installed, Node is guaranteed available (Claude requires Node 18+)
    // Even if the default `node` in PATH is old, Claude's runtime works
    if (!node.installed && claude.installed) {
      node.installed = true
      node.version = node.version ? `${node.version} (upgrade recommended)` : 'Available via Claude'
    }

    const auth = claude.installed ? await checkAuth() : { authenticated: false }
    return { node, claude, auth }
  })

  ipcMain.handle(SETUP_INSTALL_CLAUDE, async () => {
    return installClaude()
  })
}
