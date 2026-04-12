import { useState } from 'react'
import styled from '@emotion/styled'
import { X } from 'lucide-react'
import { useRunnerStore, useServices, RunnerStatus } from '@/stores/runner-store'
import { getServiceIcon, StatusDot } from '../runner-primitives'
import { PreviewStopped } from './preview-states'
import { IframeView } from './iframe-view'

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
  const services = useRunnerStore((s) => s.services)
  const runningServices = useServices(RunnerStatus.Running)
  const previewServices = runningServices.filter((svc) => svc.previewUrl)
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({})

  // Use the first preview service as default if activeTabId is not set or invalid
  const currentTab = previewServices.find((s) => s.id === activeTabId) ?? previewServices[0] ?? null
  const currentService = services.find((s) => s.id === (activeTabId ?? previewServices[0]?.id))

  const reload = () => {
    if (!currentTab) return
    setReloadKeys((k) => ({ ...k, [currentTab.id]: (k[currentTab.id] ?? 0) + 1 }))
  }

  return (
    <Wrap>
      <TabBar>
        {services.map((svc) => {
          const Icon = getServiceIcon(svc.icon)
          return (
            <Tab
              key={svc.id}
              active={(currentTab?.id ?? null) === svc.id}
              onClick={() => setActiveTabId(svc.id)}
            >
              <Icon size={12} />
              {svc.name}
              <StatusDot status={svc.status} size={5} />
            </Tab>
          )
        })}
        {onClose && (
          <CloseBtn onClick={onClose} title="Close preview">
            <X size={14} />
          </CloseBtn>
        )}
      </TabBar>

      <Body>
        {currentTab && currentTab.previewUrl ? (
          <IframeView
            url={currentTab.previewUrl}
            reloadKey={reloadKeys[currentTab.id] ?? 0}
            onReload={reload}
          />
        ) : currentService ? (
          <PreviewStopped
            serviceId={currentService.id}
            serviceName={currentService.name}
            status={currentService.status}
            icon={getServiceIcon(currentService.icon)}
          />
        ) : (
          <PreviewStopped
            serviceId=""
            serviceName="Server"
            status={RunnerStatus.Stopped}
            icon={getServiceIcon('server')}
          />
        )}
      </Body>
    </Wrap>
  )
}
