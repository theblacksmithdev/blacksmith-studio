import { useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { Trash2 } from 'lucide-react'
import { useRunnerStore, type LogEntry } from '@/stores/runner-store'
import { getLineColor, MONO_FONT } from '../runner-primitives'

const Section = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--studio-border);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  flex-shrink: 0;
`

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
  flex: 1;
`

const Count = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
`

const ClearBtn = styled.button`
  width: 20px;
  height: 20px;
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

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2px 0 6px;
  font-family: ${MONO_FONT};
  font-size: 11px;
  line-height: 17px;
  max-height: 240px;
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
  width: 38px;
  flex-shrink: 0;
  color: var(--studio-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 9px;
  padding-top: 2px;
  letter-spacing: 0.03em;
`

const Text = styled.span`
  color: var(--studio-text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
`

const Empty = styled.div`
  padding: 20px 16px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 11px;
`

function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <Line>
      <Source>{entry.source === 'backend' ? 'djng' : 'vite'}</Source>
      <Text style={{ color: getLineColor(entry.line) }}>{entry.line}</Text>
    </Line>
  )
}

interface DockLogsProps {
  open: boolean
}

export function DockLogs({ open }: DockLogsProps) {
  const logs = useRunnerStore((s) => s.logs)
  const clearLogs = useRunnerStore((s) => s.clearLogs)
  const endRef = useRef<HTMLDivElement>(null)

  const recentLogs = logs.slice(-100)

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, open])

  return (
    <Section>
      <Header>
        <Label>Output</Label>
        <Count>{recentLogs.length} lines</Count>
        <ClearBtn onClick={clearLogs} title="Clear logs">
          <Trash2 size={11} />
        </ClearBtn>
      </Header>
      <Body>
        {recentLogs.length === 0 ? (
          <Empty>Waiting for output...</Empty>
        ) : (
          recentLogs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
        <div ref={endRef} />
      </Body>
    </Section>
  )
}
