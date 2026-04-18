import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { InterpreterPicker } from "@/components/commands/interpreter-picker";
import { ConfirmDialog } from "@/components/shared/ui";
import {
  useInterpreterRow,
  type InterpreterRowVM,
} from "../hooks/use-interpreter-row";
import type { EnvScope } from "../hooks/use-env-scope";
import { ActionButton } from "./action-button";

interface InterpreterRowProps {
  toolchainId: string;
  scope: EnvScope;
}

/**
 * Toolchain section rendered in the Environments settings tab.
 *
 * Uses the shared settings chrome — `SettingsSection` wraps the card;
 * each action goes inside a `SettingRow` so the layout matches every
 * other settings tab (label + description left, control right).
 *
 * The hook (`useInterpreterRow`) owns every data read and callback;
 * this component is pure presentation + state-driven row gating.
 */
export function InterpreterRow({ toolchainId, scope }: InterpreterRowProps) {
  const vm = useInterpreterRow(toolchainId, scope);

  return (
    <>
      <SettingsSection
        title={vm.displayName}
        description={buildDescription(vm)}
      >
        {scope === "global" ? (
          <GlobalRows vm={vm} />
        ) : (
          <ProjectRows vm={vm} />
        )}
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

/* ── Row groups (scope-specific) ─────────────────────────── */

function GlobalRows({ vm }: { vm: InterpreterRowVM }) {
  return (
    <SettingRow
      label="Default interpreter"
      description="Used by any project that doesn't set its own override."
    >
      <Flex gap="8px" align="center">
        {vm.canList && (
          <InterpreterPicker
            toolchainId={vm.toolchainId}
            currentPath={vm.interpreterPath}
            hasOverride={vm.hasOverride}
            label={vm.isPinning ? "Saving…" : "Change default"}
            onSelect={vm.handlePickInterpreter}
            onClearOverride={vm.handleClearOverride}
          />
        )}
        {vm.hasOverride && (
          <ActionButton
            type="button"
            onClick={vm.handleClearOverride}
            disabled={vm.isPinning}
          >
            <RotateCcw size={12} /> Clear
          </ActionButton>
        )}
      </Flex>
    </SettingRow>
  );
}

function ProjectRows({ vm }: { vm: InterpreterRowVM }) {
  // Managed venv — two rows: recreate (version swap) + reset.
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

  // No env detected, but runtime is available — offer setup.
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

  // Wrapper / system / not-detected — single pin row.
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

/* ── Helpers ─────────────────────────────────────────────── */

function buildDescription(vm: InterpreterRowVM): string {
  if (vm.scope === "global") {
    return vm.hasOverride
      ? `Pinned: ${vm.interpreterPath ?? "—"}`
      : "No default set — projects use the system interpreter.";
  }
  return `${vm.title} · ${vm.contextBadge?.label ?? (vm.hasRuntime ? "ready" : "unavailable")}`;
}

function labelFromPath(p: string): string {
  const match = p.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match?.[1] ?? "selected";
}

const ErrorText = styled.span`
  font-size: 13px;
  color: var(--studio-error, #c24242);
`;
