import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { projectHome } from "@/router/paths";

const Btn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 36px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin: 0 auto 8px;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

interface NewChatButtonProps {
  expanded?: boolean;
}

export function NewChatButton(_props: NewChatButtonProps) {
  const navigate = useNavigate();
  const pid = useActiveProjectId();

  if (!pid) return null;

  return (
    <Btn onClick={() => navigate(projectHome(pid))}>
      <Plus size={18} />
    </Btn>
  );
}
