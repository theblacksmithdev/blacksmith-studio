import { useRef, useEffect, useState, useMemo } from 'react'
import styled from '@emotion/styled'
import { useRunnerStore, selectServices } from '@/stores/runner-store'
import { MONO_FONT } from '../runner-primitives'
import { LogLine } from './log-line'
import { LogsToolbar, type LogFilter } from './logs-toolbar'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
  font-family: ${MONO_FONT};
  font-size: 13px;
  line-height: 18px;
  background: var(--studio-bg-sidebar);
`

const EmptyMsg = styled.div`
  padding: 24px 16px;
  color: var(--studio-text-muted);
  text-align: center;
  font-family: inherit;
  font-size: 13px;
`

interface RunnerLogsProps {
  /** When set, pre-filters logs to this configId. The toolbar filter still works on top. */
  externalFilter?: string | null
}

export function RunnerLogs({ externalFilter }: RunnerLogsProps) {
  const logs = useRunnerStore((s) => s.logs)
  const clearLogs = useRunnerStore((s) => s.clearLogs)
  const services = useRunnerStore(selectServices)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<LogFilter>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(false)

  const serviceNames = useMemo(
    () => services.map((svc) => ({ id: svc.id, name: svc.name })),
    [services],
  )

  const filteredLogs = useMemo(() => {
    let result = logs
    // External filter from service panel
    if (externalFilter) result = result.filter((l) => l.configId === externalFilter)
    // Toolbar filter
    if (filter !== 'all') result = result.filter((l) => l.configId === filter)
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((l) => l.line.toLowerCase().includes(term))
    }
    return result
  }, [logs, externalFilter, filter, searchTerm])

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }

  const scrollToBottom = () => {
    setAutoScroll(true)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Wrap>
      <LogsToolbar
        filter={filter}
        onFilterChange={setFilter}
        serviceNames={serviceNames}
        count={filteredLogs.length}
        autoScroll={autoScroll}
        onScrollToBottom={scrollToBottom}
        onClear={clearLogs}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showTimestamps={showTimestamps}
        onToggleTimestamps={() => setShowTimestamps((v) => !v)}
      />

      <Container ref={containerRef} onScroll={handleScroll}>
        {filteredLogs.length === 0 ? (
          <EmptyMsg>
            {logs.length === 0
              ? 'No output yet. Start a server to see logs here.'
              : searchTerm
                ? 'No logs match your search.'
                : 'No logs match this filter.'}
          </EmptyMsg>
        ) : (
          filteredLogs.map((entry, i) => (
            <LogLine key={i} entry={entry} showTimestamp={showTimestamps} />
          ))
        )}
        <div ref={bottomRef} />
      </Container>
    </Wrap>
  )
}
