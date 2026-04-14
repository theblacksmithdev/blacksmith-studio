import { useActiveProjectId } from '@/api/hooks/_shared'
import { useProjectQuery } from '@/api/hooks/projects'
import { useRouteHandle } from '@/router/use-route-handle'
import { useSidebar } from '@/hooks/use-sidebar'

export function useTitleBar() {
  const projectId = useActiveProjectId()
  const { data: project } = useProjectQuery(projectId)
  const { title: pageName } = useRouteHandle()
  const { toggle: toggleSidebar } = useSidebar()

  const isHome = Boolean(projectId && !pageName)

  return {
    project,
    pageName: pageName ?? null,
    isHome,
    toggleSidebar,
  }
}
