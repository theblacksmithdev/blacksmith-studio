import { useState } from "react";
import {
  useChangeInterpreter,
  useCommandAvailabilityQuery,
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
  useToolchainsQuery,
} from "@/api/hooks/commands";
import type { BadgeDescriptor } from "./_types";

export interface ProjectInterpreterRowVM {
  // Identity
  toolchainId: string;
  displayName: string;
  primaryBinary: string;

  // Capabilities (from toolchain registry)
  canCreate: boolean;
  canDelete: boolean;
  canList: boolean;

  // Resolution state
  hasEnv: boolean;
  hasRuntime: boolean;
  isManaged: boolean;
  hasOverride: boolean;

  // Status-panel content
  title: string;
  description: string;
  interpreterPath?: string;
  envLabel: string;
  envPath: string;
  /** False for toolchains without a venv concept (Node). */
  showEnvRow: boolean;
  interpreterTag: BadgeDescriptor;
  envTag: BadgeDescriptor | null;

  // Transient UI state
  localError: string | null;

  // Setup flow — for the "no venv yet" state
  setupChoice: { path: string; label: string } | null;
  setSetupChoice: (c: { path: string; label: string } | null) => void;
  handleSetup: () => Promise<void>;
  isSettingUp: boolean;

  // Managed-venv recreate (destructive, confirm-gated)
  pendingVersionChange: { path: string; label: string } | null;
  handlePickVersion: (path: string) => void;
  cancelVersionChange: () => void;
  confirmVersionChange: () => Promise<void>;
  isChangingVersion: boolean;

  // Managed-venv reset (destructive, confirm-gated)
  confirmingReset: boolean;
  requestReset: () => void;
  cancelReset: () => void;
  confirmReset: () => Promise<void>;
  isResetting: boolean;

  // Non-managed pin/clear (wrapper / system / override)
  handlePickInterpreter: (path: string) => void;
  handleClearOverride: () => void;
  isPinning: boolean;
}

/**
 * View-model for the project-scope environment section.
 *
 * Single responsibility: project env resolution + per-project
 * lifecycle (setup → recreate → reset → pin). Does not know about
 * global settings. The global-scope row uses a separate hook.
 */
export function useProjectInterpreterRow(
  toolchainId: string,
): ProjectInterpreterRowVM {
  const { data: toolchains = [] } = useToolchainsQuery();
  const toolchain = toolchains.find((tc) => tc.id === toolchainId);

  const { data: projectEnv } = useResolvedEnvQuery(toolchainId, "project");
  const { data: availability } = useCommandAvailabilityQuery(
    toolchainId,
    "project",
  );

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
  const displayName = toolchain?.displayName ?? toolchainId;
  const version = availability?.version;

  // ── Display content ───────────────────────────────────────
  const title = hasRuntime
    ? `${displayName}${version ? ` ${version}` : ""}`
    : `${displayName} not detected`;

  const envTag: BadgeDescriptor | null = hasEnv
    ? hasOverride
      ? { tone: "muted", label: "pinned" }
      : isManaged
        ? { tone: "muted", label: "managed venv" }
        : { tone: "muted", label: wrapperLabel(projectEnv!.displayName) }
    : null;

  const interpreterTag: BadgeDescriptor = !hasRuntime
    ? { tone: "error", label: "unavailable" }
    : version
      ? { tone: "ok", label: version }
      : interpreterPath
        ? { tone: "ok", label: "resolved" }
        : { tone: "muted", label: "not resolved" };

  const envPath = hasEnv
    ? projectEnv!.root || projectEnv!.bin || projectEnv!.displayName
    : hasRuntime && toolchainId === "python"
      ? ".blacksmith/.venv · not set up"
      : hasRuntime
        ? "No environment for this toolchain"
        : (availability?.error ?? "Not configured");
  const envLabel =
    isManaged || (hasEnv && toolchainId === "python")
      ? "Virtual environment"
      : "Environment";
  const showEnvRow = toolchainId === "python";

  const description = `${title} · ${envTag?.label ?? (hasRuntime ? "ready" : "unavailable")}`;

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
    changeInterpreter.mutate({ toolchainId, path });
  };

  const handleClearOverride = () => {
    changeInterpreter.mutate({ toolchainId, path: "" });
  };

  return {
    toolchainId,
    displayName,
    primaryBinary,

    canCreate: !!toolchain?.supportsProjectEnvCreation,
    canDelete: !!toolchain?.supportsProjectEnvDeletion,
    canList: !!toolchain?.supportsListInstalledVersions,

    hasEnv,
    hasRuntime,
    isManaged,
    hasOverride,

    title,
    description,
    interpreterPath,
    envLabel,
    envPath,
    showEnvRow,
    interpreterTag,
    envTag,

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
    isPinning: changeInterpreter.isPending,
  };
}

/** Matches Blacksmith-managed `.blacksmith/.venv` and legacy root-level
 *  `.venv` / `venv`. Wrapper envs (Poetry, Pipenv, conda) are left alone. */
function isOwnedVenv(displayName: string): boolean {
  const lower = displayName.toLowerCase();
  return (
    lower.startsWith(".blacksmith/") ||
    lower.startsWith(".venv") ||
    lower.startsWith("venv")
  );
}

function wrapperLabel(displayName: string): string {
  const lower = displayName.toLowerCase();
  const token = lower.split(/[:\s/]/)[0];
  return token || "detected";
}

function labelFromPath(p: string): string {
  const match = p.match(/(\d+\.\d+(?:\.\d+)?)/);
  return match?.[1] ?? "selected";
}
