import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Boxes, FolderOpen, Globe } from "lucide-react";
import { Text } from "@/components/shared/ui";
import { SegmentedControl } from "@/pages/settings/components/segmented-control";
import { GlobalScopeView, ProjectScopeView } from "./components";
import { useEnvScope, type EnvScope } from "./hooks";

const SCOPE_OPTIONS = [
  { value: "project" as EnvScope, label: "This project", icon: <FolderOpen /> },
  { value: "global" as EnvScope, label: "Global defaults", icon: <Globe /> },
];

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--studio-text-muted);
`;

/**
 * Settings → Environments — single surface for every interpreter /
 * venv configuration.
 *
 * The page is a thin orchestrator: it owns the scope toggle and
 * renders the same row components for both "This project" and
 * "Global defaults". Each row is self-contained (hook + presentation),
 * so the two tabs look structurally identical — Python on top, Node
 * below — with scope-specific actions surfaced inside each row.
 *
 * The studio-venv row appears only at global scope because
 * `~/.blacksmith-studio/venv/` is user-wide infrastructure, not
 * project state.
 */
export function EnvironmentsSettings() {
  const { scope, setScope } = useEnvScope();

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
        Pin Python and Node interpreters, manage project-local virtual
        environments, and maintain the shared Blacksmith studio venv.
        Project overrides fall back to your global defaults.
      </Hint>

      <SegmentedControl
        value={scope}
        options={SCOPE_OPTIONS}
        onChange={(v) => setScope(v as EnvScope)}
      />

      {scope === "project" ? <ProjectScopeView /> : <GlobalScopeView />}
    </Flex>
  );
}
