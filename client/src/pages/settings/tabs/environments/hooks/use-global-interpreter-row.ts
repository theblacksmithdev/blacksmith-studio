import { useToolchainsQuery } from "@/api/hooks/commands";
import { useGlobalSettings } from "@/hooks/use-global-settings";
import { useUpdateGlobalSettings } from "@/api/hooks/settings";
import { settingsKeyForToolchain } from "@/api/hooks/commands/_settings-keys";
import type { BadgeDescriptor } from "./_types";
import { errorFrom } from "./_mutation-error";

export interface GlobalInterpreterRowVM {
  // Identity
  toolchainId: string;
  displayName: string;

  // Capabilities
  canList: boolean;

  // Display
  title: string;
  description: string;
  pinnedPath: string;
  hasOverride: boolean;
  interpreterTag: BadgeDescriptor;

  // Unified error — drawn from the update mutation (thrown or
  // returned error-shape).
  error: string | null;

  // Actions (thin mutation wrappers, fire-and-forget)
  pin: (path: string) => void;
  clearPin: () => void;
  isPinning: boolean;
}

/**
 * View-model for the global-scope environment section.
 *
 * Single responsibility: read/write the user-level default pin that
 * projects inherit when they don't override. No knowledge of project
 * env detection, venvs, or availability checks — those are
 * project-only concerns and live in `useProjectInterpreterRow`.
 *
 * No local state: loading is `update.isPending`, errors come from
 * `errorFrom(update)`. Mirrors the project hook's stateless shape.
 */
export function useGlobalInterpreterRow(
  toolchainId: string,
): GlobalInterpreterRowVM {
  const { data: toolchains = [] } = useToolchainsQuery();
  const toolchain = toolchains.find((tc) => tc.id === toolchainId);

  const globalSettings = useGlobalSettings();
  const update = useUpdateGlobalSettings();

  const settingKey = settingsKeyForToolchain(toolchainId);
  const pinnedPath = (globalSettings.get(settingKey) as string | null) ?? "";
  const hasOverride = pinnedPath.length > 0;
  const displayName = toolchain?.displayName ?? toolchainId;

  const title = `${displayName} default`;
  const description = hasOverride
    ? "Pinned default — projects inherit this unless they override it."
    : "No default set — projects use the system interpreter.";

  const interpreterTag: BadgeDescriptor = hasOverride
    ? { tone: "ok", label: "pinned" }
    : { tone: "muted", label: "auto-detected" };

  return {
    toolchainId,
    displayName,

    canList: !!toolchain?.supportsListInstalledVersions,

    title,
    description,
    pinnedPath,
    hasOverride,
    interpreterTag,

    error: errorFrom(update),

    pin: (path) => update.mutate({ [settingKey]: path }),
    clearPin: () => update.mutate({ [settingKey]: "" }),
    isPinning: update.isPending,
  };
}
