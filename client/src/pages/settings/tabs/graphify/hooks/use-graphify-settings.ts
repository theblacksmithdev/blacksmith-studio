import { useCallback } from "react";
import {
  useGraphifyCheck,
  useGraphifyStatus,
  useGraphifyBuild,
  useGraphifyClean,
  useGraphifySetup,
  useGraphifyVisualize,
} from "@/api/hooks/graphify";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";

export function useGraphifySettings() {
  const { data: installStatus } = useGraphifyCheck();
  const { data: graphStatus } = useGraphifyStatus();
  const { data: settings } = useSettingsQuery();
  const updateSettings = useUpdateSettings();
  const buildMutation = useGraphifyBuild();
  const cleanMutation = useGraphifyClean();
  const setup = useGraphifySetup();
  const openVisualization = useGraphifyVisualize();

  const set = useCallback(
    (key: string, value: any) => updateSettings.mutate({ [key]: value }),
    [updateSettings],
  );

  const build = () => {
      buildMutation.reset();
      buildMutation.mutate();
    }

    const clean = () => {
      buildMutation.reset();
      cleanMutation.mutate();
    }

  return {
    // Install state
    installed: installStatus?.version ?? false,
    version: installStatus?.version,

    // Settings
    enabled: !!settings?.["graphify.enabled"],
    autoRebuild: !!settings?.["graphify.autoRebuild"],
    setEnabled: (v: boolean) => set("graphify.enabled", v),
    setAutoRebuild: (v: boolean) => set("graphify.autoRebuild", v),

    // Graph status
    graphStatus,
    isBuilding: buildMutation.isPending || !!graphStatus?.building,
    buildResult: buildMutation.data,

    // Actions
    build,
    clean,
    openVisualization,

    // Setup flow
    setup,
  };
}
