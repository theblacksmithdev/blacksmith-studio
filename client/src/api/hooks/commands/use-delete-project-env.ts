import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

interface DeleteEnvInput {
  toolchainId: string;
  /** Default: "project". Studio targets the shared
   *  `~/.blacksmith-studio/venv/`. */
  scope?: "project" | "studio";
}

/**
 * Tear down a scoped environment. Invalidates env + availability so
 * the inspector flips back to the "Not detected" state automatically.
 */
export function useDeleteProjectEnv() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (input: DeleteEnvInput | string) => {
      const { toolchainId, scope = "project" }: DeleteEnvInput =
        typeof input === "string" ? { toolchainId: input } : input;
      return api.commands.deleteEnv({
        projectId: scope === "project" ? projectId! : undefined,
        toolchainId,
        scope,
      });
    },
    onSuccess: (_data, variables) => {
      const { toolchainId, scope = "project" }: DeleteEnvInput =
        typeof variables === "string"
          ? { toolchainId: variables }
          : variables;
      queryClient.invalidateQueries({
        queryKey: keys.commandEnv(toolchainId, scope),
      });
      queryClient.invalidateQueries({
        queryKey: keys.commandAvailability(toolchainId, scope),
      });
    },
  });
}
