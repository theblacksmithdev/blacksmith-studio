import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useProjectKeys } from './use-project-keys'
import { useProjectStore, type Project } from '@/stores/project-store'
import { resetProjectStores } from '@/stores/reset'

export function useProjects() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const { setActiveProject } = useProjectStore()

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => api.projects.list(),
  })

  const registerMutation = useMutation({
    mutationFn: (data: { path: string; name?: string }) =>
      api.projects.register(data),
    onSuccess: (project) => {
      resetProjectStores()
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      setActiveProject(project)
      invalidateProjectScoped()
    },
  })

  const removeMutation = useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) =>
      api.projects.remove({ id, hard }),
    onSuccess: () => {
      resetProjectStores()
      setActiveProject(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })

  function invalidateProjectScoped() {
    queryClient.invalidateQueries({ queryKey: keys.sessions })
    queryClient.invalidateQueries({ queryKey: keys.files })
    queryClient.invalidateQueries({ queryKey: keys.settings })
    queryClient.invalidateQueries({ queryKey: keys.runnerConfigs })
    queryClient.invalidateQueries({ queryKey: keys.mcp })
    queryClient.invalidateQueries({ queryKey: keys.knowledge })
    queryClient.invalidateQueries({ queryKey: keys.gitStatus })
    queryClient.invalidateQueries({ queryKey: keys.agents })
    queryClient.invalidateQueries({ queryKey: keys.agentConversations })
  }

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    register: (path: string, name?: string) => registerMutation.mutateAsync({ path, name }),
    remove: (id: string, hard?: boolean) => removeMutation.mutateAsync({ id, hard }),
  }
}
