import { useEffect } from 'react'
import styled from '@emotion/styled'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { resetProjectStores } from '@/stores/reset'
import { useRunnerListener } from '@/hooks/use-runner'
import { useGitListener } from '@/hooks/use-git'
import { useUiStore } from '@/stores/ui-store'
import { SplitPanel } from '@/components/shared/layout'
import { RunnerDock } from '@/components/runner/dock'
import { TerminalPanel } from '@/components/terminal'
import { Sidebar } from './sidebar'
import { ProjectTitleBar } from './title-bar'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useProjects()
  const { setActiveProject } = useProjectStore()
  const activeProject = useProjectStore((s) => s.activeProject)
  const navigate = useNavigate()
  const terminalOpen = useUiStore((s) => s.terminalOpen)

  useRunnerListener()
  useGitListener()

  // Keyboard shortcut: Ctrl+` / Cmd+` to toggle terminal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        useUiStore.getState().toggleTerminal()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (projectId && projectId !== activeProject?.id) {
      resetProjectStores()
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setActiveProject(project)
      } else if (projects.length > 0) {
        // Project not found in the list — navigate home
        navigate('/', { replace: true })
      }
    }
  }, [projectId, activeProject?.id, projects])

  // Don't render until the store has the correct project
  const isReady = activeProject?.id === projectId

  const mainContent = (
    <Content>
      <Outlet />
    </Content>
  )

  if (!isReady) {
    return (
      <Root>
        <ProjectTitleBar />
        <Body>
          <Sidebar />
          <Main><Content /></Main>
        </Body>
      </Root>
    )
  }

  return (
    <Root>
      <ProjectTitleBar />
      <Body>
        <Sidebar />
        <Main>
          {terminalOpen ? (
            <SplitPanel
              left={mainContent}
              direction="vertical"
              defaultWidth={280}
              minWidth={0}
              maxWidth={600}
              storageKey="terminal.height"
              reverse
            >
              <TerminalPanel />
            </SplitPanel>
          ) : mainContent}
        </Main>
      </Body>
      <RunnerDock />
    </Root>
  )
}
