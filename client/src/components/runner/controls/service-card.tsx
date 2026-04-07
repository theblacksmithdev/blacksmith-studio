import styled from '@emotion/styled'
import { Play, Square, Server } from 'lucide-react'
import { isServiceActive, type RunnerStatus } from '@/stores/runner-store'
import { StatusDot, MONO_FONT } from '../runner-primitives'

const Card = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ active }) => (active ? 'var(--studio-border-hover)' : 'var(--studio-border)')};
  background: ${({ active }) => (active ? 'var(--studio-bg-surface)' : 'var(--studio-bg-sidebar)')};
  transition: all 0.15s ease;
`

const IconWrap = styled.div<{ active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  background: var(--studio-bg-main);
  flex-shrink: 0;
  transition: all 0.15s ease;
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
  gap: 8px;
`

const Meta = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  margin-top: 2px;
  font-family: ${MONO_FONT};
`

const StatusText = styled.span`
  font-size: 11px;
  font-weight: 450;
  color: var(--studio-text-tertiary);
  text-transform: capitalize;
`

const ToggleBtn = styled.button<{ active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-main)')};
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

interface ServiceCardProps {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  onToggle: () => void
}

export function ServiceCard({ label, icon: Icon, status, port, onToggle }: ServiceCardProps) {
  const active = isServiceActive(status)

  return (
    <Card active={active}>
      <IconWrap active={active}>
        <Icon size={16} />
      </IconWrap>
      <Body>
        <Label>
          <StatusDot status={status} />
          {label}
          <StatusText>{status}</StatusText>
        </Label>
        <Meta>
          {port && status === 'running' ? `localhost:${port}` : 'Not running'}
        </Meta>
      </Body>
      <ToggleBtn active={active} onClick={onToggle} title={active ? `Stop ${label}` : `Start ${label}`}>
        {active ? <Square size={12} /> : <Play size={12} />}
      </ToggleBtn>
    </Card>
  )
}
