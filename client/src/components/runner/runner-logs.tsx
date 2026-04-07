import { useRef, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Trash2, ArrowDown } from 'lucide-react'
import { useRunnerStore, type LogEntry } from '@/stores/runner-store'
import { getLineColor, MONO_FONT } from './runner-primitives'

type LogFilter = 'all' | 'backend' | 'frontend'

/* ── Styled components ── */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const FilterBtn = styled.button<{ active: boolean }>`
  padding: 3px 10px;
  border-radius: 6px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 11px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;

  &:hover {
    color: var(--studio-text-secondary);
  }
`

const Spacer = styled.div`
  flex: 1;
`

const LineCount = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  margin-right: 4px;
`

const IconBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    color: var(--studio-text-secondary);
    background: var(--studio-bg-surface);
  }
`

const LogsContainer = styled.div`
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

const Line = styled.div`
  display: flex;
  gap: 8px;
  padding: 1px 14px;

  &:hover {
    background: var(--studio-bg-surface);
  }
`

const Source = styled.span`
  width: 52px;
  flex-shrink: 0;
  color: var(--studio-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;
  padding-top: 3px;
  letter-spacing: 0.02em;
`

const Text = styled.span`
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
`

/* ── Sub-components ── */

function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <Line>
      <Source>{entry.source === 'backend' ? 'django' : 'vite'}</Source>
      <Text style={{ color: getLineColor(entry.line) }}>{entry.line}</Text>
    </Line>
  )
}

/* ── Main component ── */

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

  return (
    <Wrap>
      <Toolbar>
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterBtn>
        <FilterBtn active={filter === 'backend'} onClick={() => setFilter('backend')}>Django</FilterBtn>
        <FilterBtn active={filter === 'frontend'} onClick={() => setFilter('frontend')}>Vite</FilterBtn>

        <Spacer />

        <LineCount>{filteredLogs.length} lines</LineCount>

        {!autoScroll && (
          <IconBtn
            onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
            title="Scroll to bottom"
          >
            <ArrowDown size={12} />
          </IconBtn>
        )}

        <IconBtn onClick={clearLogs} title="Clear logs">
          <Trash2 size={12} />
        </IconBtn>
      </Toolbar>

      <LogsContainer ref={containerRef} onScroll={handleScroll}>
        {filteredLogs.length === 0 ? (
          <EmptyMsg>
            {logs.length === 0 ? 'No output yet. Start a server to see logs here.' : 'No logs match this filter.'}
          </EmptyMsg>
        ) : (
          filteredLogs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </LogsContainer>
    </Wrap>
  )
}
