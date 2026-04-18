import { useState } from "react";
import {
  useChangeInterpreter,
  useCommandAvailabilityQuery,
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
  useToolchainsQuery,
} from "@/api/hooks/commands";
import { useGlobalSettings } from "@/hooks/use-global-settings";
import { useUpdateGlobalSettings } from "@/api/hooks/settings";
import { settingsKeyForToolchain } from "@/api/hooks/commands/_settings-keys";
import type { EnvScope } from "./use-env-scope";

export interface BadgeDescriptor {
  tone: "ok" | "error" | "muted";
  label: string;
}

export interface InterpreterRowVM {
  // Identity / display
  toolchainId: string;
  displayName: string;
  scope: EnvScope;

  // Header content
  title: string;
  contextBadge: BadgeDescriptor | null;

  // Capabilities
  canCreate: boolean;
  canDelete: boolean;
  canList: boolean;

  // State flags (callers use these to gate action buttons)
  hasEnv: boolean;
  hasRuntime: boolean;
  isManaged: boolean;
  hasOverride: boolean;
  interpreterPath?: string;

  // Errors (surface-level; availability errors go through statusBadge)
  localError: string | null;

  // ── Project-scope setup flow (no-venv state) ─────────────
  setupChoice: { path: string; label: string } | null;
  setSetupChoice: (c: { path: string; label: string } | null) => void;
  handleSetup: () => Promise<void>;
  isSettingUp: boolean;

  // ── Project-scope managed venv recreate (with confirm dialog) ─
  pendingVersionChange: { path: string; label: string } | null;
  handlePickVersion: (path: string) => void;
  cancelVersionChange: () => void;
  confirmVersionChange: () => Promise<void>;
  isChangingVersion: boolean;

  // ── Project-scope reset (with confirm dialog) ────────────
  confirmingReset: boolean;
  requestReset: () => void;
  cancelReset: () => void;
  confirmReset: () => Promise<void>;
  isResetting: boolean;

  // ── Universal pin (project-scope "Change version" pins the
  //    interpreter; global-scope "Change default" pins the global) ─
  handlePickInterpreter: (path: string) => void;
  handleClearOverride: () => void;
  isPinning: boolean;
}

/**
 * View-model for a single (toolchain × scope) row on the Environments
 * settings page. Encapsulates every data read and every callback the
 * presentational row needs, so the component stays pure.
 *
 * Unified across scopes so "Python project" and "Python global" look
 * and behave identically to readers of this shape — the scope-specific
 * bits (query source, write target) are handled internally.
 */
export function useInterpreterRow(
  toolchainId: string,
  scope: EnvScope,
): InterpreterRowVM {
  const { data: toolchains = [] } = useToolchainsQuery();
  const toolchain = toolchains.find((tc) => tc.id === toolchainId);

  // Per-project resolution (used for status display in both scopes —
  // even at global scope we still want to show the user "here's what
  // projects currently resolve to" as context).
  const { data: projectEnv } = useResolvedEnvQuery(toolchainId, "project");
  const { data: availability } = useCommandAvailabilityQuery(
    toolchainId,
    "project",
  );

  // Global pin value (for scope="global" the title/subline reflect it;
  // for scope="project" we still read it to distinguish a project
  // override from a global default).
  const globalSettings = useGlobalSettings();
  const updateGlobal = useUpdateGlobalSettings();
  const settingKey = settingsKeyForToolchain(toolchainId);
  const globalPin = (globalSettings.get(settingKey) as string | null) ?? "";

  const changeInterpreter = useChangeInterpreter();
  const createEnv = useCreateProjectEnv();
  const deleteEnv = useDeleteProjectEnv();

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

  // ── Derived flags ─────────────────────────────────────────
  const hasRuntime = availability?.ok === true;
  const hasEnv = !!projectEnv;
  const isManaged = !!projectEnv && isOwnedVenv(projectEnv.displayName);
  const hasOverride = !!projectEnv?.displayName?.startsWith("explicit:");
  const primaryBinary = toolchain?.binaries[0] ?? toolchainId;
  const interpreterPath = projectEnv?.bin
    ? `${projectEnv.bin}/${primaryBinary}`
    : undefined;

  // ── Display content (scope-aware) ─────────────────────────
  const versionText = availability?.version ?? "";
  const displayName = toolchain?.displayName ?? toolchainId;

  const title =
    scope === "global"
      ? `${displayName} default`
      : hasRuntime
        ? `${displayName}${versionText ? ` ${versionText}` : ""}`
        : `${displayName} not detected`;

  const contextBadge: BadgeDescriptor | null =
    scope === "global"
      ? null
      : computeProjectBadge({
          hasEnv,
          hasOverride,
          isManaged,
          displayName: projectEnv?.displayName,
        });

  // ── Callbacks ─────────────────────────────────────────────
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
    if (scope === "global") {
      updateGlobal.mutate({ [settingKey]: path });
    } else {
      changeInterpreter.mutate({ toolchainId, path });
    }
  };

  const handleClearOverride = () => {
    if (scope === "global") {
      updateGlobal.mutate({ [settingKey]: "" });
    } else {
      changeInterpreter.mutate({ toolchainId, path: "" });
    }
  };

  const effectiveCurrentPath =
    scope === "global" ? globalPin || undefined : interpreterPath;
  const effectiveHasOverride =
    scope === "global" ? !!globalPin : hasOverride;

  return {
    toolchainId,
    displayName,
    scope,

    title,
    contextBadge,

    canCreate:
      scope === "project" && !!toolchain?.supportsProjectEnvCreation,
    canDelete:
      scope === "project" && !!toolchain?.supportsProjectEnvDeletion,
    canList: !!toolchain?.supportsListInstalledVersions,

    hasEnv,
    hasRuntime,
    isManaged,
    hasOverride: effectiveHasOverride,
    interpreterPath: effectiveCurrentPath,

    localError,

    setupChoice,
    setSetupChoice,
    handleSetup,
    isSettingUp: createEnv.isPending && !pendingVersionChange,

    pendingVersionChange,
    handlePickVersion,
    cancelVersionChange: () => setPendingVersionChange(null),
    confirmVersionChange,
    isChangingVersion: createEnv.isPending && !!pendingVersionChange,

    confirmingReset,
    requestReset: () => setConfirmingReset(true),
    cancelReset: () => setConfirmingReset(false),
    confirmReset,
    isResetting: deleteEnv.isPending,

    handlePickInterpreter,
    handleClearOverride,
    isPinning:
      scope === "global" ? updateGlobal.isPending : changeInterpreter.isPending,
  };
}

function computeProjectBadge(opts: {
  hasEnv: boolean;
  hasOverride: boolean;
  isManaged: boolean;
  displayName: string | undefined;
}): BadgeDescriptor | null {
  if (!opts.hasEnv) return null;
  if (opts.hasOverride) return { tone: "muted", label: "pinned" };
  if (opts.isManaged) return { tone: "muted", label: "managed venv" };
  const lower = (opts.displayName ?? "").toLowerCase();
  const token = lower.split(/[:\s/]/)[0];
  return { tone: "muted", label: token || "detected" };
}

/**
 * Is the resolved env a project-local venv the app owns? Matches the
 * Blacksmith-managed `.blacksmith/.venv` and legacy root-level
 * `.venv` / `venv`. Wrapper envs (Poetry, Pipenv, conda) and explicit
 * overrides are left alone — those have their own upgrade paths.
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
