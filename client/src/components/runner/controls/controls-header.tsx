import styled from '@emotion/styled'
import { Square, Layers, Server, Globe } from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { ServiceCard } from './service-card'

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

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 20px 16px;
  flex-shrink: 0;
`

interface RunnerControlsProps {
  previewToggle?: React.ReactNode
}

export function RunnerControls({ previewToggle }: RunnerControlsProps) {
  const { backendStatus, frontendStatus, backendPort, frontendPort } = useRunnerStore()
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop } = useRunner()

  return (
    <>
      <Header>
        <Title>Dev Servers</Title>
        {previewToggle}
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
