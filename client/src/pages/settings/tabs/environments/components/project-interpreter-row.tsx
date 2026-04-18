import styled from "@emotion/styled";
import { Loader2, Package, Terminal, Trash2 } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { InterpreterPicker } from "@/components/commands/interpreter-picker";
import {
  useProjectInterpreterRow,
  type ProjectInterpreterRowVM,
} from "../hooks/use-project-interpreter-row";
import { ActionButton } from "./action-button";
import { StatusPanel, StatusRow } from "./status-panel";

interface ProjectInterpreterRowProps {
  toolchainId: string;
}

/**
 * Project-scope environment section.
 *
 * Pure presentation — no component-local state. Mutations fire
 * directly from picker / button clicks; `isPending` from the hook
 * drives every loading label. Users see destructive consequences in
 * each `SettingRow` description before clicking.
 */
export function ProjectInterpreterRow({
  toolchainId,
}: ProjectInterpreterRowProps) {
  const vm = useProjectInterpreterRow(toolchainId);

  return (
    <SettingsSection title={vm.displayName} description={vm.description}>
      <StatusPanel>
        <StatusRow
          icon={<Terminal size={14} />}
          label="Interpreter"
          path={vm.interpreterPath ?? "Not resolved"}
          tag={vm.interpreterTag}
        />
        {vm.showEnvRow && (
          <StatusRow
            icon={<Package size={14} />}
            label={vm.envLabel}
            path={vm.envPath}
            tag={vm.envTag ?? undefined}
          />
        )}
      </StatusPanel>

      <ActionRows vm={vm} />

      {vm.error && (
        <SettingRow label="Error" fullWidth>
          <ErrorText>{vm.error}</ErrorText>
        </SettingRow>
      )}
    </SettingsSection>
  );
}

/* ── Action rows — state-driven gating, fire-on-click ─── */

function ActionRows({ vm }: { vm: ProjectInterpreterRowVM }) {
  // Managed venv → picker recreates with chosen version; button resets.
  // Both are destructive; warnings live in the row descriptions.
  if (vm.isManaged) {
    return (
      <>
        <SettingRow
          label={`Change ${vm.displayName} version`}
          description="Recreates the managed .venv with the selected base interpreter. Installed packages will be lost."
        >
          {vm.canCreate && vm.canList && (
            <InterpreterPicker
              toolchainId={vm.toolchainId}
              label={vm.isRecreating ? "Recreating…" : "Change version"}
              onSelect={(p) => vm.recreate(p)}
            />
          )}
        </SettingRow>
        {vm.canDelete && (
          <SettingRow
            label="Reset environment"
            description="Deletes the Blacksmith-managed .venv entirely. Fires immediately."
          >
            <ActionButton
              type="button"
              onClick={() => vm.reset()}
              disabled={vm.isResetting}
            >
              {vm.isResetting ? (
                <>
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Resetting…
                </>
              ) : (
                <>
                  <Trash2 size={12} /> Reset
                </>
              )}
            </ActionButton>
          </SettingRow>
        )}
      </>
    );
  }

  // Runtime is available but no venv yet → merged picker+button:
  // picking a version creates the venv with it.
  if (vm.canCreate && !vm.hasEnv && vm.hasRuntime) {
    return (
      <SettingRow
        label="Virtual environment"
        description="Create an isolated .venv for this project under .blacksmith/.venv. Selecting a version fires setup immediately."
      >
        {vm.canList && (
          <InterpreterPicker
            toolchainId={vm.toolchainId}
            label={vm.isSettingUp ? "Creating…" : "Set up .venv"}
            onSelect={(p) => vm.setUp(p)}
          />
        )}
      </SettingRow>
    );
  }

  // Wrapper / system / not-detected → single pin row.
  return (
    <SettingRow
      label={`Change ${vm.displayName} version`}
      description="Pin a specific interpreter for this project."
    >
      {vm.canList && (
        <InterpreterPicker
          toolchainId={vm.toolchainId}
          currentPath={vm.interpreterPath}
          hasOverride={vm.hasOverride}
          label={vm.isPinning ? "Saving…" : "Change version"}
          onSelect={(p) => vm.pin(p)}
          onClearOverride={() => vm.clearPin()}
        />
      )}
    </SettingRow>
  );
}

const ErrorText = styled.span`
  font-size: 13px;
  color: var(--studio-error, #c24242);
`;
