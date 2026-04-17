import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";
import type { AgentRole } from "@/api/types";

/**
 * Executes a prompt directly on a single agent.
 */
export function useAgentExecute() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: { prompt: string; role?: AgentRole }) =>
      api.multiAgents.execute(projectId!, data),
  });
}
