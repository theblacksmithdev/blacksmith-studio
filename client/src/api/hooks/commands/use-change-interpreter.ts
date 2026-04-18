import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

interface ChangeInterpreterInput {
  toolchainId: string;
  /** Absolute path to the new interpreter. Empty string clears the
   *  override so the toolchain falls back to auto-detection. */
  path: string;
}

/**
 * Override the toolchain's project-scope interpreter via project
 * settings. Writes `commands.<toolchainId>.resolution = <path>` which
 * the `CommandResolver` reads on every invocation.
 *
 * Invalidates env + availability queries so the inspector refreshes
 * to reflect the newly-pinned path.
 */
export function useChangeInterpreter() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: async ({ toolchainId, path }: ChangeInterpreterInput) => {
      const key = `commands.${toolchainId}.resolution`;
      return api.settings.update(projectId!, { [key]: path });
    },
    onSuccess: (_data, { toolchainId }) => {
      queryClient.invalidateQueries({
        queryKey: keys.commandEnv(toolchainId, "project"),
      });
      queryClient.invalidateQueries({
        queryKey: keys.commandAvailability(toolchainId, "project"),
      });
      queryClient.invalidateQueries({ queryKey: keys.settings });
    },
  });
}
