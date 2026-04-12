import { useNavigate } from 'react-router-dom'
import { useFileStore } from '@/stores/file-store'
import { useProjectStore } from '@/stores/project-store'
import { useFiles } from '@/hooks/use-files'
import { api } from '@/api'
import { newChatPath, agentsNewPath } from '@/router/paths'

interface UseFileActionsOptions {
  filePath: string
  isDirectory: boolean
  onClose: () => void
}

function getName(filePath: string) {
  return filePath.split('/').pop() || filePath
}

export function useFileActions({ filePath, isDirectory, onClose }: UseFileActionsOptions) {
  const navigate = useNavigate()
  const { closeTab, closeOtherTabs, closeAllTabs, renameTab } = useFileStore()
  const { fetchFileTree } = useFiles()
  const project = useProjectStore((s) => s.activeProject)
  const fullPath = project ? `${project.path}/${filePath}` : filePath
  const label = isDirectory ? 'folder' : 'file'
  const fileRef = `\`${filePath}\``

  /** Run an action and dismiss the menu */
  const run = (fn: () => void) => {
    onClose()
    fn()
  }

  // ── Tab actions ──
  const close = () => run(() => closeTab(filePath))
  const closeOthers = () => run(() => closeOtherTabs(filePath))
  const closeAll = () => run(() => closeAllTabs())

  // ── File operations ──
  const rename = async (newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === getName(filePath)) return false
    try {
      const { newPath } = await api.files.rename(filePath, trimmed)
      if (!isDirectory) renameTab(filePath, newPath)
      fetchFileTree()
      onClose()
      return true
    } catch {
      return false
    }
  }

  const deleteFile = async () => {
    try {
      await api.files.delete(filePath)
      if (!isDirectory) closeTab(filePath)
      fetchFileTree()
    } catch { /* ignore */ }
    onClose()
  }

  // ── Clipboard ──
  const copyPath = () => run(() => navigator.clipboard.writeText(filePath))
  const copyFullPath = () => run(() => navigator.clipboard.writeText(fullPath))

  // ── AI ──
  const addToChat = () => {
    if (!project) return
    run(() => navigate(newChatPath(project.id), { state: { initialPrompt: `Review the ${label} ${fileRef}` } }))
  }

  const addToAgentTeam = () => {
    if (!project) return
    run(() => navigate(agentsNewPath(project.id), { state: { initialPrompt: `Work on the ${label} ${fileRef}` } }))
  }

  // ── External ──
  const revealInFinder = () => run(() => api.files.reveal(filePath))
  const openInEditor = (command?: string) => run(() => api.files.openInEditor(filePath, command))

  return {
    project,
    label,
    fileName: getName(filePath),

    // Tab
    close,
    closeOthers,
    closeAll,

    // File ops
    rename,
    deleteFile,

    // Clipboard
    copyPath,
    copyFullPath,

    // AI
    addToChat,
    addToAgentTeam,

    // External
    revealInFinder,
    openInEditor,
  }
}
