import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";
import type { AgentRole } from "@/api/types";

/**
 * Runs a custom agent workflow with defined steps.
 */
export function useRunWorkflow() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: {
      name: string;
      steps: { role: AgentRole; prompt: string; dependsOn?: number }[];
      maxBudgetUsd?: number;
    }) => api.agents.runWorkflow(projectId!, data),
  });
}
