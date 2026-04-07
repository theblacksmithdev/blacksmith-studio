import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Server, Globe, Square, X, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRunnerStore, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { useProjectStore } from '@/stores/project-store'
import { runPath } from '@/router/paths'
import { DockServiceCard } from './dock-service-card'
import { DockLogs } from './dock-logs'

const panelIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const Wrap = styled.div`
  position: fixed;
  bottom: 20px;
  right: 24px;
  z-index: 900;
  width: 380px;
  max-height: calc(100vh - 80px);
  border-radius: 16px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border-hover);
  box-shadow:
    var(--studio-shadow),
    0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${panelIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
  flex: 1;
  letter-spacing: -0.01em;
`

const HeaderBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Services = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  flex-shrink: 0;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const StopAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  flex: 1;
  justify-content: center;

  &:hover {
    opacity: 0.85;
  }
`

const OpenPageBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

interface DockPanelProps {
  onClose: () => void
}

export function DockPanel({ onClose }: DockPanelProps) {
  const navigate = useNavigate()
  const { start, stop } = useRunner()
  const activeProject = useProjectStore((s) => s.activeProject)

  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const backendPort = useRunnerStore((s) => s.backendPort)
  const frontendPort = useRunnerStore((s) => s.frontendPort)

  return (
    <Wrap>
      <Header>
        <Title>Dev Servers</Title>
        <HeaderBtn onClick={onClose} title="Close">
          <X size={15} />
        </HeaderBtn>
      </Header>

      <Services>
        <DockServiceCard
          label="Backend"
          icon={Server}
          status={backendStatus}
          port={backendPort}
          onToggle={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        />
        <DockServiceCard
          label="Frontend"
          icon={Globe}
          status={frontendStatus}
          port={frontendPort}
          onToggle={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        />
      </Services>

      <DockLogs open />

      <Footer>
        <StopAllBtn onClick={() => stop('all')}>
          <Square size={10} />
          Stop All
        </StopAllBtn>
        <OpenPageBtn onClick={() => { activeProject && navigate(runPath(activeProject.id)); onClose() }}>
          <ExternalLink size={12} />
          Full View
        </OpenPageBtn>
      </Footer>
    </Wrap>
  )
}
