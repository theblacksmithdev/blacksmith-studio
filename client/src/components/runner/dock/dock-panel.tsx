import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Square, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRunnerStore, selectServices, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { useProjectStore } from '@/stores/project-store'
import { runPath } from '@/router/paths'
import { getServiceIcon } from '../runner-primitives'
import { ServiceCard } from '../service-card'

const panelIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const Strip = styled.div`
  position: fixed;
  bottom: 20px;
  right: 24px;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 14px;
  background: var(--studio-glass);
  border: 1px solid var(--studio-glass-border);
  box-shadow: var(--studio-shadow-lg);
  backdrop-filter: blur(20px);
  animation: ${panelIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background: var(--studio-border);
  flex-shrink: 0;
`

const StopAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
`

const CloseBtn = styled.button`
  width: 24px;
  height: 24px;
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

interface DockPanelProps {
  onClose: () => void
}

export function DockPanel({ onClose }: DockPanelProps) {
  const navigate = useNavigate()
  const { start, stop } = useRunner()
  const activeProject = useProjectStore((s) => s.activeProject)
  const services = useRunnerStore(selectServices)

  const goToRunPage = () => {
    if (activeProject) {
      navigate(runPath(activeProject.id))
      onClose()
    }
  }

  return (
    <Strip>
      {services.map((svc) => (
        <ServiceCard
          key={svc.id}
          label={svc.name}
          icon={getServiceIcon(svc.icon)}
          status={svc.status}
          port={svc.port}
          variant="compact"
          onToggle={() => (isServiceActive(svc.status) ? stop(svc.id) : start(svc.id))}
        />
      ))}

      <Separator />

      <StopAllBtn onClick={() => stop()}>
        <Square size={9} />
        Stop
      </StopAllBtn>

      <CloseBtn onClick={onClose} title="Minimize">
        <X size={13} />
      </CloseBtn>
    </Strip>
  )
}
