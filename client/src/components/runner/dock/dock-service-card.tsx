import styled from '@emotion/styled'
import { Play, Square, Server } from 'lucide-react'
import { isServiceActive, type RunnerStatus } from '@/stores/runner-store'
import { StatusDot, MONO_FONT } from '../runner-primitives'

const Row = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ active }) => (active ? 'var(--studio-border-hover)' : 'var(--studio-border)')};
  background: ${({ active }) => (active ? 'var(--studio-bg-surface)' : 'var(--studio-bg-main)')};
  transition: all 0.12s ease;
`

const IconWrap = styled.div<{ active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  background: var(--studio-bg-sidebar);
  flex-shrink: 0;
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Label = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`

const Meta = styled.div`
  font-size: 11px;
  color: var(--studio-text-muted);
  margin-top: 1px;
  font-family: ${MONO_FONT};
`

const Toggle = styled.button<{ active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  color: ${({ active }) => (active ? 'var(--studio-text-secondary)' : 'var(--studio-accent)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
  }
`

interface DockServiceCardProps {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  onToggle: () => void
}

export function DockServiceCard({ label, icon: Icon, status, port, onToggle }: DockServiceCardProps) {
  const active = isServiceActive(status)
  return (
    <Row active={active}>
      <IconWrap active={active}>
        <Icon size={14} />
      </IconWrap>
      <Body>
        <Label>
          <StatusDot status={status} size={5} />
          {label}
        </Label>
        <Meta>
          {port && status === 'running' ? `localhost:${port}` : status === 'starting' ? 'Starting...' : 'Stopped'}
        </Meta>
      </Body>
      <Toggle active={active} onClick={onToggle} title={active ? `Stop ${label}` : `Start ${label}`}>
        {active ? <Square size={10} /> : <Play size={10} />}
      </Toggle>
    </Row>
  )
}
