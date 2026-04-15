import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Starts a project build from requirements.
 */
export function useAgentBuild() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: { requirements: string; maxBudgetUsd?: number }) =>
      api.agents.build(projectId!, data),
  });
}
