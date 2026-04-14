import { useState } from 'react'
import { useGitCommit, useGitGenerateMessage, useGitChangedFilesQuery } from '@/api/hooks/git'

export function useCommit(onCommitted: () => void) {
  const commit = useGitCommit()
  const generateMessage = useGitGenerateMessage()
  const changedFiles = useGitChangedFilesQuery()

  const files = changedFiles.data
  const [message, setMessage] = useState('')
  /** When true, ALL server files are selected (including unloaded ones) */
  const [allSelected, setAllSelected] = useState(true)
  /** Tracks individual deselections — only used when allSelected is false */
  const [deselected, setDeselected] = useState<Set<string>>(new Set())

  const selectedCount = allSelected
    ? changedFiles.total - deselected.size
    : files.filter((f) => !deselected.has(f.path)).length

  const isFileSelected = (path: string) => {
    if (allSelected) return !deselected.has(path)
    return !deselected.has(path)
  }

  const toggleFile = (path: string) => {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected && deselected.size === 0) {
      // Everything is selected → deselect all
      setAllSelected(false)
      setDeselected(new Set(files.map((f) => f.path)))
    } else {
      // Some or none selected → select all
      setAllSelected(true)
      setDeselected(new Set())
    }
  }

  const handleCommit = () => {
    if (!message.trim() || selectedCount === 0) return

    // If all selected (no deselections), pass undefined to commit everything
    if (allSelected && deselected.size === 0) {
      commit.mutate(
        { message: message.trim(), files: undefined },
        { onSuccess: onCommitted },
      )
    } else {
      // Build explicit list of selected files from loaded data
      const selectedFiles = files
        .filter((f) => !deselected.has(f.path))
        .map((f) => f.path)
      commit.mutate(
        { message: message.trim(), files: selectedFiles },
        { onSuccess: onCommitted },
      )
    }
  }

  const regenerateMessage = () => {
    generateMessage.mutate(undefined, {
      onSuccess: (msg) => setMessage(msg),
    })
  }

  return {
    files,
    total: changedFiles.total,
    selectedCount,
    isFileSelected,
    isLoadingFiles: changedFiles.isLoading,
    hasNextPage: changedFiles.hasNextPage,
    isFetchingNextPage: changedFiles.isFetchingNextPage,
    fetchNextPage: changedFiles.fetchNextPage,
    message,
    setMessage,
    toggleFile,
    toggleAll,
    handleCommit,
    regenerateMessage,
    isCommitting: commit.isPending,
    isGenerating: generateMessage.isPending,
    canCommit: !!message.trim() && selectedCount > 0 && !commit.isPending,
    isAllSelected: allSelected && deselected.size === 0,
  }
}
