import { Flex } from "@chakra-ui/react";
import { FolderCog } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingInput } from "@/pages/settings/components/setting-input";
import { SettingTextarea } from "@/pages/settings/components/setting-textarea";
import { useWorkspaceSettings } from "./hooks/use-workspace-settings";

/**
 * Workspace settings — project identity + file browser only.
 *
 * Runtime / environment configuration (Python + Node interpreter,
 * managed venv, studio venv) now lives in Settings → Environments.
 * That consolidation fixed a long-standing split where the same
 * pinned-interpreter concept lived in three surfaces (this tab, the
 * global drawer, and the Env Inspector) via unrelated APIs.
 */
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
    </Flex>
  );
}
