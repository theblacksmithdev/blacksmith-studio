import { useState } from 'react'
import { useGitBranches, useGit } from '@/hooks/use-git'

export function useBranchActions(onClose: () => void) {
  const { data: branches, isLoading } = useGitBranches()
  const { createBranch, switchBranch, merge, invalidateAll } = useGit()

  const [error, setError] = useState<string | null>(null)

  const current = branches?.find((b) => b.current) ?? null
  const others = branches?.filter((b) => !b.current) ?? []

  const checkout = async (name: string) => {
    setError(null)
    try {
      await switchBranch.mutateAsync({ name })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch branch')
    }
  }

  const create = async (name: string) => {
    setError(null)
    try {
      await createBranch.mutateAsync({ name })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch')
    }
  }

  const mergeInto = async (source: string) => {
    if (!current) return null
    setError(null)
    try {
      const result = await merge.mutateAsync({ source, target: current.name })
      if (result.success) {
        invalidateAll()
        return { success: true, conflicts: [] as string[] }
      }
      return { success: false, conflicts: result.conflicts }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed')
      return null
    }
  }

  return {
    branches: { current, others, isLoading },
    actions: { checkout, create, mergeInto },
    pending: {
      switching: switchBranch.isPending,
      creating: createBranch.isPending,
      merging: merge.isPending,
    },
    error,
    clearError: () => setError(null),
  }
}
