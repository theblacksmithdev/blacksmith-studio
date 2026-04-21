import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useModels } from "@/api/hooks/ai";
import { normalizeModelId } from "@/components/shared/model-picker";

export function useSettings() {
  const { data: settings = {} } = useSettingsQuery();
  const { data: models } = useModels();
  const updateMutation = useUpdateSettings();

  const set = useCallback(
    (key: string, value: any) => updateMutation.mutate({ [key]: value }),
    [updateMutation],
  );

  const get = useCallback((key: string) => settings[key], [settings]);

  return {
    get,
    set,

    // Appearance
    theme: (settings["appearance.theme"] ?? "system") as
      | "light"
      | "dark"
      | "system",
    fontSize: (settings["appearance.fontSize"] ?? 14) as number,
    sidebarCollapsed: (settings["appearance.sidebarCollapsed"] ??
      false) as boolean,

    // AI
    model: (normalizeModelId(
      (settings["ai.model"] ?? "sonnet") as string,
      models,
    ) ||
      ((settings["ai.model"] ?? "sonnet") as string)) as string,
    maxBudget: settings["ai.maxBudget"] as number | null,
    customInstructions: (settings["ai.customInstructions"] ?? "") as string,
    permissionMode: (settings["ai.permissionMode"] ??
      "bypassPermissions") as string,

    // Editor
    tabSize: (settings["editor.tabSize"] ?? 2) as number,
    wordWrap: (settings["editor.wordWrap"] ?? true) as boolean,
    minimap: (settings["editor.minimap"] ?? true) as boolean,
    lineNumbers: (settings["editor.lineNumbers"] ?? true) as boolean,

    // Project
    displayName: (settings["project.displayName"] ?? "") as string,
    ignoredPatterns: (settings["project.ignoredPatterns"] ?? "") as string,

    // Preview
    chatSplit: (settings["preview.chatSplit"] ?? 60) as number,
    runSplit: (settings["preview.runSplit"] ?? 55) as number,

    // Runner
    nodePath: (settings["runner.nodePath"] ?? "") as string,
  };
}
