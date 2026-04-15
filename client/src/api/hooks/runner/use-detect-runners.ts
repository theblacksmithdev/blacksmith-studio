import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Auto-detects runner services in the project and seeds configs.
 * Returns the detected configs.
 */
export function useDetectRunners() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: [...keys.runnerConfigs, "detect"] as const,
    queryFn: () => api.runner.detectRunners(projectId!),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}
