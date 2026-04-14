import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import type { ProjectCloneInput } from '@/api/types'

/**
 * Kicks off a git clone to create a project.
 * Returns `{ started: true }` immediately — listen for push events for progress.
 */
export function useCloneProject() {
  return useMutation({
    mutationFn: (input: ProjectCloneInput) => api.projects.clone(input),
  })
}
