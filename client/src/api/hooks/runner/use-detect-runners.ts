import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Auto-detects runner services in the project and seeds configs.
 * Invalidates the configs list on success.
 */
export function useDetectRunners() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: () => api.runner.detectRunners(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
    },
  })
}
