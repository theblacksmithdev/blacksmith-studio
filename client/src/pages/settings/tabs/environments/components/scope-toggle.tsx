import styled from "@emotion/styled";
import { FolderOpen, Globe } from "lucide-react";
import type { EnvScope } from "../hooks/use-env-scope";

const Wrap = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: 10px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border);
  gap: 2px;
`;

const Btn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 14px;
  border: none;
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  background: ${(p) => (p.$active ? "var(--studio-bg-main)" : "transparent")};
  color: ${(p) =>
    p.$active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  box-shadow: ${(p) => (p.$active ? "0 1px 2px rgba(0, 0, 0, 0.12)" : "none")};

  &:hover {
    color: var(--studio-text-primary);
  }
`;

interface ScopeToggleProps {
  value: EnvScope;
  onChange: (next: EnvScope) => void;
}

export function ScopeToggle({ value, onChange }: ScopeToggleProps) {
  return (
    <Wrap role="tablist" aria-label="Environment scope">
      <Btn
        type="button"
        role="tab"
        aria-selected={value === "project"}
        $active={value === "project"}
        onClick={() => onChange("project")}
      >
        <FolderOpen size={13} />
        This project
      </Btn>
      <Btn
        type="button"
        role="tab"
        aria-selected={value === "global"}
        $active={value === "global"}
        onClick={() => onChange("global")}
      >
        <Globe size={13} />
        Global defaults
      </Btn>
    </Wrap>
  );
}
