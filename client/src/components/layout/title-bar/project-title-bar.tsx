import { useLocation } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore } from '@/stores/ui-store'
import { Tooltip } from '@/components/shared/tooltip'
import {
  TitleBarShell,
  NavBtn,
  TitleText,
  TitleTextBold,
  TitleSeparator,
} from './title-bar-shell'

function getPageName(pathname: string): string | null {
  if (pathname.includes('/chat')) return 'Chat'
  if (pathname.endsWith('/code')) return 'Code'
  if (pathname.endsWith('/run')) return 'Dev Servers'
  if (pathname.endsWith('/templates')) return 'Templates'
  if (pathname.endsWith('/activity')) return 'Activity'
  if (pathname.endsWith('/settings')) return 'Settings'
  return null
}

export function ProjectTitleBar() {
  const location = useLocation()
  const activeProject = useProjectStore((s) => s.activeProject)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const pageName = getPageName(location.pathname)

  return (
    <TitleBarShell
      leading={
        <Tooltip content="Toggle sidebar">
          <NavBtn onClick={toggleSidebar}>
            <PanelLeft size={15} />
          </NavBtn>
        </Tooltip>
      }
      center={
        activeProject ? (
          <>
            <TitleTextBold>{activeProject.name}</TitleTextBold>
            {pageName && (
              <>
                <TitleSeparator>/</TitleSeparator>
                <TitleText>{pageName}</TitleText>
              </>
            )}
          </>
        ) : (
          <TitleText>Blacksmith Studio</TitleText>
        )
      }
    />
  )
}
