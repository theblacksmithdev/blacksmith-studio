import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useProjectStore, type Project } from '@/stores/project-store'
import { resetProjectStores } from '@/stores/reset'

export function useProjects() {
  const queryClient = useQueryClient()
  const { setActiveProject } = useProjectStore()

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => api.projects.list(),
  })

  const activeQuery = useQuery({
    queryKey: queryKeys.activeProject,
    queryFn: async () => {
      const project = await api.projects.getActive()
      setActiveProject(project)
      return project
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: { path: string; name?: string }) =>
      api.projects.register(data),
    onSuccess: (project) => {
      resetProjectStores()
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProject })
      setActiveProject(project)
      invalidateProjectScoped()
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) =>
      api.projects.activate({ id }),
    onSuccess: (project) => {
      resetProjectStores()
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProject })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProject })
    },
  })

  function invalidateProjectScoped() {
    queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
    queryClient.invalidateQueries({ queryKey: queryKeys.files })
    queryClient.invalidateQueries({ queryKey: queryKeys.settings })
  }

  return {
    projects: projectsQuery.data ?? [],
    activeProject: activeQuery.data ?? null,
    isLoading: projectsQuery.isLoading || activeQuery.isLoading,
    register: (path: string, name?: string) => registerMutation.mutateAsync({ path, name }),
    activate: (id: string) => activateMutation.mutateAsync(id),
    remove: (id: string, hard?: boolean) => removeMutation.mutateAsync({ id, hard }),
  }
}
