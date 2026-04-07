import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useProjectStore } from '@/stores/project-store'

export function useSkills() {
  const queryClient = useQueryClient()
  const activeProject = useProjectStore((s) => s.activeProject)

  const { data: skills = [], isLoading } = useQuery({
    queryKey: queryKeys.skills,
    queryFn: () => api.skills.list(),
    enabled: !!activeProject,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.skills })

  const addMutation = useMutation({
    mutationFn: (data: { name: string; description: string; content: string }) => api.skills.add(data),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string; content: string }) => api.skills.update(data),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (name: string) => api.skills.remove({ name }),
    onSuccess: invalidate,
  })

  return {
    skills,
    isLoading,
    add: addMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
  }
}
