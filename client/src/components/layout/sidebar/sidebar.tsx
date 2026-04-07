import styled from '@emotion/styled'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore } from '@/stores/ui-store'
import { useProjects } from '@/hooks/use-projects'
import { Path, settingsPath } from '@/router/paths'
import { NavButton, NavLabel } from './nav-item'
import { projectNav, bottomNav } from './nav-config'
import { RunnerBadge } from './runner-badge'

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
  const toggle = useUiStore((s) => s.toggleSidebar)

  useProjects()

  const pid = activeProject?.id
  const pathname = location.pathname
  const isInsideProject = pid && pathname.startsWith(`/${pid}`)

  const isActive = (match: string) =>
    match === '/chat' ? pathname.includes(match) : pathname.endsWith(match)

  return (
    <Nav expanded={expanded}>
      {isInsideProject && pid ? (
        <>
          <Section>
            {projectNav.map(({ id, icon: Icon, label, path, match }) => (
              <NavButton
                key={id}
                active={isActive(match)}
                expanded={expanded}
                onClick={() => navigate(path(pid))}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <NavLabel visible={expanded}>{label}</NavLabel>
                {id === 'run' && <RunnerBadge />}
              </NavButton>
            ))}
          </Section>

          <Spacer />

          <Section>
            {bottomNav.map(({ id, icon: Icon, label, path, match }) => (
              <NavButton
                key={id}
                active={isActive(match)}
                expanded={expanded}
                onClick={() => navigate(path(pid))}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <NavLabel visible={expanded}>{label}</NavLabel>
              </NavButton>
            ))}
          </Section>

          <Divider />

          <Section>
            <NavButton
              active={false}
              expanded={expanded}
              onClick={() => {
                useProjectStore.getState().setActiveProject(null)
                navigate(Path.Home)
              }}
            >
              <LogOut size={16} style={{ flexShrink: 0 }} />
              <NavLabel visible={expanded}>Exit Project</NavLabel>
            </NavButton>

            <NavButton
              active={isActive('/settings')}
              expanded={expanded}
              onClick={() => navigate(settingsPath(pid))}
            >
              <Settings size={17} style={{ flexShrink: 0 }} />
              <NavLabel visible={expanded}>Settings</NavLabel>
            </NavButton>
          </Section>
        </>
      ) : (
        <Spacer />
      )}

    </Nav>
  )
}
