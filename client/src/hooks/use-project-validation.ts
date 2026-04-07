import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import type { ProjectValidateResult } from '@/api/types'

export function useProjectValidation() {
  const mutation = useMutation({
    mutationFn: (path: string) => api.projects.validate({ path }),
  })

  return {
    validate: (path: string) => mutation.mutateAsync(path),
    validation: mutation.data as ProjectValidateResult | undefined,
    isValidating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
