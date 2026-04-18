import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  Loader2,
  Package,
  Plus,
  Terminal,
  Trash2,
} from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { InterpreterPicker } from "@/components/commands/interpreter-picker";
import { ConfirmDialog } from "@/components/shared/ui";
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
 * Layout: section header → status panel (interpreter + venv paths
 * with health tags) → action rows (setup / change-version / reset /
 * pin depending on state) → confirm dialogs for destructive flows.
 */
export function ProjectInterpreterRow({
  toolchainId,
}: ProjectInterpreterRowProps) {
  const vm = useProjectInterpreterRow(toolchainId);

  return (
    <>
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

        {vm.localError && (
          <SettingRow label="Error" fullWidth>
            <ErrorText>{vm.localError}</ErrorText>
          </SettingRow>
        )}
      </SettingsSection>

      {vm.pendingVersionChange && (
        <ConfirmDialog
          message={`Recreate .venv with ${vm.displayName} ${vm.pendingVersionChange.label}?`}
          description="The existing .venv will be deleted and recreated with the selected version. Installed packages will be lost — reinstall via `pip install -r requirements.txt` afterwards."
          confirmLabel="Recreate"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={vm.confirmVersionChange}
          onCancel={vm.cancelVersionChange}
          loading={vm.isChangingVersion}
        />
      )}
      {vm.confirmingReset && (
        <ConfirmDialog
          message="Reset the virtual environment?"
          description="The Blacksmith-managed .venv under .blacksmith/.venv will be deleted. Installed packages will be lost — you can set up a fresh venv afterwards."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={vm.confirmReset}
          onCancel={vm.cancelReset}
          loading={vm.isResetting}
        />
      )}
    </>
  );
}

/** State-driven row gating — only one of the three variants renders
 *  at a time so the action list stays focused on the current state. */
function ActionRows({ vm }: { vm: ProjectInterpreterRowVM }) {
  if (vm.isManaged) {
    return (
      <>
        <SettingRow
          label={`Change ${vm.displayName} version`}
          description="Recreates the managed .venv with a different base interpreter. Installed packages will be lost."
        >
          {vm.canCreate && vm.canList && (
            <InterpreterPicker
              toolchainId={vm.toolchainId}
              label={vm.isChangingVersion ? "Recreating…" : "Change version"}
              onSelect={vm.handlePickVersion}
            />
          )}
        </SettingRow>
        {vm.canDelete && (
          <SettingRow
            label="Reset environment"
            description="Delete the Blacksmith-managed .venv entirely."
          >
            <ActionButton
              type="button"
              onClick={vm.requestReset}
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

  if (vm.canCreate && !vm.hasEnv && vm.hasRuntime) {
    return (
      <SettingRow
        label="Virtual environment"
        description="Create an isolated .venv for this project under .blacksmith/.venv."
      >
        <Flex gap="8px" align="center">
          {vm.canList && (
            <InterpreterPicker
              toolchainId={vm.toolchainId}
              currentPath={vm.setupChoice?.path}
              label={
                vm.setupChoice
                  ? `${vm.displayName} ${vm.setupChoice.label}`
                  : "Choose version"
              }
              onSelect={(p) =>
                vm.setSetupChoice({ path: p, label: labelFromPath(p) })
              }
            />
          )}
          <ActionButton
            type="button"
            data-variant="primary"
            onClick={vm.handleSetup}
            disabled={vm.isSettingUp}
          >
            {vm.isSettingUp ? (
              <>
                <Loader2
                  size={12}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Creating…
              </>
            ) : (
              <>
                <Plus size={12} /> Set up .venv
              </>
            )}
          </ActionButton>
        </Flex>
      </SettingRow>
    );
  }

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
          onSelect={vm.handlePickInterpreter}
          onClearOverride={vm.handleClearOverride}
        />
      )}
    </SettingRow>
  );
}

function labelFromPath(p: string): string {
  const match = p.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match?.[1] ?? "selected";
}

const ErrorText = styled.span`
  font-size: 13px;
  color: var(--studio-error, #c24242);
`;
