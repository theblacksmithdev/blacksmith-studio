import {
  useChangeInterpreter,
  useCommandAvailabilityQuery,
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
  useToolchainsQuery,
} from "@/api/hooks/commands";
import type { BadgeDescriptor } from "./_types";
import { errorFrom } from "./_mutation-error";

export interface ProjectInterpreterRowVM {
  // Identity
  toolchainId: string;
  displayName: string;

  // Capabilities
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
  showEnvRow: boolean;
  interpreterTag: BadgeDescriptor;
  envTag: BadgeDescriptor | null;

  // Unified error — drawn from whichever mutation last failed (either
  // a thrown error or an error-shape returned by the IPC layer).
  error: string | null;

  // ── Actions (thin mutation wrappers) ──
  setUp: (pythonPath?: string) => void;
  isSettingUp: boolean;

  recreate: (pythonPath: string) => void;
  isRecreating: boolean;

  reset: () => void;
  isResetting: boolean;

  pin: (path: string) => void;
  clearPin: () => void;
  isPinning: boolean;
}

/**
 * View-model for the project-scope environment section.
 *
 * Pure data + thin mutation wrappers — no pre-mutation UI state like
 * "is the confirm dialog open" lives here. Dialog gating belongs to
 * the component since it's UI concern, not data. All loading flags +
 * errors derive from the underlying mutations.
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

  const createEnv = useCreateProjectEnv();
  const deleteEnv = useDeleteProjectEnv();
  const changeInterpreter = useChangeInterpreter();

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

  // ── Mutation loading flags ────────────────────────────────
  // `createEnv` serves two semantic actions (first-time setup vs.
  // recreate with overwrite). We distinguish by the submitted
  // variables so each button gets its own isPending signal.
  const createOverwrite = !!(
    createEnv.variables as { options?: { overwrite?: boolean } } | undefined
  )?.options?.overwrite;
  const isSettingUp = createEnv.isPending && !createOverwrite;
  const isRecreating = createEnv.isPending && createOverwrite;

  // ── Unified error ─────────────────────────────────────────
  const error =
    errorFrom(createEnv) ?? errorFrom(deleteEnv) ?? errorFrom(changeInterpreter);

  // ── Action wrappers — fire-and-forget; loading state and errors
  //    flow back through the mutation hooks themselves. ──
  const setUp: ProjectInterpreterRowVM["setUp"] = (pythonPath) =>
    createEnv.mutate({
      toolchainId,
      options: pythonPath ? { python: pythonPath } : {},
    });

  const recreate: ProjectInterpreterRowVM["recreate"] = (pythonPath) =>
    createEnv.mutate({
      toolchainId,
      options: { python: pythonPath, overwrite: true },
    });

  const reset: ProjectInterpreterRowVM["reset"] = () =>
    deleteEnv.mutate(toolchainId);

  const pin: ProjectInterpreterRowVM["pin"] = (path) =>
    changeInterpreter.mutate({ toolchainId, path });

  const clearPin: ProjectInterpreterRowVM["clearPin"] = () =>
    changeInterpreter.mutate({ toolchainId, path: "" });

  return {
    toolchainId,
    displayName,

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

    error,

    setUp,
    isSettingUp,
    recreate,
    isRecreating,
    reset,
    isResetting: deleteEnv.isPending,
    pin,
    clearPin,
    isPinning: changeInterpreter.isPending,
  };
}

/* ── Helpers ────────────────────────────────────────────── */

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
