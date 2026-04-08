import simpleGit, { type SimpleGit, type StatusResult, type DefaultLogFields, type ListLogLine } from 'simple-git'
import { watch, type FSWatcher } from 'node:fs'
import path from 'node:path'

/* ── Types ── */

export interface GitStatus {
  initialized: boolean
  branch: string
  changedCount: number
  syncStatus: 'synced' | 'ahead' | 'behind' | 'diverged' | 'local-only' | 'unknown'
  ahead: number
  behind: number
}

export interface ChangedFile {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  staged: boolean
}

export interface CommitEntry {
  hash: string
  message: string
  author: string
  date: string
  filesChanged: number
}

export interface CommitDetail {
  hash: string
  message: string
  author: string
  date: string
  files: { path: string; status: string; insertions: number; deletions: number }[]
  diff: string
}

export interface BranchInfo {
  name: string
  current: boolean
  label: string
}

export interface SyncStatus {
  ahead: number
  behind: number
  hasRemote: boolean
}

export interface ConflictFile {
  path: string
}

/* ── GitManager ── */

export class GitManager {
  private watchers = new Map<string, FSWatcher>()
  private statusCallbacks: Array<(projectPath: string) => void> = []

  private git(projectPath: string): SimpleGit {
    return simpleGit(projectPath)
  }

  /* ── Status ── */

  async getStatus(projectPath: string): Promise<GitStatus> {
    const git = this.git(projectPath)

    try {
      const isRepo = await git.checkIsRepo()
      if (!isRepo) return { initialized: false, branch: '', changedCount: 0, syncStatus: 'unknown', ahead: 0, behind: 0 }

      const status = await git.status()
      const syncStatus = await this.computeSyncStatus(git, status)

      return {
        initialized: true,
        branch: status.current ?? 'HEAD',
        changedCount: status.files.length,
        syncStatus: syncStatus.status,
        ahead: syncStatus.ahead,
        behind: syncStatus.behind,
      }
    } catch {
      return { initialized: false, branch: '', changedCount: 0, syncStatus: 'unknown', ahead: 0, behind: 0 }
    }
  }

  async getChangedFiles(projectPath: string): Promise<ChangedFile[]> {
    const git = this.git(projectPath)
    const status = await git.status()

    return status.files.map((f) => ({
      path: f.path,
      status: this.mapFileStatus(f.working_dir, f.index),
      staged: f.index !== ' ' && f.index !== '?',
    }))
  }

  async getDiff(projectPath: string, filePath: string): Promise<string> {
    const git = this.git(projectPath)
    const status = await git.status()
    const file = status.files.find((f) => f.path === filePath)

    if (!file) return ''

    // Untracked files — show full content as diff
    if (file.working_dir === '?' || file.index === '?') {
      try {
        const { readFile } = await import('node:fs/promises')
        const content = await readFile(path.join(projectPath, filePath), 'utf-8')
        return content.split('\n').map((l) => `+${l}`).join('\n')
      } catch {
        return ''
      }
    }

    // Staged changes
    if (file.index !== ' ') {
      return git.diff(['--cached', '--', filePath])
    }

    // Unstaged changes
    return git.diff(['--', filePath])
  }

  /* ── Commits ── */

  async commit(projectPath: string, message: string, files?: string[]): Promise<string> {
    const git = this.git(projectPath)

    if (files && files.length > 0) {
      await git.add(files)
    } else {
      await git.add('.')
    }

    const result = await git.commit(message)
    this.emitStatusChange(projectPath)
    return result.commit
  }

  async generateMessage(projectPath: string): Promise<string> {
    const git = this.git(projectPath)
    const status = await git.status()

    const parts: string[] = []
    const added = status.files.filter((f) => f.index === '?' || f.index === 'A' || f.working_dir === '?')
    const modified = status.files.filter((f) => f.index === 'M' || f.working_dir === 'M')
    const deleted = status.files.filter((f) => f.index === 'D' || f.working_dir === 'D')

    if (added.length) parts.push(`Add ${added.length} new file${added.length > 1 ? 's' : ''}`)
    if (modified.length) parts.push(`Update ${modified.length} file${modified.length > 1 ? 's' : ''}`)
    if (deleted.length) parts.push(`Remove ${deleted.length} file${deleted.length > 1 ? 's' : ''}`)

    return parts.join(', ') || 'Save changes'
  }

  async getHistory(projectPath: string, limit = 50): Promise<CommitEntry[]> {
    const git = this.git(projectPath)

    try {
      const log = await git.log({ maxCount: limit, '--stat': null } as any)

      return log.all.map((entry: DefaultLogFields & ListLogLine) => ({
        hash: entry.hash,
        message: entry.message,
        author: entry.author_name,
        date: entry.date,
        filesChanged: (entry as any).diff?.files?.length ?? 0,
      }))
    } catch {
      return []
    }
  }

  async getCommitDetail(projectPath: string, hash: string): Promise<CommitDetail> {
    const git = this.git(projectPath)
    const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf899d15f3f462b21'

    // Get commit metadata via git show
    const logRaw = await git.raw([
      'log', '-1', '--format=%H%n%s%n%an%n%aI', hash,
    ])
    const [fullHash, message, author, date] = logRaw.trim().split('\n')
    if (!fullHash) throw new Error(`Commit ${hash} not found`)

    // Check if commit has a parent
    const parentRaw = await git.raw(['rev-parse', `${hash}^`]).catch(() => '')
    const parent = parentRaw.trim() || EMPTY_TREE

    // Get the diff
    const diff = await git.raw(['diff', parent, hash])

    // Get file stats
    const numstatRaw = await git.raw(['diff', '--numstat', parent, hash])
    const files = numstatRaw.trim().split('\n').filter(Boolean).map((line) => {
      const [ins, del, ...pathParts] = line.split('\t')
      return {
        path: pathParts.join('\t'),
        status: 'modified',
        insertions: parseInt(ins) || 0,
        deletions: parseInt(del) || 0,
      }
    })

    return { hash: fullHash, message, author, date, files, diff }
  }

  /* ── Branches ── */

  async listBranches(projectPath: string): Promise<BranchInfo[]> {
    const git = this.git(projectPath)
    const summary = await git.branchLocal()

    return summary.all.map((name) => ({
      name,
      current: name === summary.current,
      label: name,
    }))
  }

  async createBranch(projectPath: string, name: string): Promise<void> {
    const git = this.git(projectPath)
    await git.checkoutLocalBranch(name)
    this.emitStatusChange(projectPath)
  }

  async switchBranch(projectPath: string, name: string): Promise<void> {
    const git = this.git(projectPath)
    await git.checkout(name)
    this.emitStatusChange(projectPath)
  }

  async merge(projectPath: string, source: string, target: string): Promise<{ success: boolean; conflicts: string[] }> {
    const git = this.git(projectPath)

    // Switch to target first
    await git.checkout(target)

    try {
      await git.merge([source])
      this.emitStatusChange(projectPath)
      return { success: true, conflicts: [] }
    } catch (err: any) {
      // Merge conflict
      const status = await git.status()
      const conflicts = status.conflicted
      return { success: false, conflicts }
    }
  }

  /* ── Push / Pull ── */

  async sync(projectPath: string): Promise<{ success: boolean; error?: string }> {
    const git = this.git(projectPath)

    try {
      const remotes = await git.getRemotes()
      if (remotes.length === 0) return { success: false, error: 'No remote configured' }

      await git.pull({ '--rebase': 'false' } as any)
      await git.push()
      this.emitStatusChange(projectPath)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  async getSyncStatus(projectPath: string): Promise<SyncStatus> {
    const git = this.git(projectPath)

    try {
      const remotes = await git.getRemotes()
      if (remotes.length === 0) return { ahead: 0, behind: 0, hasRemote: false }

      // Fetch to get up-to-date remote info (silently)
      try { await git.fetch() } catch { /* ignore fetch errors */ }

      const status = await git.status()
      return {
        ahead: status.ahead,
        behind: status.behind,
        hasRemote: true,
      }
    } catch {
      return { ahead: 0, behind: 0, hasRemote: false }
    }
  }

  /* ── Conflicts ── */

  async getConflicts(projectPath: string): Promise<ConflictFile[]> {
    const git = this.git(projectPath)
    const status = await git.status()
    return status.conflicted.map((p) => ({ path: p }))
  }

  async resolveConflict(projectPath: string, filePath: string, resolution: 'ours' | 'theirs'): Promise<void> {
    const git = this.git(projectPath)

    if (resolution === 'ours') {
      await git.raw(['checkout', '--ours', '--', filePath])
    } else {
      await git.raw(['checkout', '--theirs', '--', filePath])
    }

    await git.add(filePath)
    this.emitStatusChange(projectPath)
  }

  /* ── Init ── */

  async init(projectPath: string): Promise<void> {
    const git = this.git(projectPath)
    await git.init()
    // Create initial commit
    await git.add('.')
    await git.commit('Initial project setup')
    this.emitStatusChange(projectPath)
  }

  /* ── File Watching ── */

  onStatusChange(cb: (projectPath: string) => void) {
    this.statusCallbacks.push(cb)
  }

  startWatching(projectPath: string) {
    if (this.watchers.has(projectPath)) return

    try {
      const watcher = watch(projectPath, { recursive: true }, (_event, filename) => {
        if (!filename) return
        // Ignore .git directory changes and node_modules
        if (filename.startsWith('.git') || filename.includes('node_modules')) return
        this.emitStatusChange(projectPath)
      })

      this.watchers.set(projectPath, watcher)
    } catch {
      // Watch not supported or path invalid — silently skip
    }
  }

  stopWatching(projectPath: string) {
    const watcher = this.watchers.get(projectPath)
    if (watcher) {
      watcher.close()
      this.watchers.delete(projectPath)
    }
  }

  stopAllWatching() {
    for (const [, watcher] of this.watchers) watcher.close()
    this.watchers.clear()
  }

  /* ── Private ── */

  private emitStatusChange(projectPath: string) {
    for (const cb of this.statusCallbacks) cb(projectPath)
  }

  private async computeSyncStatus(git: SimpleGit, status: StatusResult): Promise<{ status: GitStatus['syncStatus']; ahead: number; behind: number }> {
    try {
      const remotes = await git.getRemotes()
      if (remotes.length === 0) return { status: 'local-only', ahead: 0, behind: 0 }

      if (status.ahead > 0 && status.behind > 0) return { status: 'diverged', ahead: status.ahead, behind: status.behind }
      if (status.ahead > 0) return { status: 'ahead', ahead: status.ahead, behind: 0 }
      if (status.behind > 0) return { status: 'behind', ahead: 0, behind: status.behind }
      return { status: 'synced', ahead: 0, behind: 0 }
    } catch {
      return { status: 'unknown', ahead: 0, behind: 0 }
    }
  }

  private mapFileStatus(workingDir: string, index: string): ChangedFile['status'] {
    if (workingDir === '?' || index === '?') return 'untracked'
    if (workingDir === 'D' || index === 'D') return 'deleted'
    if (workingDir === 'A' || index === 'A') return 'added'
    if (workingDir === 'R' || index === 'R') return 'renamed'
    return 'modified'
  }
}
