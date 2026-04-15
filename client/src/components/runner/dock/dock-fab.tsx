import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Terminal } from "lucide-react";

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
`;

const Btn = styled.button`
  position: fixed;
  bottom: 20px;
  right: 24px;
  z-index: 900;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--studio-border-hover);
  background: var(--studio-bg-sidebar);
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    var(--studio-shadow),
    0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  animation: ${scaleIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.08);
    box-shadow:
      var(--studio-shadow),
      0 6px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Badge = styled.span<{ starting: boolean }>`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--studio-accent);
  border: 2px solid var(--studio-bg-sidebar);
  ${({ starting }) =>
    starting ? "animation: pulse 1.5s ease-in-out infinite;" : ""}
`;

interface DockFabProps {
  starting: boolean;
  title: string;
  onClick: () => void;
}

export function DockFab({ starting, title, onClick }: DockFabProps) {
  return (
    <Btn onClick={onClick} title={title}>
      <Terminal size={18} />
      <Badge starting={starting} />
    </Btn>
  );
}
