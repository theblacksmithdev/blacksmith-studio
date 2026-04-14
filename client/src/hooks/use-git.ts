import { useEffect } from 'react'
import { api } from '@/api'
import { useGitStore } from '@/stores/git-store'
import { useActiveProjectId } from '@/api/hooks/_shared'

/**
 * Initializes IPC listener for git status changes and syncs initial state.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const projectId = useActiveProjectId()

  useEffect(() => {
    if (!projectId) return

    api.git.status(projectId).then((status) => {
      useGitStore.getState().setStatus(status as any)
    }).catch(() => {})

    const unsub = api.git.onStatusChange((data) => {
      useGitStore.getState().setStatus(data as any)
    })

    return () => unsub()
  }, [projectId])
}
