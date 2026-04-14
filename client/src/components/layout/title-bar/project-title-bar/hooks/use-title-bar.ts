import { useLocation } from 'react-router-dom'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { useProjectQuery } from '@/api/hooks/projects'
import { useUiStore } from '@/stores/ui-store'

function getPageName(pathname: string): string | null {
  if (pathname.includes('/chat') && !pathname.endsWith('/chat/new')) return 'Chat'
  if (pathname.endsWith('/code')) return 'Code'
  if (pathname.includes('/run')) return 'Dev Services'
  
  if (pathname.includes('/agents/') && !pathname.endsWith('/agents')) return 'Agents'
  if (pathname.endsWith('/source-control')) return 'Source Control'
  if (pathname.endsWith('/skills')) return 'Skills'
  if (pathname.endsWith('/mcp')) return 'MCP'
  if (pathname.endsWith('/ai')) return 'AI & Prompting'
  if (pathname.endsWith('/settings') || pathname.includes('/settings/')) return 'Settings'
  return null
}

export function useTitleBar() {
  const { pathname } = useLocation()
  const projectId = useActiveProjectId()
  const { data: project } = useProjectQuery(projectId)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const pageName = projectId ? getPageName(pathname) : null
  const isHome = Boolean(projectId && !pageName)

  return {
    project,
    pageName,
    isHome,
    toggleSidebar,
  }
}
