import { create } from 'zustand'
import type { FileNode } from '@/types'

export interface OpenTab {
  path: string
  content: string | null
  /** Content as loaded from disk — used to detect dirty state */
  originalContent: string | null
  language: string
  error?: string | null
}

interface FileState {
  tree: FileNode | null
  activeTab: string | null
  openTabs: OpenTab[]
  changedFiles: Set<string>

  setTree: (tree: FileNode) => void
  openFile: (path: string) => void
  setTabContent: (path: string, content: string, language: string) => void
  updateTabContent: (path: string, content: string) => void
  setTabError: (path: string, error: string) => void
  closeTab: (path: string) => void
  closeOtherTabs: (path: string) => void
  closeAllTabs: () => void
  selectTab: (path: string) => void
  renameTab: (oldPath: string, newPath: string) => void
  markChanged: (paths: string[]) => void
  markSaved: (path: string) => void
  clearChanged: () => void
  isDirty: (path: string) => boolean

  // Legacy compat
  selectFile: (path: string | null) => void
}

export const useFileStore = create<FileState>((set, get) => ({
  tree: null,
  activeTab: null,
  openTabs: [],
  changedFiles: new Set(),

  setTree: (tree) => set({ tree }),

  openFile: (path) => {
    const { openTabs } = get()
    const exists = openTabs.find((t) => t.path === path)
    if (!exists) {
      set({
        openTabs: [...openTabs, { path, content: null, originalContent: null, language: 'text' }],
        activeTab: path,
      })
    } else {
      set({ activeTab: path })
    }
  },

  /** Set content from disk (initial load or after save) — resets dirty state */
  setTabContent: (path, content, language) => {
    set((s) => {
      const next = new Set(s.changedFiles)
      next.delete(path)
      return {
        openTabs: s.openTabs.map((t) =>
          t.path === path ? { ...t, content, originalContent: content, language, error: null } : t,
        ),
        changedFiles: next,
      }
    })
  },

  /** Update content from user edits in the editor */
  updateTabContent: (path, content) => {
    set((s) => {
      const tab = s.openTabs.find((t) => t.path === path)
      if (!tab) return s

      const isDirty = content !== tab.originalContent
      const next = new Set(s.changedFiles)
      if (isDirty) next.add(path)
      else next.delete(path)

      return {
        openTabs: s.openTabs.map((t) =>
          t.path === path ? { ...t, content } : t,
        ),
        changedFiles: next,
      }
    })
  },

  setTabError: (path, error) => {
    set((s) => ({
      openTabs: s.openTabs.map((t) =>
        t.path === path ? { ...t, error } : t,
      ),
    }))
  },

  closeTab: (path) => {
    const { openTabs, activeTab } = get()
    const idx = openTabs.findIndex((t) => t.path === path)
    const next = openTabs.filter((t) => t.path !== path)

    let newActive = activeTab
    if (activeTab === path) {
      if (next.length === 0) {
        newActive = null
      } else if (idx >= next.length) {
        newActive = next[next.length - 1].path
      } else {
        newActive = next[idx].path
      }
    }

    set((s) => {
      const changed = new Set(s.changedFiles)
      changed.delete(path)
      return { openTabs: next, activeTab: newActive, changedFiles: changed }
    })
  },

  closeOtherTabs: (path) => {
    const { openTabs } = get()
    const kept = openTabs.filter((t) => t.path === path)
    set((s) => {
      const changed = new Set<string>()
      if (s.changedFiles.has(path)) changed.add(path)
      return { openTabs: kept, activeTab: path, changedFiles: changed }
    })
  },

  closeAllTabs: () => {
    set({ openTabs: [], activeTab: null, changedFiles: new Set() })
  },

  selectTab: (path) => set({ activeTab: path }),

  renameTab: (oldPath, newPath) => {
    set((s) => ({
      openTabs: s.openTabs.map((t) =>
        t.path === oldPath ? { ...t, path: newPath } : t,
      ),
      activeTab: s.activeTab === oldPath ? newPath : s.activeTab,
    }))
  },

  markChanged: (paths) =>
    set((s) => {
      const next = new Set(s.changedFiles)
      paths.forEach((p) => next.add(p))
      return { changedFiles: next }
    }),

  /** After a successful save — sync originalContent and clear dirty */
  markSaved: (path) => {
    set((s) => {
      const next = new Set(s.changedFiles)
      next.delete(path)
      return {
        openTabs: s.openTabs.map((t) =>
          t.path === path ? { ...t, originalContent: t.content } : t,
        ),
        changedFiles: next,
      }
    })
  },

  clearChanged: () => set({ changedFiles: new Set() }),

  isDirty: (path) => {
    const tab = get().openTabs.find((t) => t.path === path)
    if (!tab) return false
    return tab.content !== tab.originalContent
  },

  // Legacy — used by file-browser's onClose and tree selection
  selectFile: (path) => {
    if (path) {
      get().openFile(path)
    } else {
      set({ activeTab: null })
    }
  },
}))
