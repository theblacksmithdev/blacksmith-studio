import styled from '@emotion/styled'
import { Play, Square, Server, Globe, Layers } from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, isServiceActive, type RunnerStatus } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { StatusDot, PortLabel, MONO_FONT } from './runner-primitives'

/* ── Page header ── */

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 0;
  flex-shrink: 0;
`

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
  flex: 1;
`

const ToggleAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
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

/* ── Service cards ── */

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 20px 16px;
  flex-shrink: 0;
`

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

const CardIcon = styled.div<{ active: boolean }>`
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

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`

const CardLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`

const CardMeta = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  margin-top: 2px;
  font-family: ${MONO_FONT};
`

const StatusLabel = styled.span<{ status: RunnerStatus }>`
  font-size: 11px;
  font-weight: 450;
  color: var(--studio-text-tertiary);
  text-transform: capitalize;
`

const CardAction = styled.button<{ active: boolean }>`
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

/* ── Service card component ── */

function ServiceCard({ label, icon: Icon, status, port, onToggle }: {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  onToggle: () => void
}) {
  const active = isServiceActive(status)

  return (
    <Card active={active}>
      <CardIcon active={active}>
        <Icon size={16} />
      </CardIcon>
      <CardBody>
        <CardLabel>
          <StatusDot status={status} />
          {label}
          <StatusLabel status={status}>{status}</StatusLabel>
        </CardLabel>
        <CardMeta>
          {port && status === 'running' ? `localhost:${port}` : 'Not running'}
        </CardMeta>
      </CardBody>
      <CardAction active={active} onClick={onToggle} title={active ? `Stop ${label}` : `Start ${label}`}>
        {active ? <Square size={12} /> : <Play size={12} />}
      </CardAction>
    </Card>
  )
}

/* ── Main component ── */

export function RunnerControls() {
  const { backendStatus, frontendStatus, backendPort, frontendPort } = useRunnerStore()
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop } = useRunner()

  return (
    <>
      <Header>
        <Title>Dev Servers</Title>
        <ToggleAllBtn onClick={() => (anyActive ? stop('all') : start('all'))}>
          {anyActive ? <Square size={12} /> : <Layers size={14} />}
          {anyActive ? 'Stop All' : 'Start All'}
        </ToggleAllBtn>
      </Header>

      <Cards>
        <ServiceCard
          label="Backend"
          icon={Server}
          status={backendStatus}
          port={backendPort}
          onToggle={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        />
        <ServiceCard
          label="Frontend"
          icon={Globe}
          status={frontendStatus}
          port={frontendPort}
          onToggle={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        />
      </Cards>
    </>
  )
}
