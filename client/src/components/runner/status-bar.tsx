import styled from "@emotion/styled";
import { Square, Layers, PanelRight } from "lucide-react";
import {
  useRunnerStore,
  selectServices,
  selectIsAnyActive,
  isServiceActive,
} from "@/stores/runner-store";
import { useRunner } from "@/hooks/use-runner";
import { getServiceIcon } from "./runner-primitives";
import { ServiceCard } from "./service-card";

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const Spacer = styled.div`
  flex: 1;
`;

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
`;

const PreviewBtn = styled.button<{ active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${({ active }) =>
    active ? "var(--studio-bg-hover)" : "var(--studio-bg-surface)"};
  color: ${({ active }) =>
    active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
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
`;

interface StatusBarProps {
  previewOpen: boolean;
  onTogglePreview: () => void;
}

export function StatusBar({ previewOpen, onTogglePreview }: StatusBarProps) {
  const services = useRunnerStore(selectServices);
  const anyActive = useRunnerStore(selectIsAnyActive);
  const { start, stop, restart } = useRunner();

  return (
    <Bar>
      {services.map((svc) => (
        <ServiceCard
          key={svc.id}
          label={svc.name}
          icon={getServiceIcon(svc.icon)}
          status={svc.status}
          port={svc.port}
          url={svc.previewUrl ?? undefined}
          variant="default"
          onToggle={() =>
            isServiceActive(svc.status) ? stop(svc.id) : start(svc.id)
          }
          onRestart={() => restart(svc.id)}
        />
      ))}

      <Spacer />

      <PreviewBtn
        active={previewOpen}
        onClick={onTogglePreview}
        title={previewOpen ? "Close preview" : "Open preview"}
      >
        <PanelRight size={14} />
      </PreviewBtn>

      <ToggleAllBtn onClick={() => (anyActive ? stop() : start())}>
        {anyActive ? <Square size={11} /> : <Layers size={13} />}
        {anyActive ? "Stop All" : "Start All"}
      </ToggleAllBtn>
    </Bar>
  );
}
