import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";

export const PERMISSION_OPTIONS = [
  { value: "bypassPermissions", label: "Auto-approve" },
  { value: "auto", label: "Smart" },
  { value: "default", label: "Ask each time" },
] as const;

export function useAiSettings() {
  const { data: settings = {} } = useSettingsQuery();
  const updateMutation = useUpdateSettings();

  const set = useCallback(
    (key: string, value: any) => updateMutation.mutate({ [key]: value }),
    [updateMutation],
  );

  return {
    // State
    provider: (settings["ai.provider"] ?? "claude-cli") as string,
    model: (settings["ai.model"] ?? "sonnet") as string,
    permissionMode: (settings["ai.permissionMode"] ??
      "bypassPermissions") as string,
    maxBudget: settings["ai.maxBudget"] as number | null,
    customInstructions: (settings["ai.customInstructions"] ?? "") as string,

    // Mutations
    setProvider: (value: string) => set("ai.provider", value),
    setModel: (value: string) => set("ai.model", value),
    setPermissionMode: (value: string) => set("ai.permissionMode", value),
    setBudget: (value: number | string | null) =>
      set("ai.maxBudget", value === "" || value === 0 ? null : value),
    setCustomInstructions: (value: string) =>
      set("ai.customInstructions", value),
  };
}
