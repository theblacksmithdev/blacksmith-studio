import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Resumes a paused project build.
 */
export function useAgentBuildResume() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (maxBudgetUsd?: number) =>
      api.agents.buildResume(projectId!, maxBudgetUsd),
  });
}
