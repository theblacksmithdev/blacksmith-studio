import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'
import { useProjectStore } from '@/stores/project-store'
import type { McpServerConfig } from '@/api/modules/mcp'

export function useMcp() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const activeProject = useProjectStore((s) => s.activeProject)

  const { data: servers = [], isLoading } = useQuery({
    queryKey: keys.mcp,
    queryFn: () => api.mcp.list(),
    enabled: !!activeProject,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.mcp })

  const addMutation = useMutation({
    mutationFn: (data: { name: string; config: McpServerConfig }) => api.mcp.add(data),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; config: McpServerConfig }) => api.mcp.update(data),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (name: string) => api.mcp.remove({ name }),
    onSuccess: invalidate,
  })

  const toggleMutation = useMutation({
    mutationFn: (data: { name: string; enabled: boolean }) => api.mcp.toggle(data),
    onSuccess: invalidate,
  })

  const testMutation = useMutation({
    mutationFn: (name: string) => api.mcp.test({ name }),
    onSettled: invalidate,
  })

  return {
    servers,
    isLoading,
    add: addMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    toggle: toggleMutation.mutateAsync,
    testConnection: testMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isTesting: testMutation.isPending,
    testResult: testMutation.data,
  }
}
