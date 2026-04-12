import { useLocation, useNavigate } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore, type WorkMode } from '@/stores/ui-store'
import { newChatPath, agentsPath } from '@/router/paths'
import { Tooltip } from '@/components/shared/tooltip'
import { ModeToggle } from '@/components/chat/home-view/mode-toggle'
import {
  TitleBarShell,
  NavBtn,
  TitleText,
  TitleTextBold,
  TitleSeparator,
} from './title-bar-shell'

function getPageName(pathname: string, projectId: string): string | null {
  // Check for specific sub-pages (not the home routes)
  if (pathname.includes('/chat/') && !pathname.endsWith('/chat/new')) return 'Chat'
  if (pathname.endsWith('/code')) return 'Code'
  if (pathname.endsWith('/run')) return 'Dev Servers'
  if (pathname.endsWith('/settings')) return 'Settings'
  if (pathname.includes('/agents/') && !pathname.endsWith('/agents')) return 'Agents'
  if (pathname.endsWith('/source-control')) return 'Source Control'
  if (pathname.endsWith('/skills')) return 'Skills'
  if (pathname.endsWith('/mcp')) return 'MCP'
  return null
}

function getCurrentMode(pathname: string): WorkMode {
  if (pathname.includes('/agents')) return 'agents'
  return 'chat'
}

export function ProjectTitleBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const pid = activeProject?.id ?? ''
  const pageName = pid ? getPageName(location.pathname, pid) : null
  const isHome = !!pid && !pageName
  const currentMode = getCurrentMode(location.pathname)

  const handleModeChange = (mode: WorkMode) => {
    if (!pid) return
    if (mode === 'chat') navigate(newChatPath(pid))
    else navigate(agentsPath(pid))
  }

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
        isHome ? (
          <ModeToggle mode={currentMode} onChange={handleModeChange} />
        ) : activeProject ? (
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
