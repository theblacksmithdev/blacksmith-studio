import { Terminal, Search, FilterX } from 'lucide-react'
import { useRunnerStore, selectServices, selectIsAnyActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { Button, EmptyState } from '@/components/shared/ui'

interface LogsEmptyProps {
  hasLogs: boolean
  searchTerm: string
}

export function LogsEmpty({ hasLogs, searchTerm }: LogsEmptyProps) {
  const services = useRunnerStore(selectServices)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { startAll } = useRunner()

  if (!hasLogs) {
    return (
      <EmptyState
        compact
        icon={<Terminal />}
        title={anyActive ? 'Waiting for output...' : 'No logs yet'}
        description={anyActive ? 'Logs will appear here as your services produce output.' : 'Start a service to see its output here.'}
      >
        {!anyActive && services.length > 0 && (
          <Button variant="primary" size="sm" onClick={startAll}>
            Start All Services
          </Button>
        )}
      </EmptyState>
    )
  }

  if (searchTerm) {
    return (
      <EmptyState compact icon={<Search />} description={`No logs match "${searchTerm}"`} />
    )
  }

  return (
    <EmptyState compact icon={<FilterX />} description="No logs match the current filter" />
  )
}
