import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useProjectStore } from '@/stores/project-store'

export function useKnowledge() {
  const queryClient = useQueryClient()
  const activeProject = useProjectStore((s) => s.activeProject)

  const { data: docs = [], isLoading } = useQuery({
    queryKey: queryKeys.knowledge,
    queryFn: () => api.knowledge.list(),
    enabled: !!activeProject,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.knowledge })

  const createMutation = useMutation({
    mutationFn: (name: string) => api.knowledge.create({ name }),
    onSuccess: invalidate,
  })

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; content: string }) => api.knowledge.save(data),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (name: string) => api.knowledge.remove({ name }),
    onSuccess: invalidate,
  })

  return {
    docs,
    isLoading,
    getDoc: (name: string) => api.knowledge.get({ name }),
    create: createMutation.mutateAsync,
    save: saveMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}
