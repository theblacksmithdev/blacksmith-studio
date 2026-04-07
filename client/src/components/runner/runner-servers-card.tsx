import styled from '@emotion/styled'
import { Play, Square, Server, Globe } from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { StatusDot } from './runner-primitives'

const Card = styled.div`
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const Desc = styled.div`
  font-size: 12px;
  color: var(--studio-text-tertiary);
`

const Actions = styled.div`
  display: flex;
  gap: 1px;
  background: var(--studio-border);
  border-top: 1px solid var(--studio-border);
`

const ServiceBtn = styled.button<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 14px;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-sidebar)')};
  border: none;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)')};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-primary);
  }
`

const ToggleAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  flex-shrink: 0;

  &:hover {
    opacity: 0.85;
  }
`

export function RunServersCard() {
  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop } = useRunner()

  return (
    <Card>
      <Header>
        <Play size={15} style={{ color: 'var(--studio-text-tertiary)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Title>Dev Servers</Title>
          <Desc>Start Django & Vite</Desc>
        </div>
        <ToggleAllBtn onClick={() => (anyActive ? stop('all') : start('all'))}>
          {anyActive ? <Square size={10} /> : <Play size={10} />}
          {anyActive ? 'Stop All' : 'Start All'}
        </ToggleAllBtn>
      </Header>
      <Actions>
        <ServiceBtn
          active={backendStatus === 'running'}
          onClick={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        >
          <StatusDot status={backendStatus} size={5} />
          <Server size={12} />
          Backend
        </ServiceBtn>
        <ServiceBtn
          active={frontendStatus === 'running'}
          onClick={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        >
          <StatusDot status={frontendStatus} size={5} />
          <Globe size={12} />
          Frontend
        </ServiceBtn>
      </Actions>
    </Card>
  )
}
