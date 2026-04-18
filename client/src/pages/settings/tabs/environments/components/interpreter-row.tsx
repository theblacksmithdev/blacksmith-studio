import {
  AlertTriangle,
  Loader2,
  Package,
  Pin,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ui";
import { InterpreterPicker } from "@/components/commands/interpreter-picker";
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
import {
  useInterpreterRow,
  type BadgeDescriptor,
} from "../hooks/use-interpreter-row";
import type { EnvScope } from "../hooks/use-env-scope";

interface InterpreterRowProps {
  toolchainId: string;
  scope: EnvScope;
}

/**
 * Pure presentational row for a single (toolchain × scope). All logic
 * comes from `useInterpreterRow`. Both "This project" and "Global
 * defaults" tabs use this exact component so the two scopes are
 * visually and behaviourally parallel — the only diff is which
 * verbs surface for which state, driven by the view-model.
 */
export function InterpreterRow({ toolchainId, scope }: InterpreterRowProps) {
  const vm = useInterpreterRow(toolchainId, scope);

  return (
    <div>
      <SectionLabel>{vm.displayName}</SectionLabel>
      <HeroRoot>
        <HeroHeader>
          <HeroTitleRow>
            <HeroTitle>{vm.title}</HeroTitle>
            <Badge badge={vm.statusBadge} />
            {vm.contextBadge && <Badge badge={vm.contextBadge} />}
          </HeroTitleRow>
          <HeroSubline>{vm.subline}</HeroSubline>
        </HeroHeader>

        <ActionRow vm={vm} />

        {vm.localError && (
          <InfoNote style={{ color: "var(--studio-error, #c24242)" }}>
            {vm.localError}
          </InfoNote>
        )}
      </HeroRoot>

      {/* Destructive flows share a single ConfirmDialog — the VM owns
          which one (if any) is open. */}
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
    </div>
  );
}

function Badge({ badge }: { badge: BadgeDescriptor }) {
  return (
    <HeroBadge $tone={badge.tone}>
      {badge.tone === "ok" && <HeroStatusDot $tone="ok" />}
      {badge.tone === "error" && <AlertTriangle size={10} />}
      {badge.tone === "muted" && badgeIcon(badge.label)}
      {badge.label}
    </HeroBadge>
  );
}

function badgeIcon(label: string) {
  if (label === "pinned") return <Pin size={10} />;
  if (label === "managed venv") return <Package size={10} />;
  if (label === "auto-detected") return <Package size={10} />;
  return <Package size={10} />;
}

/** The action row encapsulates every gating rule in one place so the
 *  hook stays about data, not UI decisions. Order: set-up → change
 *  version → reset → pin (universal). */
function ActionRow({ vm }: { vm: ReturnType<typeof useInterpreterRow> }) {
  const { scope } = vm;

  // Global scope only shows pin / clear — venv lifecycle is
  // inherently per-project so it makes no sense at this scope.
  if (scope === "global") {
    return (
      <HeroActionRow>
        {vm.canList && (
          <InterpreterPicker
            toolchainId={vm.toolchainId}
            currentPath={vm.interpreterPath}
            hasOverride={vm.hasOverride}
            label={vm.isPinning ? "Saving…" : `Change ${vm.displayName} default`}
            onSelect={vm.handlePickInterpreter}
            onClearOverride={vm.handleClearOverride}
          />
        )}
        {vm.hasOverride && (
          <PillButton
            type="button"
            onClick={vm.handleClearOverride}
            disabled={vm.isPinning}
            title="Remove the global default"
          >
            <RotateCcw size={12} /> Clear pin
          </PillButton>
        )}
      </HeroActionRow>
    );
  }

  return (
    <HeroActionRow>
      {/* No venv detected but runtime works — offer setup with an
          optional version picker. */}
      {vm.hasRuntime && !vm.hasEnv && vm.canCreate && vm.canList && (
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
      {vm.hasRuntime && !vm.hasEnv && vm.canCreate && (
        <PillButton
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
        </PillButton>
      )}

      {/* Managed venv — recreate with a different base interpreter
          (destructive, confirm-gated). */}
      {vm.isManaged && vm.canCreate && vm.canList && (
        <InterpreterPicker
          toolchainId={vm.toolchainId}
          label={
            vm.isChangingVersion
              ? "Recreating…"
              : `Change ${vm.displayName} version`
          }
          onSelect={vm.handlePickVersion}
        />
      )}
      {vm.isManaged && vm.canDelete && (
        <PillButton
          type="button"
          onClick={vm.requestReset}
          disabled={vm.isResetting}
          title="Delete the Blacksmith-managed venv"
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
              <Trash2 size={12} /> Reset venv
            </>
          )}
        </PillButton>
      )}

      {/* Universal pin — shown whenever we can enumerate versions and
          there's no managed venv competing for the same action. */}
      {vm.canList && !vm.isManaged && (
        <InterpreterPicker
          toolchainId={vm.toolchainId}
          currentPath={vm.interpreterPath}
          hasOverride={vm.hasOverride}
          label={
            vm.isPinning ? "Saving…" : `Change ${vm.displayName} version`
          }
          onSelect={vm.handlePickInterpreter}
          onClearOverride={vm.handleClearOverride}
        />
      )}
    </HeroActionRow>
  );
}

function labelFromPath(p: string): string {
  const match = p.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match?.[1] ?? "selected";
}
