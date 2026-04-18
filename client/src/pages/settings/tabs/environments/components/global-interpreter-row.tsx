import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { RotateCcw, Terminal } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { InterpreterPicker } from "@/components/commands/interpreter-picker";
import { useGlobalInterpreterRow } from "../hooks/use-global-interpreter-row";
import { ActionButton } from "./action-button";
import { StatusPanel, StatusRow } from "./status-panel";

interface GlobalInterpreterRowProps {
  toolchainId: string;
}

/**
 * Global-scope environment section — edits the user-level default
 * pin that every project falls back to.
 *
 * Pure presentation — no component-local state. Loading labels come
 * from `vm.isPinning`; errors from `vm.error`. Mirrors the
 * project-row pattern so the two feel identical to readers.
 */
export function GlobalInterpreterRow({
  toolchainId,
}: GlobalInterpreterRowProps) {
  const vm = useGlobalInterpreterRow(toolchainId);

  return (
    <SettingsSection title={vm.displayName} description={vm.description}>
      <StatusPanel>
        <StatusRow
          icon={<Terminal size={14} />}
          label="Default interpreter"
          path={vm.pinnedPath || "— · projects use the system interpreter"}
          tag={vm.interpreterTag}
        />
      </StatusPanel>

      <SettingRow
        label={`Change ${vm.displayName} default`}
        description="Used by any project that doesn't set its own override."
      >
        <Flex gap="8px" align="center">
          {vm.canList && (
            <InterpreterPicker
              toolchainId={vm.toolchainId}
              currentPath={vm.pinnedPath || undefined}
              hasOverride={vm.hasOverride}
              label={vm.isPinning ? "Saving…" : "Change default"}
              onSelect={(p) => vm.pin(p)}
              onClearOverride={() => vm.clearPin()}
            />
          )}
          {vm.hasOverride && (
            <ActionButton
              type="button"
              onClick={() => vm.clearPin()}
              disabled={vm.isPinning}
              title="Remove the global default"
            >
              <RotateCcw size={12} /> Clear
            </ActionButton>
          )}
        </Flex>
      </SettingRow>

      {vm.error && (
        <SettingRow label="Error" fullWidth>
          <ErrorText>{vm.error}</ErrorText>
        </SettingRow>
      )}
    </SettingsSection>
  );
}

const ErrorText = styled.span`
  font-size: 13px;
  color: var(--studio-error, #c24242);
`;
