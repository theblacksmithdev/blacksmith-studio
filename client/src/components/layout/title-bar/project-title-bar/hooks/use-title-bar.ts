import { useActiveProjectId } from '@/api/hooks/_shared'
import { useProjectQuery } from '@/api/hooks/projects'
import { useRouteHandle } from '@/router/use-route-handle'
import { useUiStore } from '@/stores/ui-store'

export function useTitleBar() {
  const projectId = useActiveProjectId()
  const { data: project } = useProjectQuery(projectId)
  const { title: pageName } = useRouteHandle()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const isHome = Boolean(projectId && !pageName)

  return {
    project,
    pageName: pageName ?? null,
    isHome,
    toggleSidebar,
  }
}
