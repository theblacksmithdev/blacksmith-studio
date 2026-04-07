import { useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { resetProjectStores } from '@/stores/reset'
import { useRunnerListener } from '@/hooks/use-runner'
import { RunnerDock } from '@/components/runner/runner-dock'

/**
 * Wrapper layout for project-scoped routes.
 * Reads :projectId from URL and activates that project.
 * Resets all project-scoped stores when switching projects.
 */
export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { activate } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const navigate = useNavigate()

  // Global runner status listener — active for all project pages
  useRunnerListener()

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
    <>
      <Outlet />
      <RunnerDock />
    </>
  )
}
