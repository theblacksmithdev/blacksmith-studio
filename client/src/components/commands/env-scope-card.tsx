import { useState } from "react";
import { Box, FolderOpen, Loader2, Plus, Trash2 } from "lucide-react";
import {
  useChangeInterpreter,
  useCommandAvailabilityQuery,
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";
import type { CommandScope } from "@/api/types";
import { ConfirmDialog } from "@/components/shared/ui";
import { InterpreterPicker } from "./interpreter-picker";
import {
  CardActionRow,
  CardActionSpacer,
  PillButton,
  ScopeCard,
  ScopeCardHeader,
  ScopeDisplayName,
  ScopeFieldLabel,
  ScopeFieldValue,
  ScopeFields,
  ScopeIconTile,
  ScopeLabel,
  ScopeNotDetected,
  ScopeVersion,
  StatusBadge,
} from "./styles";

interface EnvScopeCardProps {
  toolchainId: string;
  scope: CommandScope;
  /** Render a "Set up" affordance when no env is detected. */
  canCreate?: boolean;
  /** Render the interpreter picker (change + setup version). */
  canList?: boolean;
  /** Render a "Reset" action that tears down the managed env. */
  canDelete?: boolean;
}

const SCOPE_COPY: Record<
  CommandScope,
  { label: string; icon: typeof Box; hint: string }
> = {
  project: {
    label: "Project",
    icon: FolderOpen,
    hint: "Resolved from the user's project (.venv, .nvmrc, poetry, etc.)",
  },
  studio: {
    label: "Studio",
    icon: Box,
    hint: "Blacksmith-internal environment (~/.blacksmith-studio/…)",
  },
};

/**
 * One scope's worth of env info for a given toolchain.
 *
 * Supports two power-user actions (project scope only):
 *   · **Change interpreter** — pin an installed version via project
 *     settings. Picker lists detected interpreters from the backend.
 *   · **Set up environment** — create a `.venv` (or equivalent) via the
 *     toolchain's `createProjectEnv`. Picker lets the user target a
 *     specific version before clicking Set up.
 */
export function EnvScopeCard({
  toolchainId,
  scope,
  canCreate = false,
  canList = false,
  canDelete = false,
}: EnvScopeCardProps) {
  const { data: env } = useResolvedEnvQuery(toolchainId, scope);
  const { data: availability } = useCommandAvailabilityQuery(
    toolchainId,
    scope,
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
  const copy = SCOPE_COPY[scope];
  const ScopeIcon = copy.icon;

  const canChange = canList && scope === "project";
  const canShowSetupPicker = canList && scope === "project" && !env && canCreate;
  const hasOverride = !!env?.displayName?.startsWith("explicit:");
  // Version can only be swapped when the resolved env is a user-owned
  // `.venv` — poetry/pipenv/conda have their own upgrade flows.
  const isVenv = !!env && isOwnedVenv(env.displayName);
  const canChangeVersion =
    canList && scope === "project" && canCreate && isVenv;
  // Reset only applies to a Blacksmith-managed venv.
  const canReset = canDelete && scope === "project" && isVenv;

  const handleSetup = async () => {
    setLocalError(null);
    try {
      const result = await createEnv.mutateAsync({
        toolchainId,
        options: setupChoice ? { python: setupChoice.path } : {},
      });
      if (result && "error" in result) {
        setLocalError(result.error.message);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePickInterpreter = async (pythonPath: string) => {
    setLocalError(null);
    try {
      await changeInterpreter.mutateAsync({ toolchainId, path: pythonPath });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleClearOverride = async () => {
    setLocalError(null);
    try {
      await changeInterpreter.mutateAsync({ toolchainId, path: "" });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePickVersion = (pythonPath: string) => {
    setPendingVersionChange({
      path: pythonPath,
      label: labelFromPath(pythonPath),
    });
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
      if (result && "error" in result) {
        setLocalError(result.error.message);
      }
    } catch (err) {
      setPendingVersionChange(null);
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleReset = () => setConfirmingReset(true);

  const confirmReset = async () => {
    setLocalError(null);
    try {
      const result = await deleteEnv.mutateAsync(toolchainId);
      setConfirmingReset(false);
      if (result && "error" in result) {
        setLocalError(result.error.message);
      }
    } catch (err) {
      setConfirmingReset(false);
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <ScopeCard $tone={scope}>
      <ScopeCardHeader>
        <ScopeIconTile>
          <ScopeIcon size={14} />
        </ScopeIconTile>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ScopeLabel>{copy.label}</ScopeLabel>
          {env ? (
            <ScopeDisplayName>
              {env.displayName}
              {availability?.version && (
                <>
                  {" "}
                  <ScopeVersion>· {availability.version}</ScopeVersion>
                </>
              )}
            </ScopeDisplayName>
          ) : (
            <ScopeDisplayName style={{ color: "var(--studio-text-muted)" }}>
              Not detected
            </ScopeDisplayName>
          )}
        </div>
        {availability && (
          <StatusBadge $status={availability.ok ? "done" : "error"}>
            {availability.ok ? "ok" : "unavailable"}
          </StatusBadge>
        )}
      </ScopeCardHeader>

      {env ? (
        <>
          <ScopeFields>
            <ScopeFieldLabel>Bin</ScopeFieldLabel>
            <ScopeFieldValue>{env.bin || "—"}</ScopeFieldValue>
            {env.invoker && (
              <>
                <ScopeFieldLabel>Invoker</ScopeFieldLabel>
                <ScopeFieldValue>
                  {env.invoker.command}
                  {env.invoker.args.length > 0
                    ? ` ${env.invoker.args.join(" ")}`
                    : ""}
                </ScopeFieldValue>
              </>
            )}
            {availability?.error && (
              <>
                <ScopeFieldLabel>Error</ScopeFieldLabel>
                <ScopeFieldValue
                  style={{ color: "var(--studio-error, #c24242)" }}
                >
                  {availability.error}
                </ScopeFieldValue>
              </>
            )}
          </ScopeFields>
          {(canChange || canChangeVersion || canReset) && (
            <CardActionRow>
              {canReset && (
                <PillButton
                  onClick={handleReset}
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
                      <Trash2 size={12} /> Reset
                    </>
                  )}
                </PillButton>
              )}
              <CardActionSpacer />
              {canChangeVersion && (
                <InterpreterPicker
                  toolchainId={toolchainId}
                  label={
                    createEnv.isPending ? "Recreating…" : "Change version"
                  }
                  onSelect={handlePickVersion}
                />
              )}
              {canChange && (
                <InterpreterPicker
                  toolchainId={toolchainId}
                  currentPath={env.bin ? `${env.bin}/python` : undefined}
                  hasOverride={hasOverride}
                  label={
                    changeInterpreter.isPending
                      ? "Saving…"
                      : "Change interpreter"
                  }
                  onSelect={handlePickInterpreter}
                  onClearOverride={handleClearOverride}
                />
              )}
            </CardActionRow>
          )}
          {localError && (
            <ScopeNotDetected
              style={{ color: "var(--studio-error, #c24242)" }}
            >
              {localError}
            </ScopeNotDetected>
          )}
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
              message="Reset the project environment?"
              description="The Blacksmith-managed .venv under .blacksmith/.venv will be deleted. Installed packages will be lost — you can set up a fresh venv afterwards."
              confirmLabel="Reset"
              cancelLabel="Cancel"
              variant="danger"
              onConfirm={confirmReset}
              onCancel={() => setConfirmingReset(false)}
              loading={deleteEnv.isPending}
            />
          )}
        </>
      ) : (
        <>
          <ScopeNotDetected>{copy.hint}</ScopeNotDetected>
          {(canCreate || canShowSetupPicker) && (
            <CardActionRow>
              {canShowSetupPicker && (
                <InterpreterPicker
                  toolchainId={toolchainId}
                  currentPath={setupChoice?.path}
                  label={
                    setupChoice
                      ? `Python ${setupChoice.label}`
                      : "Choose version"
                  }
                  onSelect={(p) => {
                    setSetupChoice({ path: p, label: labelFromPath(p) });
                  }}
                />
              )}
              <CardActionSpacer />
              {canCreate && (
                <PillButton
                  data-variant="primary"
                  onClick={handleSetup}
                  disabled={createEnv.isPending}
                >
                  {createEnv.isPending ? (
                    <>
                      <Loader2
                        size={12}
                        style={{
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus size={12} /> Set up {setupLabel(toolchainId)}
                    </>
                  )}
                </PillButton>
              )}
            </CardActionRow>
          )}
          {localError && (
            <ScopeNotDetected
              style={{ color: "var(--studio-error, #c24242)" }}
            >
              {localError}
            </ScopeNotDetected>
          )}
        </>
      )}
    </ScopeCard>
  );
}

function setupLabel(toolchainId: string): string {
  if (toolchainId === "python") return ".venv";
  return "environment";
}

/**
 * Heuristic: is the resolved env a project-local venv the UI can
 * safely delete + recreate? Matches the Blacksmith-managed
 * `.blacksmith/.venv` as well as legacy root-level `.venv` / `venv`
 * folders. Wrapper envs (Poetry, Pipenv, conda) and user-pinned
 * explicit paths are left alone — they have their own upgrade flows.
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
  // Rough version extraction from a path like ".../python3.12" or
  // ".../Python 3.12.0/bin/python". Best-effort — the picker already
  // showed the full label; this is just for the collapsed state.
  const match = p.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match?.[1] ?? "selected";
}
