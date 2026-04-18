import { useToolchainsQuery } from "@/api/hooks/commands";
import { useGlobalSettings } from "@/hooks/use-global-settings";
import { useUpdateGlobalSettings } from "@/api/hooks/settings";
import { settingsKeyForToolchain } from "@/api/hooks/commands/_settings-keys";
import type { BadgeDescriptor } from "./_types";

export interface GlobalInterpreterRowVM {
  // Identity
  toolchainId: string;
  displayName: string;
  primaryBinary: string;
  settingKey: string;

  // Capabilities
  canList: boolean;

  // Display
  title: string;
  description: string;
  pinnedPath: string;
  hasOverride: boolean;
  interpreterTag: BadgeDescriptor;

  // Actions
  handlePick: (path: string) => void;
  handleClear: () => void;
  isPinning: boolean;
}

/**
 * View-model for the global-scope environment section.
 *
 * Single responsibility: read/write the user-level default pin that
 * projects inherit when they don't override. No knowledge of project
 * env detection, venvs, or availability checks — those are
 * project-only concerns and live in `useProjectInterpreterRow`.
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
  const primaryBinary = toolchain?.binaries[0] ?? toolchainId;

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
    primaryBinary,
    settingKey,

    canList: !!toolchain?.supportsListInstalledVersions,

    title,
    description,
    pinnedPath,
    hasOverride,
    interpreterTag,

    handlePick: (path: string) => update.mutate({ [settingKey]: path }),
    handleClear: () => update.mutate({ [settingKey]: "" }),
    isPinning: update.isPending,
  };
}
