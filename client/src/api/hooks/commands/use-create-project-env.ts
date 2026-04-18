import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

interface CreateEnvInput {
  toolchainId: string;
  /** Default: "project". Studio targets the shared
   *  `~/.blacksmith-studio/venv/` used by Blacksmith's own tools. */
  scope?: "project" | "studio";
  /** Toolchain-specific options. Python accepts `{ python: '3.12' }`
   *  (version) or `{ python: '/abs/path/to/python3' }` (path). */
  options?: Record<string, unknown>;
}

/**
 * Bootstrap a scoped environment. Invalidates env + availability
 * queries for the targeted scope so the inspector refreshes.
 */
export function useCreateProjectEnv() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: ({ toolchainId, scope = "project", options }: CreateEnvInput) =>
      api.commands.createEnv({
        projectId: scope === "project" ? projectId! : undefined,
        toolchainId,
        scope,
        options,
      }),
    onSuccess: (_data, { toolchainId, scope = "project" }) => {
      queryClient.invalidateQueries({
        queryKey: keys.commandEnv(toolchainId, scope),
      });
      queryClient.invalidateQueries({
        queryKey: keys.commandAvailability(toolchainId, scope),
      });
    },
  });
}
