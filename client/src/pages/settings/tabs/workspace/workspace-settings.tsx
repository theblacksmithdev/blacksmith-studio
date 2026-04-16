import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  FolderCog,
  Server,
  Terminal,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingInput } from "@/pages/settings/components/setting-input";
import { SettingTextarea } from "@/pages/settings/components/setting-textarea";
import { Text } from "@/components/shared/ui";
import { useWorkspaceSettings } from "./hooks/use-workspace-settings";
import { NodeVersionPicker } from "@/components/shared/node-version-picker";
import { PythonVersionPicker } from "@/components/shared/python-version-picker";
import { usePythonCheck } from "@/api/hooks/python";
import { api } from "@/api";

const DangerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--studio-error);
  background: var(--studio-error-subtle);
  color: var(--studio-error);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    opacity: 0.85;
  }
`;

export function WorkspaceSettings() {
  const ws = useWorkspaceSettings();
  const { data: pythonStatus } = usePythonCheck();

  return (
    <Flex direction="column" gap="28px">
      <SettingsSection
        title="Project"
        description="Identity and file browser configuration."
        onReset={ws.resetAll}
      >
        <SettingRow
          label="Display name"
          description={
            <Flex align="center" gap="4px">
              <FolderCog size={11} /> Shown in the title bar. Defaults to the
              folder name.
            </Flex>
          }
        >
          <SettingInput
            value={ws.displayName}
            placeholder="My Project"
            onChange={ws.setDisplayName}
          />
        </SettingRow>
        <SettingRow
          label="Ignored patterns"
          description="Comma-separated files and folders hidden from the code browser."
          fullWidth
        >
          <SettingTextarea
            value={ws.ignoredPatterns}
            placeholder="node_modules, .git, __pycache__, venv, dist, .env"
            rows={3}
            mono
            onChange={ws.setIgnoredPatterns}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="Dev Environment"
        description="Runtime configuration for dev services."
      >
        <SettingRow
          label="Node.js version"
          description={
            <Flex align="center" gap="4px">
              <Server size={11} /> Node binary for dev servers. Empty = system
              default.
            </Flex>
          }
          fullWidth
        >
          <NodeVersionPicker value={ws.nodePath} onChange={ws.setNodePath} />
        </SettingRow>
        <SettingRow
          label="Python version"
          description={
            <Flex align="center" gap="4px">
              <Terminal size={11} /> Optional. Enables features like Graphify
              knowledge graphs. Empty = system default.
            </Flex>
          }
          fullWidth
        >
          <PythonVersionPicker
            value={ws.pythonPath}
            onChange={ws.setPythonPath}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="Studio Environment"
        description="Blacksmith creates an isolated Python environment for its own tools so your system stays untouched."
      >
        <SettingRow
          label="Venv status"
          description="Located at ~/.blacksmith-studio/venv/"
        >
          {pythonStatus?.installed ? (
            <Flex align="center" gap="4px">
              <CheckCircle2 size={11} color="var(--studio-green)" />
              <Text
                css={{
                  fontSize: "13px",
                  color: "var(--studio-text-secondary)",
                }}
              >
                Ready
              </Text>
            </Flex>
          ) : (
            <Text
              css={{ fontSize: "13px", color: "var(--studio-text-muted)" }}
            >
              Not created
            </Text>
          )}
        </SettingRow>
        <SettingRow
          label="Reset"
          description="Remove all installed Python tools (like Graphify). They can be reinstalled."
        >
          <DangerBtn
            onClick={() => {
              if (
                window.confirm(
                  "Reset the Studio Python environment? This will remove all installed Python tools (like Graphify). They can be reinstalled.",
                )
              ) {
                api.python.resetVenv();
              }
            }}
          >
            <Trash2 size={13} />
            Reset Environment
          </DangerBtn>
        </SettingRow>
      </SettingsSection>
    </Flex>
  );
}
