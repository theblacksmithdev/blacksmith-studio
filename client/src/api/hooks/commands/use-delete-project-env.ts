import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

/**
 * Tear down a project-scoped environment (Python → `.blacksmith/.venv`).
 * Invalidates env + availability so the inspector flips back to the
 * "Not detected" state automatically.
 */
export function useDeleteProjectEnv() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (toolchainId: string) =>
      api.commands.deleteProjectEnv({
        projectId: projectId!,
        toolchainId,
      }),
    onSuccess: (_data, toolchainId) => {
      queryClient.invalidateQueries({
        queryKey: keys.commandEnv(toolchainId, "project"),
      });
      queryClient.invalidateQueries({
        queryKey: keys.commandAvailability(toolchainId, "project"),
      });
    },
  });
}
