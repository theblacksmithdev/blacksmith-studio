import { useRef, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { useRunnerStore } from '@/stores/runner-store'
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
  font-size: 12px;
  line-height: 18px;
  background: var(--studio-bg-sidebar);
`

const EmptyMsg = styled.div`
  padding: 24px 16px;
  color: var(--studio-text-muted);
  text-align: center;
  font-family: inherit;
  font-size: 12px;
`

export function RunnerLogs() {
  const logs = useRunnerStore((s) => s.logs)
  const clearLogs = useRunnerStore((s) => s.clearLogs)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<LogFilter>('all')
  const [autoScroll, setAutoScroll] = useState(true)

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.source === filter)

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
        count={filteredLogs.length}
        autoScroll={autoScroll}
        onScrollToBottom={scrollToBottom}
        onClear={clearLogs}
      />

      <Container ref={containerRef} onScroll={handleScroll}>
        {filteredLogs.length === 0 ? (
          <EmptyMsg>
            {logs.length === 0 ? 'No output yet. Start a server to see logs here.' : 'No logs match this filter.'}
          </EmptyMsg>
        ) : (
          filteredLogs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </Container>
    </Wrap>
  )
}
