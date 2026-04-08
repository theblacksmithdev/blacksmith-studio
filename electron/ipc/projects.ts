import { ipcMain, type BrowserWindow } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SettingsManager } from '../../server/services/settings.js'
import { nodeEnv, nodeCmd } from '../../server/services/node-env.js'
import {
  PROJECTS_LIST, PROJECTS_GET_ACTIVE, PROJECTS_REGISTER, PROJECTS_CREATE, PROJECTS_CLONE,
  PROJECTS_ACTIVATE, PROJECTS_RENAME, PROJECTS_REMOVE, PROJECTS_VALIDATE,
  BROWSE_LIST,
  PROJECTS_ON_CREATE_OUTPUT, PROJECTS_ON_CREATE_DONE, PROJECTS_ON_CREATE_ERROR,
} from './channels.js'

export function setupProjectsIPC(getWindow: () => BrowserWindow | null, projectManager: ProjectManager, settingsManager: SettingsManager) {
  ipcMain.handle(PROJECTS_LIST, () => {
    return projectManager.list()
  })

  ipcMain.handle(PROJECTS_GET_ACTIVE, () => {
    return projectManager.getActive() || null
  })

  ipcMain.handle(PROJECTS_REGISTER, (_e, data: { path: string; name?: string }) => {
    if (!data.path) throw new Error('path is required')
    return projectManager.register(data.path, data.name)
  })

  ipcMain.handle(PROJECTS_ACTIVATE, (_e, data: { id: string }) => {
    const project = projectManager.setActive(data.id)
    if (!project) {
      console.warn(`[ipc] projects:activate — project not found: ${data.id}`)
      throw new Error('Project not found')
    }
    return project
  })

  ipcMain.handle(PROJECTS_RENAME, (_e, data: { id: string; name: string }) => {
    const project = projectManager.rename(data.id, data.name)
    if (!project) throw new Error('Project not found')
    return project
  })

  ipcMain.handle(PROJECTS_REMOVE, async (_e, data: { id: string; hard?: boolean }) => {
    const project = projectManager.get(data.id)
    if (!project) throw new Error('Project not found')

    if (data.hard && project.path) {
      const projectPath = path.resolve(project.path)
      if (fs.existsSync(projectPath)) {
        const { execSync } = await import('node:child_process')
        execSync(`rm -rf ${JSON.stringify(projectPath)}`, { timeout: 30000 })
      }
    }

    projectManager.remove(data.id)
    return null
  })

  ipcMain.handle(PROJECTS_VALIDATE, (_e, data: { path: string }) => {
    if (!data.path) throw new Error('path is required')

    const absPath = path.resolve(data.path)
    if (!fs.existsSync(absPath)) throw new Error('Directory does not exist')
    if (!fs.statSync(absPath).isDirectory()) throw new Error('Path is not a directory')

    const configPath = path.join(absPath, 'blacksmith.config.json')
    let configName: string | null = null
    let isBlacksmithProject = false

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        configName = config.name || null
        isBlacksmithProject = true
      } catch { /* ignore */ }
    }

    return {
      valid: true,
      path: absPath,
      name: configName || path.basename(absPath),
      isBlacksmithProject,
      hasPackageJson: fs.existsSync(path.join(absPath, 'package.json')),
      hasGit: fs.existsSync(path.join(absPath, '.git')),
    }
  })

  ipcMain.handle(PROJECTS_CREATE, (_e, data: {
    name: string; parentPath: string;
    backendPort?: number; frontendPort?: number; theme?: string; ai?: boolean
  }) => {
    if (!data.name || !data.parentPath) throw new Error('name and parentPath are required')

    const absParent = path.resolve(data.parentPath)
    if (!fs.existsSync(absParent) || !fs.statSync(absParent).isDirectory()) {
      throw new Error('parentPath is not a valid directory')
    }

    const projectDir = path.join(absParent, data.name)
    if (fs.existsSync(projectDir)) {
      throw new Error(`Directory "${data.name}" already exists in ${absParent}`)
    }

    const args = [
      'init', data.name,
      '-b', String(data.backendPort || 8000),
      '-f', String(data.frontendPort || 5173),
      '-t', data.theme || 'default',
    ]
    if (data.ai) args.push('--ai')

    const win = getWindow()
    const projectId = projectManager.getActiveId()
    const nodePath = projectId ? (settingsManager.get(projectId, 'runner.nodePath') || undefined) : undefined

    // Run blacksmith via npx to ensure it uses a compatible Node version.
    // CI=true disables interactive prompts (auto-accepts defaults).
    const proc = spawn(nodeCmd('npx', nodePath), ['blacksmith-cli', ...args], {
      cwd: absParent,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: nodeEnv(nodePath, { FORCE_COLOR: '0', CI: '1' }),
      shell: true,
    })

    proc.stdin.end()

    const stderrLines: string[] = []

    const sendLine = (line: string) => {
      win?.webContents.send(PROJECTS_ON_CREATE_OUTPUT, { line })
    }

    proc.stdout.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(Boolean)
      lines.forEach(sendLine)
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(Boolean)
      lines.forEach((line) => {
        stderrLines.push(line)
        sendLine(line)
      })
    })

    proc.on('close', (code: number) => {
      if (code !== 0) {
        const lastErrors = stderrLines.slice(-10).join('\n')
        const error = lastErrors || `Process exited with code ${code}`
        win?.webContents.send(PROJECTS_ON_CREATE_ERROR, { error })
        return
      }
      const project = projectManager.register(projectDir, data.name)
      win?.webContents.send(PROJECTS_ON_CREATE_DONE, { project })
    })

    proc.on('error', (err: Error) => {
      win?.webContents.send(PROJECTS_ON_CREATE_ERROR, { error: err.message })
    })

    // Return immediately — client listens for stream events
    return { started: true }
  })

  // Clone from Git
  ipcMain.handle(PROJECTS_CLONE, (_e, data: {
    gitUrl: string; parentPath: string; name?: string
  }) => {
    if (!data.gitUrl || !data.parentPath) throw new Error('gitUrl and parentPath are required')

    const absParent = path.resolve(data.parentPath)
    if (!fs.existsSync(absParent) || !fs.statSync(absParent).isDirectory()) {
      throw new Error('parentPath is not a valid directory')
    }

    // Derive project name from URL if not provided
    const repoName = data.name || data.gitUrl
      .replace(/\.git$/, '')
      .split('/')
      .pop()
      ?.replace(/[^a-zA-Z0-9_-]/g, '') || 'cloned-project'

    const projectDir = path.join(absParent, repoName)
    if (fs.existsSync(projectDir)) {
      throw new Error(`Directory "${repoName}" already exists in ${absParent}`)
    }

    const win = getWindow()

    const proc = spawn('git', ['clone', '--progress', data.gitUrl, repoName], {
      cwd: absParent,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    })

    proc.stdin.end()

    const stderrLines: string[] = []

    const sendLine = (line: string) => {
      win?.webContents.send(PROJECTS_ON_CREATE_OUTPUT, { line })
    }

    proc.stdout.on('data', (chunk: Buffer) => {
      chunk.toString().split('\n').filter(Boolean).forEach(sendLine)
    })

    // git clone sends progress to stderr
    proc.stderr.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split(/\r?\n/).filter(Boolean)
      lines.forEach((line) => {
        stderrLines.push(line)
        sendLine(line)
      })
    })

    proc.on('close', (code: number) => {
      if (code !== 0) {
        const lastErrors = stderrLines.slice(-10).join('\n')
        const error = lastErrors || `git clone exited with code ${code}`
        win?.webContents.send(PROJECTS_ON_CREATE_ERROR, { error })
        return
      }
      const project = projectManager.register(projectDir, repoName)
      win?.webContents.send(PROJECTS_ON_CREATE_DONE, { project })
    })

    proc.on('error', (err: Error) => {
      win?.webContents.send(PROJECTS_ON_CREATE_ERROR, { error: err.message })
    })

    return { started: true }
  })

  // Browse directories
  ipcMain.handle(BROWSE_LIST, (_e, data?: { path?: string }) => {
    const requestedPath = data?.path || os.homedir()
    const absPath = path.resolve(requestedPath)

    if (!fs.existsSync(absPath)) throw new Error('Path does not exist')
    if (!fs.statSync(absPath).isDirectory()) throw new Error('Path is not a directory')

    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(absPath, { withFileTypes: true })
    } catch {
      throw new Error('Cannot read directory')
    }

    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => ({ name: e.name, path: path.join(absPath, e.name) }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      current: absPath,
      parent: path.dirname(absPath),
      dirs,
      isProject: fs.existsSync(path.join(absPath, 'blacksmith.config.json')) ||
        fs.existsSync(path.join(absPath, 'package.json')) ||
        fs.existsSync(path.join(absPath, '.git')),
      isBlacksmithProject: fs.existsSync(path.join(absPath, 'blacksmith.config.json')),
    }
  })
}
