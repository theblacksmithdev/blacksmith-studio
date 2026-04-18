import styled from "@emotion/styled";
import { Loader2, Package, Trash2 } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { ConfirmDialog } from "@/components/shared/ui";
import { useStudioVenv } from "../hooks/use-studio-venv";
import { ActionButton } from "./action-button";

/**
 * Studio venv — shared across every project (used by Graphify + pip
 * ops). Renders as a standard settings section so it matches the
 * interpreter sections above it on the Global defaults tab.
 */
export function StudioVenvRow() {
  const vm = useStudioVenv();

  return (
    <>
      <SettingsSection
        title="Studio environment"
        description={
          vm.hasVenv
            ? `Shared venv at ${vm.path ?? "~/.blacksmith-studio/venv"}.`
            : "Shared venv lives under ~/.blacksmith-studio/venv. Created on first use by Graphify and Blacksmith's internal tooling."
        }
      >
        <SettingRow
          label={vm.hasVenv ? "Reset environment" : "Create environment"}
          description={
            vm.hasVenv
              ? "Deleting the shared venv will remove Graphify and any other studio-installed tools. They re-bootstrap on next use."
              : "Create the shared venv now instead of waiting for first use."
          }
        >
          {vm.hasVenv ? (
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
          ) : (
            <ActionButton
              type="button"
              data-variant="primary"
              onClick={vm.handleCreate}
              disabled={vm.isCreating}
            >
              {vm.isCreating ? (
                <>
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Creating…
                </>
              ) : (
                <>
                  <Package size={12} /> Create
                </>
              )}
            </ActionButton>
          )}
        </SettingRow>

        {vm.localError && (
          <SettingRow label="Error" fullWidth>
            <ErrorText>{vm.localError}</ErrorText>
          </SettingRow>
        )}
      </SettingsSection>

      {vm.confirmingReset && (
        <ConfirmDialog
          message="Reset the studio environment?"
          description="The shared .blacksmith-studio/venv will be deleted. Graphify and any other installed tools will need to be re-bootstrapped on next use."
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

const ErrorText = styled.span`
  font-size: 13px;
  color: var(--studio-error, #c24242);
`;
