import { type ReactNode, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  Package,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useChangeInterpreter,
  useCommandAvailabilityQuery,
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";
import { ConfirmDialog } from "@/components/shared/ui";
import { InterpreterPicker } from "./interpreter-picker";
import {
  DetailsGrid,
  DetailsLabel,
  DetailsSection,
  DetailsSummary,
  DetailsValue,
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
} from "./styles";

interface EnvHeroProps {
  toolchainId: string;
  displayName: string;
  canCreate: boolean;
  canDelete: boolean;
  canList: boolean;
}

/**
 * Single-glance environment status for one toolchain.
 *
 * Everything the user needs to know lives in the hero line: which
 * interpreter runs, whether it's healthy, and what kind of environment
 * backs it (managed venv / wrapper / system / pinned override).
 *
 * The action row is state-driven — it only surfaces verbs that make
 * sense for the current state, so the user never has to choose between
 * unrelated buttons. The Studio scope and raw paths live inside the
 * collapsible Details section since neither is day-to-day.
 */
export function EnvHero({
  toolchainId,
  displayName,
  canCreate,
  canDelete,
  canList,
}: EnvHeroProps) {
  const { data: projectEnv } = useResolvedEnvQuery(toolchainId, "project");
  const { data: studioEnv } = useResolvedEnvQuery(toolchainId, "studio");
  const { data: availability } = useCommandAvailabilityQuery(
    toolchainId,
    "project",
  );
  const createEnv = useCreateProjectEnv();
  const deleteEnv = useDeleteProjectEnv();
  const changeInterpreter = useChangeInterpreter();

  const [setupChoice, setSetupChoice] = useState<{
    path: string;
    label: string;
  } | null>(null);
  const [pendingVersionChange, setPendingVersionChange] = useState<{
    path: string;
    label: string;
  } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const hasRuntime = availability?.ok === true;
  const hasEnv = !!projectEnv;
  const isManaged = !!projectEnv && isOwnedVenv(projectEnv.displayName);
  const hasOverride = !!projectEnv?.displayName?.startsWith("explicit:");
  const interpreterPath = projectEnv?.bin
    ? `${projectEnv.bin}/python`
    : undefined;

  const handleSetup = async () => {
    setLocalError(null);
    try {
      const result = await createEnv.mutateAsync({
        toolchainId,
        options: setupChoice ? { python: setupChoice.path } : {},
      });
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePickVersion = (path: string) => {
    setPendingVersionChange({ path, label: labelFromPath(path) });
  };

  const confirmVersionChange = async () => {
    if (!pendingVersionChange) return;
    setLocalError(null);
    try {
      const result = await createEnv.mutateAsync({
        toolchainId,
        options: { python: pendingVersionChange.path, overwrite: true },
      });
      setPendingVersionChange(null);
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setPendingVersionChange(null);
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmReset = async () => {
    setLocalError(null);
    try {
      const result = await deleteEnv.mutateAsync(toolchainId);
      setConfirmingReset(false);
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setConfirmingReset(false);
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePickInterpreter = (path: string) => {
    changeInterpreter.mutate({ toolchainId, path });
  };

  const handleClearOverride = () => {
    changeInterpreter.mutate({ toolchainId, path: "" });
  };

  const versionText = availability?.version ?? "";
  const title = hasRuntime
    ? `${displayName}${versionText ? ` ${versionText}` : ""}`
    : `${displayName} not detected`;

  const envBadge = computeEnvBadge({
    hasEnv,
    hasOverride,
    isManaged,
    displayName: projectEnv?.displayName,
  });

  const subline = hasEnv
    ? projectEnv!.root || projectEnv!.bin || projectEnv!.displayName
    : hasRuntime
      ? `Running from system — no project environment yet.`
      : (availability?.error ??
        `Install ${displayName} or pin an interpreter below to continue.`);

  return (
    <HeroRoot>
      <HeroHeader>
        <HeroTitleRow>
          <HeroTitle>{title}</HeroTitle>
          {hasRuntime ? (
            <HeroBadge $tone="ok">
              <HeroStatusDot $tone="ok" />
              ready
            </HeroBadge>
          ) : (
            <HeroBadge $tone="error">
              <AlertTriangle size={10} /> unavailable
            </HeroBadge>
          )}
          {envBadge && (
            <HeroBadge $tone="muted">
              {envBadge.icon}
              {envBadge.label}
            </HeroBadge>
          )}
        </HeroTitleRow>
        <HeroSubline>{subline}</HeroSubline>
      </HeroHeader>

      <HeroActionRow>
        {/* State: no venv, runtime OK → set up */}
        {hasRuntime && !hasEnv && canCreate && canList && (
          <InterpreterPicker
            toolchainId={toolchainId}
            currentPath={setupChoice?.path}
            label={
              setupChoice ? `Python ${setupChoice.label}` : "Choose version"
            }
            onSelect={(p) =>
              setSetupChoice({ path: p, label: labelFromPath(p) })
            }
          />
        )}
        {hasRuntime && !hasEnv && canCreate && (
          <PillButton
            data-variant="primary"
            onClick={handleSetup}
            disabled={createEnv.isPending}
          >
            {createEnv.isPending ? (
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

        {/* State: managed venv → change version + reset */}
        {isManaged && canCreate && canList && (
          <InterpreterPicker
            toolchainId={toolchainId}
            label={createEnv.isPending ? "Recreating…" : "Change version"}
            onSelect={handlePickVersion}
          />
        )}
        {isManaged && canDelete && (
          <PillButton
            onClick={() => setConfirmingReset(true)}
            disabled={deleteEnv.isPending}
            title="Delete the Blacksmith-managed venv"
          >
            {deleteEnv.isPending ? (
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

        {/* Universal: change interpreter (pin a system/pyenv python).
            Not shown when managed venv is active — the venv IS the
            interpreter; use "Change version" instead. */}
        {hasRuntime && canList && !isManaged && (
          <InterpreterPicker
            toolchainId={toolchainId}
            currentPath={interpreterPath}
            hasOverride={hasOverride}
            label={
              changeInterpreter.isPending ? "Saving…" : "Change interpreter"
            }
            onSelect={handlePickInterpreter}
            onClearOverride={handleClearOverride}
          />
        )}
      </HeroActionRow>

      {localError && (
        <InfoNote style={{ color: "var(--studio-error, #c24242)" }}>
          {localError}
        </InfoNote>
      )}

      <DetailsSection>
        <DetailsSummary>
          <ChevronDown size={12} />
          Details
        </DetailsSummary>
        <DetailsGrid>
          <DetailsLabel>Interpreter</DetailsLabel>
          <DetailsValue>{interpreterPath ?? "—"}</DetailsValue>

          {projectEnv?.root && (
            <>
              <DetailsLabel>Venv root</DetailsLabel>
              <DetailsValue>{projectEnv.root}</DetailsValue>
            </>
          )}

          <DetailsLabel>Resolution</DetailsLabel>
          <DetailsValue>
            {projectEnv?.displayName ?? "Not resolved"}
            {hasOverride
              ? " · pinned override"
              : isManaged
                ? " · managed by Blacksmith"
                : hasEnv
                  ? " · auto-detected"
                  : ""}
          </DetailsValue>

          {availability?.error && (
            <>
              <DetailsLabel>Error</DetailsLabel>
              <DetailsValue style={{ color: "var(--studio-error, #c24242)" }}>
                {availability.error}
              </DetailsValue>
            </>
          )}

          <DetailsLabel>Studio env</DetailsLabel>
          <DetailsValue>
            {studioEnv
              ? `${studioEnv.displayName} · bundled, managed internally`
              : "Bootstrapped on first use by Blacksmith's internal tooling."}
          </DetailsValue>
        </DetailsGrid>
      </DetailsSection>

      {pendingVersionChange && (
        <ConfirmDialog
          message={`Recreate .venv with Python ${pendingVersionChange.label}?`}
          description="The existing .venv will be deleted and recreated with the selected Python version. Installed packages will be lost — reinstall via `pip install -r requirements.txt` afterwards."
          confirmLabel="Recreate"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={confirmVersionChange}
          onCancel={() => setPendingVersionChange(null)}
          loading={createEnv.isPending}
        />
      )}
      {confirmingReset && (
        <ConfirmDialog
          message="Reset the virtual environment?"
          description="The Blacksmith-managed .venv under .blacksmith/.venv will be deleted. Installed packages will be lost — you can set up a fresh venv afterwards."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={confirmReset}
          onCancel={() => setConfirmingReset(false)}
          loading={deleteEnv.isPending}
        />
      )}
    </HeroRoot>
  );
}

function computeEnvBadge(opts: {
  hasEnv: boolean;
  hasOverride: boolean;
  isManaged: boolean;
  displayName: string | undefined;
}): { label: string; icon: ReactNode } | null {
  if (!opts.hasEnv) return null;
  if (opts.hasOverride) {
    return { label: "pinned", icon: <Pin size={10} /> };
  }
  if (opts.isManaged) {
    return { label: "managed venv", icon: <Package size={10} /> };
  }
  // Wrapper env (poetry / conda / pipenv / pyenv) — take first token of
  // the displayName as the badge label.
  const lower = (opts.displayName ?? "").toLowerCase();
  const token = lower.split(/[:\s/]/)[0];
  return { label: token || "detected", icon: <Package size={10} /> };
}

/**
 * Heuristic: is the resolved env a project-local venv we can safely
 * delete + recreate? Matches Blacksmith-managed `.blacksmith/.venv`
 * and legacy root-level `.venv` / `venv`. Wrapper envs (Poetry,
 * Pipenv, conda) and user-pinned explicit paths are left alone.
 */
function isOwnedVenv(displayName: string): boolean {
  const lower = displayName.toLowerCase();
  return (
    lower.startsWith(".blacksmith/") ||
    lower.startsWith(".venv") ||
    lower.startsWith("venv")
  );
}

function labelFromPath(p: string): string {
  const match = p.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match?.[1] ?? "selected";
}
