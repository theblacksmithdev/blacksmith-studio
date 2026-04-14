import { useOutletContext } from 'react-router-dom'
import { RunnerLogs } from './components/logs'
import { useActiveService } from './hooks/use-active-service'

interface RunnerOutletContext {
  previewToggle: React.ReactNode
}

export function RunnerLogsPage() {
  const { activeId, selectService } = useActiveService()
  const { previewToggle } = useOutletContext<RunnerOutletContext>()

  return (
    <RunnerLogs
      activeConfigId={activeId}
      onSelectService={selectService}
      toolbarTrailing={previewToggle}
    />
  )
}
