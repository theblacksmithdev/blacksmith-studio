import styled from '@emotion/styled'
import { Play, Square, Server, Globe, Layers } from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, isServiceActive, type RunnerStatus } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { StatusDot, PortLabel } from './runner-primitives'

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  flex-wrap: wrap;
`

const RunButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)')};
  color: var(--studio-text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
  }
`

const ToggleIcon = styled.span<{ active: boolean }>`
  margin-left: 4px;
  color: ${({ active }) => (active ? 'var(--studio-text-secondary)' : 'var(--studio-accent)')};
  display: flex;
  align-items: center;
`

const ToggleAllBtn = styled.button<{ running: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    opacity: 0.85;
  }
`

function ServiceButton({ label, icon: Icon, status, port, onToggle }: {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  onToggle: () => void
}) {
  const active = isServiceActive(status)

  return (
    <RunButton active={active} onClick={onToggle}>
      <StatusDot status={status} />
      <Icon size={14} />
      {label}
      {port && status === 'running' && <PortLabel>:{port}</PortLabel>}
      <ToggleIcon active={active}>
        {active ? <Square size={12} /> : <Play size={12} />}
      </ToggleIcon>
    </RunButton>
  )
}

export function RunnerControls() {
  const { backendStatus, frontendStatus, backendPort, frontendPort } = useRunnerStore()
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop } = useRunner()

  return (
    <Bar>
      <ServiceButton
        label="Backend"
        icon={Server}
        status={backendStatus}
        port={backendPort}
        onToggle={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
      />
      <ServiceButton
        label="Frontend"
        icon={Globe}
        status={frontendStatus}
        port={frontendPort}
        onToggle={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
      />
      <ToggleAllBtn
        running={anyActive}
        onClick={() => (anyActive ? stop('all') : start('all'))}
      >
        <Layers size={14} />
        {anyActive ? 'Stop All' : 'Start All'}
      </ToggleAllBtn>
    </Bar>
  )
}
