import { useState, useEffect } from 'react'
import type { GitChangedFile } from '@/api/types'
import { useGit } from '@/hooks/use-git'

export function useCommit(files: GitChangedFile[], onCommitted: () => void) {
  const { commit, generateMessage } = useGit()
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(files.map((f) => f.path)))

  // Auto-generate message on mount
  useEffect(() => {
    generateMessage.mutate(undefined, {
      onSuccess: (msg) => setMessage(msg),
    })
  }, [])

  const toggleFile = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === files.length) setSelected(new Set())
    else setSelected(new Set(files.map((f) => f.path)))
  }

  const handleCommit = () => {
    if (!message.trim() || selected.size === 0) return
    const selectedFiles = selected.size === files.length ? undefined : Array.from(selected)
    commit.mutate(
      { message: message.trim(), files: selectedFiles },
      { onSuccess: onCommitted },
    )
  }

  const regenerateMessage = () => {
    generateMessage.mutate(undefined, {
      onSuccess: (msg) => setMessage(msg),
    })
  }

  return {
    message,
    setMessage,
    selected,
    toggleFile,
    toggleAll,
    handleCommit,
    regenerateMessage,
    isCommitting: commit.isPending,
    isGenerating: generateMessage.isPending,
    canCommit: !!message.trim() && selected.size > 0 && !commit.isPending,
  }
}
