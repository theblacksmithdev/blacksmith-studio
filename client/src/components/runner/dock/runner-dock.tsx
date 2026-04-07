import { useLocation } from 'react-router-dom'
import { useRunnerStore, selectIsAnyActive, selectIsAnyStarting, isServiceActive } from '@/stores/runner-store'
import { useUiStore } from '@/stores/ui-store'
import { DockFab } from './dock-fab'
import { DockPanel } from './dock-panel'

export function RunnerDock() {
  const open = useUiStore((s) => s.runnerPanelOpen)
  const setOpen = useUiStore((s) => s.setRunnerPanelOpen)
  const location = useLocation()

  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const anyStarting = useRunnerStore(selectIsAnyStarting)

  const isOnRunPage = location.pathname.endsWith('/run')
  if (isOnRunPage || !anyActive) return null

  const activeCount =
    (isServiceActive(backendStatus) ? 1 : 0) +
    (isServiceActive(frontendStatus) ? 1 : 0)

  if (!open) {
    return (
      <DockFab
        starting={anyStarting}
        title={`${activeCount} server${activeCount > 1 ? 's' : ''} running`}
        onClick={() => setOpen(true)}
      />
    )
  }

  return <DockPanel onClose={() => setOpen(false)} />
}
