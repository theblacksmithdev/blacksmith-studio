import { useEffect } from 'react'
import styled from '@emotion/styled'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { resetProjectStores } from '@/stores/reset'
import { useRunnerListener } from '@/hooks/use-runner'
import { useGitListener } from '@/hooks/use-git'
import { useUiStore } from '@/stores/ui-store'
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
  const { activate } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const navigate = useNavigate()

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
      activate(projectId).catch(() => {
        navigate('/', { replace: true })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeProject?.id])

  return (
    <Root>
      <ProjectTitleBar />
      <Body>
        <Sidebar />
        <Main>
          <Content>
            <Outlet />
          </Content>
          <TerminalPanel />
        </Main>
      </Body>
      <RunnerDock />
    </Root>
  )
}
