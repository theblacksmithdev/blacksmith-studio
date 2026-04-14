import { useState, useMemo } from 'react'
import { useChannel } from '@/api/hooks/_shared'

export function useFilteredLogs(activeConfigId?: string | null) {
  // Collect ALL logs — no channel-level filter so switching services doesn't lose history
  const { messages: rawLogs, clear } = useChannel('runner:output', {
    maxHistory: 1000,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(false)

  // Add timestamp for display (channel events don't include one)
  const logs = useMemo(
    () => rawLogs.map((l) => ({ ...l, timestamp: Date.now() })),
    [rawLogs],
  )

  // Filter by active service + search term at display level
  const filteredLogs = useMemo(() => {
    let result = logs
    if (activeConfigId) {
      result = result.filter((l) => l.configId === activeConfigId)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((l) => l.line.toLowerCase().includes(term))
    }
    return result
  }, [logs, activeConfigId, searchTerm])

  return {
    logs,
    filteredLogs,
    searchTerm,
    setSearchTerm,
    showTimestamps,
    toggleTimestamps: () => setShowTimestamps((v) => !v),
    clearLogs: clear,
  }
}
