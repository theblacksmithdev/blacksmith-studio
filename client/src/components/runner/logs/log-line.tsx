import styled from '@emotion/styled'
import { type LogEntry } from '@/stores/runner-store'
import { getLineColor, MONO_FONT } from '../runner-primitives'

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

export function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <Line>
      <Source>{entry.source === 'backend' ? 'django' : 'vite'}</Source>
      <Text style={{ color: getLineColor(entry.line) }}>{entry.line}</Text>
    </Line>
  )
}
