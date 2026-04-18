import { AlertTriangle, Loader2, Package, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ui";
import {
  HeroActionRow,
  HeroBadge,
  HeroHeader,
  HeroRoot,
  HeroStatusDot,
  HeroSubline,
  HeroTitle,
  HeroTitleRow,
  InfoNote,
  PillButton,
  SectionLabel,
} from "@/components/commands/styles";
import { useStudioVenv } from "../hooks/use-studio-venv";

/**
 * Studio venv — shared, user-wide (not per-project). Shown only on
 * the Global defaults scope since it's not meaningful project-side.
 */
export function StudioVenvRow() {
  const vm = useStudioVenv();

  return (
    <div>
      <SectionLabel>Studio environment</SectionLabel>
      <HeroRoot>
        <HeroHeader>
          <HeroTitleRow>
            <HeroTitle>Blacksmith studio venv</HeroTitle>
            {vm.hasVenv ? (
              <HeroBadge $tone="ok">
                <HeroStatusDot $tone="ok" /> ready
              </HeroBadge>
            ) : (
              <HeroBadge $tone="muted">
                <AlertTriangle size={10} /> not created
              </HeroBadge>
            )}
            <HeroBadge $tone="muted">
              <Package size={10} /> managed
            </HeroBadge>
          </HeroTitleRow>
          <HeroSubline>
            {vm.path ??
              "Shared venv under ~/.blacksmith-studio/venv. Used by Graphify and Blacksmith's internal tooling."}
          </HeroSubline>
        </HeroHeader>

        <HeroActionRow>
          {vm.hasVenv ? (
            <PillButton
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
                  <Trash2 size={12} /> Reset studio venv
                </>
              )}
            </PillButton>
          ) : (
            <PillButton
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
                  <Package size={12} /> Create studio venv
                </>
              )}
            </PillButton>
          )}
        </HeroActionRow>

        {vm.localError && (
          <InfoNote style={{ color: "var(--studio-error, #c24242)" }}>
            {vm.localError}
          </InfoNote>
        )}
      </HeroRoot>

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
    </div>
  );
}
