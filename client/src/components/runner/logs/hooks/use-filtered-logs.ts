import { useState, useMemo } from 'react'
import { useRunnerStore, selectServices } from '@/stores/runner-store'
import type { LogFilter } from '../components/logs-toolbar'

export function useFilteredLogs(externalFilter?: string | null) {
  const logs = useRunnerStore((s) => s.logs)
  const services = useRunnerStore(selectServices)
  const [filter, setFilter] = useState<LogFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(false)

  const serviceNames = useMemo(
    () => services.map((svc) => ({ id: svc.id, name: svc.name })),
    [services],
  )

  const filteredLogs = useMemo(() => {
    let result = logs
    if (externalFilter) result = result.filter((l) => l.configId === externalFilter)
    if (filter !== 'all') result = result.filter((l) => l.configId === filter)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((l) => l.line.toLowerCase().includes(term))
    }
    return result
  }, [logs, externalFilter, filter, searchTerm])

  return {
    logs,
    filteredLogs,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    showTimestamps,
    setShowTimestamps,
    serviceNames,
    toggleTimestamps: () => setShowTimestamps((v) => !v),
  }
}
