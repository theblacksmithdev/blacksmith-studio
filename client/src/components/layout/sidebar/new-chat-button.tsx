import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useClearLiveMessages } from "@/hooks/use-clear-live-messages";
import { projectHome } from "@/router/paths";

/**
 * New-chat / home entry at the top of the sidebar.
 *
 * Collapsed: compact circular button, icon only.
 * Expanded:  full-width row that matches the rest of the nav so it
 *            reads as the primary action in the list rather than a
 *            floating affordance.
 */
const Btn = styled.button<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ expanded }) => (expanded ? "10px" : "0")};
  width: ${({ expanded }) => (expanded ? "100%" : "36px")};
  height: 36px;
  padding: ${({ expanded }) => (expanded ? "0 10px" : "0")};
  justify-content: ${({ expanded }) => (expanded ? "flex-start" : "center")};
  border-radius: ${({ expanded }) => (expanded ? "8px" : "999px")};
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
  margin: ${({ expanded }) => (expanded ? "0 0 8px" : "0 auto 8px")};
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

const Label = styled.span<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: ${({ visible }) => (visible ? "auto" : "0")};
  overflow: hidden;
  transition: opacity 0.15s ease;
`;

interface NewChatButtonProps {
  expanded?: boolean;
}

export function NewChatButton({ expanded = false }: NewChatButtonProps) {
  const navigate = useNavigate();
  const pid = useActiveProjectId();
  const clearLiveMessages = useClearLiveMessages("agents", "unmount");

  if (!pid) return null;

  const handleClick = () => {
    clearLiveMessages();
    navigate(projectHome(pid));
  };

  return (
    <Btn expanded={expanded} onClick={handleClick}>
      <Plus size={expanded ? 16 : 18} style={{ flexShrink: 0 }} />
      <Label visible={expanded}>New chat</Label>
    </Btn>
  );
}
