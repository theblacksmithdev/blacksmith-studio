import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import type { AgentRole } from "@/api/types";
import { useModels } from "./use-models";
import { normalizeModelId } from "@/components/shared/model-picker";

/**
 * Per-role model override for the multi-agent team. Empty string / null
 * means "fall back to the project default". Stored under
 * `agents.model.<role>` in the project settings table.
 *
 * Never call `api.settings.*` from components — consume this hook.
 */
export function useAgentRoleModel(role: AgentRole) {
  const { data: settings = {} } = useSettingsQuery();
  const { data: models } = useModels();
  const updateMutation = useUpdateSettings();

  const key = `agents.model.${role}`;
  const stored = (settings[key] as string | undefined) ?? "";
  const normalized = normalizeModelId(stored, models) || stored;

  const setModel = useCallback(
    (modelId: string | null) => {
      updateMutation.mutate({ [key]: modelId ?? "" });
    },
    [key, updateMutation],
  );

  return {
    model: normalized || null,
    setModel,
  };
}
