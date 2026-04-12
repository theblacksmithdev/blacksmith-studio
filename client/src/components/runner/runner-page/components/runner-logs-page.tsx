import { useParams, useOutletContext } from 'react-router-dom'
import { RunnerLogs } from '../../logs'

interface RunnerLogsContext {
  previewToggle: React.ReactNode
}

export function RunnerLogsPage() {
  const { configId } = useParams<{ configId: string }>()
  const { previewToggle } = useOutletContext<RunnerLogsContext>()

  return <RunnerLogs externalFilter={configId ?? null} toolbarTrailing={previewToggle} />
}
