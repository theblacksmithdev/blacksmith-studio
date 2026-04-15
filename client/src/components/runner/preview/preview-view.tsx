import { useState } from "react";
import styled from "@emotion/styled";
import { X } from "lucide-react";
import {
  useRunnerStore,
  useServices,
  RunnerStatus,
} from "@/stores/runner-store";
import {
  getServiceIcon,
  StatusDot,
} from "@/components/runner/runner-primitives";
import { PreviewStopped, PreviewEmpty } from "./preview-states";
import { IframeView } from "./iframe-view";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--studio-bg-main);
`;

const TabBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 8px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
  min-height: 38px;
`;

const Tab = styled.button<{ active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: ${({ active }) =>
    active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  font-size: 12px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: color 0.12s ease;
  font-family: inherit;
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 2px;
    border-radius: 1px 1px 0 0;
    background: ${({ active }) =>
      active ? "var(--studio-accent)" : "transparent"};
    transition: background 0.15s ease;
  }

  &:hover {
    color: var(--studio-text-secondary);
  }
`;

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
  flex-shrink: 0;
  margin-left: auto;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

interface PreviewViewProps {
  onClose?: () => void;
}

export function PreviewView({ onClose }: PreviewViewProps) {
  const services = useRunnerStore((s) => s.services);
  const runningServices = useServices(RunnerStatus.Running);
  const previewServices = runningServices.filter((svc) => svc.previewUrl);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});

  const currentTab =
    previewServices.find((s) => s.id === activeTabId) ??
    previewServices[0] ??
    null;
  const currentService = services.find(
    (s) => s.id === (activeTabId ?? previewServices[0]?.id),
  );

  const reload = () => {
    if (!currentTab) return;
    setReloadKeys((k) => ({
      ...k,
      [currentTab.id]: (k[currentTab.id] ?? 0) + 1,
    }));
  };

  const hasServices = services.length > 0;

  return (
    <Wrap>
      {hasServices && (
        <TabBar>
          {services.map((svc) => {
            const Icon = getServiceIcon(svc.icon);
            return (
              <Tab
                key={svc.id}
                active={(currentTab?.id ?? null) === svc.id}
                onClick={() => setActiveTabId(svc.id)}
              >
                <Icon size={11} />
                {svc.name}
                <StatusDot status={svc.status} size={5} />
              </Tab>
            );
          })}
          {onClose && (
            <CloseBtn onClick={onClose} title="Close preview">
              <X size={13} />
            </CloseBtn>
          )}
        </TabBar>
      )}

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
          <PreviewEmpty />
        )}
      </Body>
    </Wrap>
  );
}
