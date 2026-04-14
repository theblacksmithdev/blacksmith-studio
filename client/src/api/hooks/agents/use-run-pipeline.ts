import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Runs an agent pipeline by ID.
 */
export function useRunPipeline() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (data: { pipelineId: string; prompt: string; maxBudgetUsd?: number }) =>
      api.agents.runPipeline(projectId!, data),
  })
}
