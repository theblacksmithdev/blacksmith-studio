import { Flex } from "@chakra-ui/react";
import { FolderCog, Server } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingInput } from "@/pages/settings/components/setting-input";
import { SettingTextarea } from "@/pages/settings/components/setting-textarea";
import { useWorkspaceSettings } from "./hooks/use-workspace-settings";
import { NodeVersionPicker } from "@/components/shared/node-version-picker";

export function WorkspaceSettings() {
  const ws = useWorkspaceSettings();

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
      </SettingsSection>
    </Flex>
  );
}
