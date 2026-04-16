import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  FolderCog,
  Server,
  Terminal,
  Trash2,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingInput } from "@/pages/settings/components/setting-input";
import { SettingTextarea } from "@/pages/settings/components/setting-textarea";
import { Text, ConfirmDialog } from "@/components/shared/ui";
import { useWorkspaceSettings } from "./hooks/use-workspace-settings";
import { NodeVersionPicker } from "@/components/shared/node-version-picker";
import { PythonVersionPicker } from "@/components/shared/python-version-picker";
import { usePythonCheck, useSetupVenv } from "@/api/hooks/python";
import { api } from "@/api";

const ActionBtn = styled.button<{ $variant?: "danger" | "primary" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid
    ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : p.$variant === "primary"
          ? "var(--studio-accent)"
          : "var(--studio-border)"};
  background: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error-subtle)"
      : p.$variant === "primary"
        ? "var(--studio-accent)"
        : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error)"
      : p.$variant === "primary"
        ? "var(--studio-accent-fg)"
        : "var(--studio-text-secondary)"};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    opacity: 0.85;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

type ConfirmAction = "create" | "reset" | null;

export function WorkspaceSettings() {
  const ws = useWorkspaceSettings();
  const { data: pythonStatus, refetch: recheckPython } = usePythonCheck();
  const setupVenv = useSetupVenv();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const venvReady = pythonStatus?.venvReady ?? false;
  const isCreating = setupVenv.isPending;

  const handleCreateVenv = async () => {
    setConfirmAction(null);
    await setupVenv.mutateAsync();
    await recheckPython();
  };

  const handleResetVenv = async () => {
    setConfirmAction(null);
    await api.python.resetVenv();
    await recheckPython();
  };

  return (
    <>
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
            {venvReady ? (
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
            label="Actions"
            description={
              venvReady
                ? "Reset removes all installed Python tools. They can be reinstalled."
                : "Create the isolated environment to enable Python-powered features."
            }
          >
            <Flex gap="8px">
              {!venvReady && (
                <ActionBtn
                  $variant="primary"
                  disabled={isCreating}
                  onClick={() => setConfirmAction("create")}
                >
                  {isCreating ? (
                    <Loader2
                      size={13}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Plus size={13} />
                  )}
                  {isCreating ? "Creating..." : "Create Environment"}
                </ActionBtn>
              )}
              {venvReady && (
                <ActionBtn
                  $variant="danger"
                  onClick={() => setConfirmAction("reset")}
                >
                  <Trash2 size={13} />
                  Reset Environment
                </ActionBtn>
              )}
            </Flex>
          </SettingRow>
        </SettingsSection>
      </Flex>

      {confirmAction === "create" && (
        <ConfirmDialog
          message="Create Studio environment?"
          description="This will create an isolated Python virtual environment at ~/.blacksmith-studio/venv/ for Blacksmith's own tools. Your system Python will not be modified."
          confirmLabel="Create"
          cancelLabel="Cancel"
          variant="default"
          onConfirm={handleCreateVenv}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === "reset" && (
        <ConfirmDialog
          message="Reset Studio environment?"
          description="This will remove the isolated Python environment and all installed tools (like Graphify). They can be reinstalled afterwards."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleResetVenv}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
