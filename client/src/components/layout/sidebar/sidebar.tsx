import styled from '@emotion/styled'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore } from '@/stores/ui-store'
import { useProjects } from '@/hooks/use-projects'
import { SidebarTooltip } from './sidebar-tooltip'
import { NavButton, NavLabel } from './nav-item'
import { projectNav, bottomNav } from './nav-config'
import { RunnerBadge } from './runner-badge'
import { NewChatButton } from './new-chat-button'
import { UserMenu } from './user-menu'
import { Terminal } from 'lucide-react'

const COLLAPSED_WIDTH = 56
const EXPANDED_WIDTH = 210

const Nav = styled.nav<{ expanded: boolean }>`
  width: ${({ expanded }) => (expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH)}px;
  background: var(--studio-bg-sidebar);
  border-right: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  padding: 10px 8px;
  transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Spacer = styled.div`
  flex: 1;
`

const Divider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 6px 4px;
  flex-shrink: 0;
`

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeProject = useProjectStore((s) => s.activeProject)
  const expanded = useUiStore((s) => s.sidebarExpanded)
  const terminalOpen = useUiStore((s) => s.terminalOpen)
  const toggleTerminal = useUiStore((s) => s.toggleTerminal)

  useProjects()

  const pid = activeProject?.id
  const pathname = location.pathname
  const isInsideProject = pid && pathname.startsWith(`/${pid}`)

  const isActive = (match: string) =>
    pathname.includes(match)

  return (
    <Nav expanded={expanded}>
      {isInsideProject && pid ? (
        <>
          {/* Home button */}
          <SidebarTooltip label="Home" visible={!expanded}>
            <NewChatButton expanded={expanded} />
          </SidebarTooltip>

          {/* Main nav — Files, Source Control */}
          <Section>
            {projectNav.map(({ id, icon: Icon, label, path, match }) => (
              <SidebarTooltip key={id} label={label} visible={!expanded}>
                <NavButton
                  active={isActive(match)}
                  expanded={expanded}
                  onClick={() => navigate(path(pid))}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <NavLabel visible={expanded}>{label}</NavLabel>
                </NavButton>
              </SidebarTooltip>
            ))}
          </Section>

          <Spacer />

          {/* Bottom nav — Dev Servers, Terminal, Settings */}
          <Section>
            {bottomNav.map(({ id, icon: Icon, label, path, match }) => (
              <SidebarTooltip key={id} label={label} visible={!expanded}>
                <NavButton
                  active={isActive(match)}
                  expanded={expanded}
                  onClick={() => navigate(path(pid))}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <NavLabel visible={expanded}>{label}</NavLabel>
                  {id === 'run' && <RunnerBadge />}
                </NavButton>
              </SidebarTooltip>
            ))}

            <SidebarTooltip label="Terminal" visible={!expanded}>
              <NavButton
                active={terminalOpen}
                expanded={expanded}
                onClick={toggleTerminal}
              >
                <Terminal size={18} style={{ flexShrink: 0 }} />
                <NavLabel visible={expanded}>Terminal</NavLabel>
              </NavButton>
            </SidebarTooltip>

          </Section>
        </>
      ) : (
        <Spacer />
      )}

      <Divider />

      <UserMenu expanded={expanded} />
    </Nav>
  )
}
