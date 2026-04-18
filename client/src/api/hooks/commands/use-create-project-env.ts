import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

interface CreateProjectEnvInput {
  toolchainId: string;
  /** Toolchain-specific options. Python accepts `{ python: '3.12' }`
   *  (version) or `{ python: '/abs/path/to/python3' }` (path). */
  options?: Record<string, unknown>;
}

/**
 * Bootstrap a project-scoped environment for a toolchain that supports
 * it (Python → `.venv`). Invalidates env + availability queries so the
 * inspector refreshes to show the newly-created env.
 */
export function useCreateProjectEnv() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: ({ toolchainId, options }: CreateProjectEnvInput) =>
      api.commands.createProjectEnv({
        projectId: projectId!,
        toolchainId,
        options,
      }),
    onSuccess: (_data, { toolchainId }) => {
      queryClient.invalidateQueries({
        queryKey: keys.commandEnv(toolchainId, "project"),
      });
      queryClient.invalidateQueries({
        queryKey: keys.commandAvailability(toolchainId, "project"),
      });
    },
  });
}
