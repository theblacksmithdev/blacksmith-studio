import { useCallback } from "react";
import {
  useGraphifyBuild,
  useGraphifyStatus,
} from "@/api/hooks/graphify";
import {
  useSettingsQuery,
  useUpdateSettings,
} from "@/api/hooks/settings";

/**
 * Composes the graphify status + build mutation + the project-scoped
 * `graphify.enabled` setting so the onboarding step reads a single
 * shape — same hooks the settings UI uses, no duplication.
 */
export function useProjectGraphifySetup() {
  const status = useGraphifyStatus();
  const build = useGraphifyBuild();
  const settings = useSettingsQuery();
  const updateSettings = useUpdateSettings();

  const enabled = !!settings.data?.["graphify.enabled"];
  const exists = !!status.data?.exists;
  const building = build.isPending;

  const setEnabled = useCallback(
    (value: boolean) => {
      updateSettings.mutate({ "graphify.enabled": value });
    },
    [updateSettings],
  );

  const run = useCallback(() => build.mutateAsync(), [build]);

  return {
    enabled,
    exists,
    status: status.data ?? null,
    loading: status.isLoading,
    building,
    error:
      build.error instanceof Error
        ? build.error.message
        : build.data && !build.data.success
          ? (build.data.error ?? null)
          : null,
    setEnabled,
    run,
  };
}
