import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useModels } from "@/api/hooks/ai";
import { normalizeModelId } from "@/components/shared/model-picker";

export const PERMISSION_OPTIONS = [
  { value: "bypassPermissions", label: "Auto-approve" },
  { value: "auto", label: "Smart" },
  { value: "default", label: "Ask each time" },
] as const;

/**
 * Default model id when no setting has been written yet. Canonical
 * form — the ModelPicker, ModelCatalog, and Claude CLI all accept this.
 */
export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

export function useAiSettings() {
  const { data: settings = {} } = useSettingsQuery();
  const { data: models } = useModels();
  const updateMutation = useUpdateSettings();

  const set = useCallback(
    (key: string, value: any) => updateMutation.mutate({ [key]: value }),
    [updateMutation],
  );

  const storedModel = (settings["ai.model"] ?? DEFAULT_MODEL_ID) as string;

  return {
    // State
    model: normalizeModelId(storedModel, models) || storedModel,
    permissionMode: (settings["ai.permissionMode"] ??
      "bypassPermissions") as string,
    maxBudget: settings["ai.maxBudget"] as number | null,
    customInstructions: (settings["ai.customInstructions"] ?? "") as string,

    // Mutations
    setModel: (value: string) => set("ai.model", value),
    setPermissionMode: (value: string) => set("ai.permissionMode", value),
    setBudget: (value: number | string | null) =>
      set("ai.maxBudget", value === "" || value === 0 ? null : value),
    setCustomInstructions: (value: string) =>
      set("ai.customInstructions", value),
  };
}
