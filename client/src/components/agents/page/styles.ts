import styled from "@emotion/styled";

export const Layout = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  background: var(--studio-bg-main);
`;

export const CanvasPanel = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

/* ── Floating action buttons ── */

const FloatingBase = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "var(--studio-green-border)" : "var(--studio-border)"};
  background: var(--studio-bg-surface);
  color: ${({ $active }) =>
    $active ? "var(--studio-green)" : "var(--studio-text-secondary)"};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`;

export const TasksBtn = styled(FloatingBase)<{ $hasTasks: boolean }>`
  opacity: ${({ $hasTasks }) => ($hasTasks ? 1 : 0.5)};
`;

export const StopBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: var(--studio-error-subtle);
  color: var(--studio-error);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    background: var(--studio-error-subtle);
    border-color: rgba(239, 68, 68, 0.4);
  }
`;

export const ButtonGroup = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
`;

/** Thin vertical divider between grouped floating buttons. */
export const GroupDivider = styled.span`
  display: inline-block;
  width: 1px;
  height: 20px;
  margin: 0 2px;
  background: var(--studio-border);
`;

export const ChatBtn = styled(FloatingBase)``;

export const Badge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--studio-bg-hover);
  color: var(--studio-text-muted);
`;

export const UnreadDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--studio-green);
  flex-shrink: 0;
`;
