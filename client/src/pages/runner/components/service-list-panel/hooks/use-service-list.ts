import { useMemo } from "react";
import {
  useRunnerStore,
  selectServices,
  selectIsAnyActive,
  RunnerStatus,
  type RunnerService,
} from "@/stores/runner-store";
import { useRunnerConfigsQuery } from "@/api/hooks/runner";

/**
 * Merges runner configs (from DB) with live service status (from Zustand).
 */
export function useServiceList() {
  const { data: configs = [], isLoading } = useRunnerConfigsQuery();
  const liveServices = useRunnerStore(selectServices);
  const anyActive = useRunnerStore(selectIsAnyActive);

  const services: RunnerService[] = useMemo(
    () =>
      configs.map((cfg) => {
        const live = liveServices.find((s) => s.id === cfg.id);
        return {
          id: cfg.id,
          name: cfg.name,
          status: live?.status ?? RunnerStatus.Stopped,
          port: live?.port ?? null,
          previewUrl: live?.previewUrl ?? null,
          icon: cfg.icon ?? "terminal",
        };
      }),
    [configs, liveServices],
  );

  return {
    services,
    configs,
    isLoading,
    anyActive,
  };
}
