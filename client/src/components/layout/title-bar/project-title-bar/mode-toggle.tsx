import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { MessageSquare, Network } from "lucide-react";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { newChatPath, agentsPath } from "@/router/paths";
import { spacing, radii } from "@/components/shared/ui";

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing["2xs"]};
  padding: ${spacing["2xs"]};
  border-radius: ${radii.full};
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  width: fit-content;
  margin: 0 auto;
  -webkit-app-region: no-drag;
`;

const Option = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${radii.full};
  border: none;
  background: ${({ $active }) =>
    $active ? "var(--studio-bg-main)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  box-shadow: ${({ $active }) => ($active ? "var(--studio-shadow)" : "none")};

  &:hover {
    color: var(--studio-text-primary);
  }
`;

export function ModeToggle() {
  const pid = useActiveProjectId();
  const { pathname } = useLocation();

  if (!pid) return null;

  const isAgents = pathname.includes("/agents");

  return (
    <Wrap>
      <Option to={newChatPath(pid)} $active={!isAgents}>
        <MessageSquare size={13} />
        Chat
      </Option>
      <Option to={agentsPath(pid)} $active={isAgents}>
        <Network size={13} />
        Agent Team
      </Option>
    </Wrap>
  );
}
