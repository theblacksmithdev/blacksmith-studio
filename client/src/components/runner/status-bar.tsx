import styled from '@emotion/styled'
import { Server, Globe, Square, Layers, PanelRight } from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { useSettings } from '@/hooks/use-settings'
import { ServiceCard } from './service-card'

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
`

const Spacer = styled.div`
  flex: 1;
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

const PreviewBtn = styled.button<{ active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

interface StatusBarProps {
  previewOpen: boolean
  onTogglePreview: () => void
}

export function StatusBar({ previewOpen, onTogglePreview }: StatusBarProps) {
  const { backendStatus, frontendStatus, backendPort, frontendPort } = useRunnerStore()
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop, restart } = useRunner()
  const { frontendPath, backendPath } = useSettings()

  const backendUrl = backendPort ? `http://localhost:${backendPort}${backendPath}` : undefined
  const frontendUrl = frontendPort ? `http://localhost:${frontendPort}${frontendPath}` : undefined

  return (
    <Bar>
      <ServiceCard
        label="Backend"
        icon={Server}
        status={backendStatus}
        port={backendPort}
        url={backendUrl}
        variant="default"
        onToggle={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        onRestart={() => restart('backend')}
      />
      <ServiceCard
        label="Frontend"
        icon={Globe}
        status={frontendStatus}
        port={frontendPort}
        url={frontendUrl}
        variant="default"
        onToggle={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        onRestart={() => restart('frontend')}
      />

      <Spacer />

      <PreviewBtn
        active={previewOpen}
        onClick={onTogglePreview}
        title={previewOpen ? 'Close preview' : 'Open preview'}
      >
        <PanelRight size={14} />
      </PreviewBtn>

      <ToggleAllBtn onClick={() => (anyActive ? stop('all') : start('all'))}>
        {anyActive ? <Square size={11} /> : <Layers size={13} />}
        {anyActive ? 'Stop All' : 'Start All'}
      </ToggleAllBtn>
    </Bar>
  )
}
