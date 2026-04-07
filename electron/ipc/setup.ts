import { ipcMain } from 'electron'
import { spawn, execSync } from 'node:child_process'
import { SETUP_CHECK, SETUP_INSTALL_CLAUDE } from './channels.js'

export interface SetupStatus {
  node: { installed: boolean; version?: string }
  claude: { installed: boolean; version?: string }
  auth: { authenticated: boolean }
}

// On macOS, apps launched from Finder don't inherit the user's shell PATH.
// Run through the user's shell to get the full PATH.
const USER_SHELL = process.env.SHELL || '/bin/zsh'

function checkNode(): { installed: boolean; version?: string } {
  try {
    const version = execSync('node --version', { timeout: 5000, shell: USER_SHELL }).toString().trim()
    const major = parseInt(version.replace('v', '').split('.')[0], 10)
    return { installed: major >= 18, version }
  } catch {
    return { installed: false }
  }
}

function checkClaude(): Promise<{ installed: boolean; version?: string }> {
  return new Promise((resolve) => {
    const proc = spawn('claude', ['--version'], { stdio: ['ignore', 'pipe', 'pipe'], shell: true })
    let stdout = ''
    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.on('close', (code) => {
      resolve(code === 0 ? { installed: true, version: stdout.trim() } : { installed: false })
    })
    proc.on('error', () => resolve({ installed: false }))
  })
}

function checkAuth(): Promise<{ authenticated: boolean }> {
  return new Promise((resolve) => {
    const proc = spawn('claude', ['-p', 'ping', '--max-turns', '0', '--output-format', 'json'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10000,
      shell: true,
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
      shell: true,
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
    const auth = claude.installed ? await checkAuth() : { authenticated: false }
    return { node, claude, auth }
  })

  ipcMain.handle(SETUP_INSTALL_CLAUDE, async () => {
    return installClaude()
  })
}
