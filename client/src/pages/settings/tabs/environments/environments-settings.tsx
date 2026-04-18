import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Boxes, FolderOpen, Globe } from "lucide-react";
import { Text } from "@/components/shared/ui";
import { EnvInspector } from "@/components/commands/env-inspector";
import { GlobalDefaultsForm } from "./global-defaults-form";

type EnvScope = "project" | "global";

const ToggleWrap = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: 10px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border);
  gap: 2px;
`;

const ToggleBtn = styled.button<{ $active?: boolean }>`
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

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--studio-text-muted);
`;

/**
 * Settings → Environments — single surface for every kind of
 * interpreter / venv configuration, with a scope toggle on top.
 *
 *   · "This project" delegates to <EnvInspector />, the same component
 *     the Commands page mounts. Shows per-project resolution, managed
 *     venv lifecycle, and override pin.
 *   · "Global defaults" edits the user-level defaults that any
 *     project falls back to, plus studio-venv maintenance (shared
 *     across all projects).
 */
export function EnvironmentsSettings() {
  const [scope, setScope] = useState<EnvScope>(() => scopeFromHash());

  // Sync the URL hash so the global-settings drawer can deep-link to
  // "#scope=global" and land on the right view.
  useEffect(() => {
    const onHash = () => setScope(scopeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleToggle = (next: EnvScope) => {
    setScope(next);
    window.location.hash = `scope=${next}`;
  };

  return (
    <Flex direction="column" gap="20px">
      <Flex align="center" gap="10px">
        <Boxes size={18} style={{ color: "var(--studio-text-muted)" }} />
        <Text
          css={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--studio-text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Environments
        </Text>
      </Flex>

      <Hint>
        Pin the Python and Node interpreters each toolchain uses, manage
        project-local virtual environments, and maintain the shared
        Blacksmith studio venv. Per-project overrides fall back to your
        global defaults.
      </Hint>

      <ToggleWrap role="tablist" aria-label="Environment scope">
        <ToggleBtn
          role="tab"
          aria-selected={scope === "project"}
          $active={scope === "project"}
          onClick={() => handleToggle("project")}
        >
          <FolderOpen size={13} />
          This project
        </ToggleBtn>
        <ToggleBtn
          role="tab"
          aria-selected={scope === "global"}
          $active={scope === "global"}
          onClick={() => handleToggle("global")}
        >
          <Globe size={13} />
          Global defaults
        </ToggleBtn>
      </ToggleWrap>

      {scope === "project" ? <EnvInspector /> : <GlobalDefaultsForm />}
    </Flex>
  );
}

function scopeFromHash(): EnvScope {
  const match = window.location.hash.match(/scope=(project|global)/);
  return (match?.[1] as EnvScope | undefined) ?? "project";
}
