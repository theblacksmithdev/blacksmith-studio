import styled from '@emotion/styled'
import { Play, Square, Server, Globe } from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { ServiceCard } from './service-card'

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

const Services = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px 12px;
`

export function RunServersCard() {
  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const backendPort = useRunnerStore((s) => s.backendPort)
  const frontendPort = useRunnerStore((s) => s.frontendPort)
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
      <Services>
        <ServiceCard
          label="Backend"
          icon={Server}
          status={backendStatus}
          port={backendPort}
          variant="inline"
          onToggle={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        />
        <ServiceCard
          label="Frontend"
          icon={Globe}
          status={frontendStatus}
          port={frontendPort}
          variant="inline"
          onToggle={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        />
      </Services>
    </Card>
  )
}
