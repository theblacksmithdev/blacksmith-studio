import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { Text } from "@/components/shared/ui";
import { PythonVersionPicker } from "@/components/shared/python-version-picker";
import { usePythonCheck } from "@/api/hooks/python";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { api } from "@/api";

const ActionBtn = styled.button<{ $variant?: "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid
    ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-border)"};
  background: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error-subtle)"
      : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error)"
      : "var(--studio-text-secondary)"};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    border-color: ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-border-hover)"};
    color: ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-text-primary)"};
  }
`;

export function PythonSettings() {
  const { data: pythonStatus } = usePythonCheck();
  const { data: settings } = useSettingsQuery();
  const updateSettings = useUpdateSettings();

  const pythonPath = (settings?.["python.pythonPath"] ?? "") as string;

  return (
    <Flex direction="column" gap="28px">
      <SettingsSection
        title="Python"
        description="Python is optional — it enables features like Graphify knowledge graphs. Blacksmith Studio runs its own isolated environment so your system Python stays untouched."
      >
        <SettingRow
          label="Python version"
          description={
            pythonStatus?.installed ? (
              <Flex align="center" gap="4px">
                <CheckCircle2 size={11} color="var(--studio-green)" />
                Python {pythonStatus.version} detected
                {!pythonStatus.meetsMinimum && " (3.10+ required)"}
              </Flex>
            ) : (
              <Flex align="center" gap="4px">
                <XCircle size={11} color="var(--studio-text-muted)" />
                No Python 3.10+ detected
              </Flex>
            )
          }
          fullWidth
        >
          <PythonVersionPicker
            value={pythonPath}
            onChange={(v) =>
              updateSettings.mutate({ "python.pythonPath": v })
            }
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="Studio Environment"
        description="Blacksmith creates an isolated Python environment for its own tools."
      >
        <SettingRow
          label="Venv status"
          description="Located at ~/.blacksmith-studio/venv/"
        >
          <Text
            css={{
              fontSize: "13px",
              color: "var(--studio-text-secondary)",
            }}
          >
            {pythonStatus?.installed ? "Ready" : "Not created"}
          </Text>
        </SettingRow>

        <SettingRow label="Actions">
          <ActionBtn
            $variant="danger"
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
          </ActionBtn>
        </SettingRow>
      </SettingsSection>
    </Flex>
  );
}
