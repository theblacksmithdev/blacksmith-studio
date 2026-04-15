import styled from "@emotion/styled";
import { useServices, RunnerStatus } from "@/stores/runner-store";

const Badge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--studio-accent);
  box-shadow: 0 0 4px var(--studio-border-hover);
`;

const BadgePulse = styled(Badge)`
  animation: pulse-badge 1.5s ease-in-out infinite;
  @keyframes pulse-badge {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

export function RunnerBadge() {
  const running = useServices(RunnerStatus.Running);
  const starting = useServices(RunnerStatus.Starting);

  if (running.length === 0 && starting.length === 0) return null;
  return starting.length > 0 ? <BadgePulse /> : <Badge />;
}
