import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import type { ProjectCreateInput } from '@/api/types'

interface UseCreateProjectOptions {
  onSuccess?: (data: { started: boolean }) => void
  onError?: (error: Error) => void
}

export function useCreateProject(options?: UseCreateProjectOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: ProjectCreateInput) => api.projects.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error as Error)
    },
  })

  return {
    createProject: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
