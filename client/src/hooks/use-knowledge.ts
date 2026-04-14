import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'

export function useKnowledge() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()

  const { data: docs = [], isLoading } = useQuery({
    queryKey: keys.knowledge,
    queryFn: () => api.knowledge.list(projectId!),
    enabled: !!projectId,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.knowledge })

  const createMutation = useMutation({
    mutationFn: (name: string) => api.knowledge.create(projectId!, name),
    onSuccess: invalidate,
  })

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; content: string }) => api.knowledge.save(projectId!, data),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (name: string) => api.knowledge.remove(projectId!, name),
    onSuccess: invalidate,
  })

  return {
    docs,
    isLoading,
    getDoc: (name: string) => api.knowledge.get(projectId!, name),
    create: createMutation.mutateAsync,
    save: saveMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}
