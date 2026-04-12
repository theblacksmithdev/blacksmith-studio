import pluralize from 'pluralize'
import styled from '@emotion/styled'
import { Play, Square } from 'lucide-react'
import { useRunnerStore, selectServices, selectIsAnyActive, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { getServiceIcon } from './runner-primitives'
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
  font-size: 14px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const Desc = styled.div`
  font-size: 13px;
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
  font-size: 13px;
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
  const services = useRunnerStore(selectServices)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop } = useRunner()

  const serviceCount = services.length

  return (
    <Card>
      <Header>
        <Play size={15} style={{ color: 'var(--studio-text-tertiary)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Title>Dev Services</Title>
          <Desc>{pluralize('service', serviceCount, true)} configured</Desc>
        </div>
        <ToggleAllBtn onClick={() => (anyActive ? stop() : start())}>
          {anyActive ? <Square size={10} /> : <Play size={10} />}
          {anyActive ? 'Stop All' : 'Start All'}
        </ToggleAllBtn>
      </Header>
      <Services>
        {services.map((svc) => (
          <ServiceCard
            key={svc.id}
            label={svc.name}
            icon={getServiceIcon(svc.icon)}
            status={svc.status}
            port={svc.port}
            variant="inline"
            onToggle={() => (isServiceActive(svc.status) ? stop(svc.id) : start(svc.id))}
          />
        ))}
      </Services>
    </Card>
  )
}
