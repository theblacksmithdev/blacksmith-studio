import { useState } from 'react'
import styled from '@emotion/styled'
import { Globe, Server, X } from 'lucide-react'
import { useRunnerStore } from '@/stores/runner-store'
import { useSettings } from '@/hooks/use-settings'
import { StatusDot } from '../runner-primitives'
import { PreviewStopped } from './preview-states'
import { IframeView } from './iframe-view'

type PreviewTab = 'frontend' | 'backend'

/* ── Layout ── */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const TabBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
`

const Tab = styled.button<{ active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 12px;
  border: none;
  background: transparent;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.12s ease;
  font-family: inherit;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 2px;
    border-radius: 1px;
    background: ${({ active }) => (active ? 'var(--studio-accent)' : 'transparent')};
    transition: background 0.12s ease;
  }

  &:hover {
    color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)')};
  }
`

const CloseBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: auto;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

/* ── Component ── */

interface PreviewViewProps {
  onClose?: () => void
}

export function PreviewView({ onClose }: PreviewViewProps) {
  const [tab, setTab] = useState<PreviewTab>('frontend')
  const [reloadKeys, setReloadKeys] = useState({ frontend: 0, backend: 0 })

  const reload = () => setReloadKeys((k) => ({ ...k, [tab]: k[tab] + 1 }))

  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendPort = useRunnerStore((s) => s.frontendPort)
  const backendPort = useRunnerStore((s) => s.backendPort)
  const { frontendPath, backendPath } = useSettings()

  const frontendUrl = frontendPort ? `http://localhost:${frontendPort}${frontendPath}` : null
  const backendUrl = backendPort ? `http://localhost:${backendPort}${backendPath}` : null

  return (
    <Wrap>
      <TabBar>
        <Tab active={tab === 'frontend'} onClick={() => setTab('frontend')}>
          <Globe size={12} />
          Frontend
          <StatusDot status={frontendStatus} size={5} />
        </Tab>
        <Tab active={tab === 'backend'} onClick={() => setTab('backend')}>
          <Server size={12} />
          API
          <StatusDot status={backendStatus} size={5} />
        </Tab>
        {onClose && (
          <CloseBtn onClick={onClose} title="Close preview">
            <X size={14} />
          </CloseBtn>
        )}
      </TabBar>

      <Body>
        {tab === 'frontend' ? (
          frontendStatus === 'running' && frontendUrl
            ? <IframeView url={frontendUrl} reloadKey={reloadKeys.frontend} onReload={reload} />
            : <PreviewStopped service="frontend" status={frontendStatus} icon={Globe} />
        ) : (
          backendStatus === 'running' && backendUrl
            ? <IframeView url={backendUrl} reloadKey={reloadKeys.backend} onReload={reload} />
            : <PreviewStopped service="backend" status={backendStatus} icon={Server} />
        )}
      </Body>
    </Wrap>
  )
}
