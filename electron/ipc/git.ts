import { ipcMain, type BrowserWindow } from 'electron'
import type { GitManager } from '../../server/services/git.js'
import type { ProjectManager } from '../../server/services/projects.js'
import {
  GIT_STATUS, GIT_CHANGED_FILES, GIT_DIFF,
  GIT_CREATE_CHECKPOINT, GIT_GENERATE_MESSAGE, GIT_HISTORY,
  GIT_LIST_VERSIONS, GIT_CREATE_VERSION, GIT_SWITCH_VERSION, GIT_APPLY_VERSION,
  GIT_SYNC, GIT_SYNC_STATUS,
  GIT_CONFLICTS, GIT_RESOLVE_CONFLICT,
  GIT_INIT,
  GIT_ON_STATUS_CHANGE,
} from './channels.js'

export function setupGitIPC(
  getWindow: () => BrowserWindow | null,
  gitManager: GitManager,
  projectManager: ProjectManager,
) {
  function getPath(): string {
    const p = projectManager.getActivePath()
    if (!p) throw new Error('No active project')
    return p
  }

  /** Guard: check repo is initialized before running git commands. */
  async function requireRepo(): Promise<string> {
    const p = getPath()
    const status = await gitManager.getStatus(p)
    if (!status.initialized) throw new Error('Not a git repository')
    return p
  }

  // Debounced status change push
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  gitManager.onStatusChange(async (projectPath) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        const status = await gitManager.getStatus(projectPath)
        getWindow()?.webContents.send(GIT_ON_STATUS_CHANGE, status)
      } catch { /* ignore */ }
    }, 500)
  })

  // ── Status ──

  ipcMain.handle(GIT_STATUS, async () => {
    return gitManager.getStatus(getPath())
  })

  ipcMain.handle(GIT_CHANGED_FILES, async () => {
    const p = await requireRepo()
    return gitManager.getChangedFiles(p)
  })

  ipcMain.handle(GIT_DIFF, async (_e, data: { path: string }) => {
    const p = await requireRepo()
    return gitManager.getDiff(p, data.path)
  })

  // ── Commits ──

  ipcMain.handle(GIT_CREATE_CHECKPOINT, async (_e, data: { message: string; files?: string[] }) => {
    const p = await requireRepo()
    return gitManager.commit(p, data.message, data.files)
  })

  ipcMain.handle(GIT_GENERATE_MESSAGE, async () => {
    const p = await requireRepo()
    return gitManager.generateMessage(p)
  })

  ipcMain.handle(GIT_HISTORY, async (_e, data?: { limit?: number }) => {
    const p = await requireRepo()
    return gitManager.getHistory(p, data?.limit)
  })

  // ── Branches ──

  ipcMain.handle(GIT_LIST_VERSIONS, async () => {
    const p = await requireRepo()
    return gitManager.listBranches(p)
  })

  ipcMain.handle(GIT_CREATE_VERSION, async (_e, data: { name: string }) => {
    const p = await requireRepo()
    return gitManager.createBranch(p, data.name)
  })

  ipcMain.handle(GIT_SWITCH_VERSION, async (_e, data: { name: string }) => {
    const p = await requireRepo()
    return gitManager.switchBranch(p, data.name)
  })

  ipcMain.handle(GIT_APPLY_VERSION, async (_e, data: { source: string; target: string }) => {
    const p = await requireRepo()
    return gitManager.merge(p, data.source, data.target)
  })

  // ── Push / Pull ──

  ipcMain.handle(GIT_SYNC, async () => {
    const p = await requireRepo()
    return gitManager.sync(p)
  })

  ipcMain.handle(GIT_SYNC_STATUS, async () => {
    const p = await requireRepo()
    return gitManager.getSyncStatus(p)
  })

  // ── Conflicts ──

  ipcMain.handle(GIT_CONFLICTS, async () => {
    const p = await requireRepo()
    return gitManager.getConflicts(p)
  })

  ipcMain.handle(GIT_RESOLVE_CONFLICT, async (_e, data: { path: string; resolution: 'ours' | 'theirs' }) => {
    const p = await requireRepo()
    return gitManager.resolveConflict(p, data.path, data.resolution)
  })

  // ── Init ──

  ipcMain.handle(GIT_INIT, async () => {
    return gitManager.init(getPath())
  })
}
