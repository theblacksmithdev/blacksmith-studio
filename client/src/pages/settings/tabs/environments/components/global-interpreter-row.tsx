import { Flex } from "@chakra-ui/react";
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
 * Intentionally simpler than the project variant: no venv lifecycle,
 * no availability check, no setup flow. Just "change default" +
 * "clear". Lives in its own component with its own hook so the two
 * concerns don't leak into each other.
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
              onSelect={vm.handlePick}
              onClearOverride={vm.handleClear}
            />
          )}
          {vm.hasOverride && (
            <ActionButton
              type="button"
              onClick={vm.handleClear}
              disabled={vm.isPinning}
              title="Remove the global default"
            >
              <RotateCcw size={12} /> Clear
            </ActionButton>
          )}
        </Flex>
      </SettingRow>
    </SettingsSection>
  );
}
