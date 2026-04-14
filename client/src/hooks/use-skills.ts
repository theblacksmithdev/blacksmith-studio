import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'

export function useSkills() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()

  const { data: skills = [], isLoading } = useQuery({
    queryKey: keys.skills,
    queryFn: () => api.skills.list(projectId!),
    enabled: !!projectId,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.skills })

  const addMutation = useMutation({
    mutationFn: (data: { name: string; description: string; content: string }) => api.skills.add(projectId!, data),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string; content: string }) => api.skills.update(projectId!, data),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (name: string) => api.skills.remove(projectId!, name),
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
