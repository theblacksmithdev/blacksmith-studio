import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";
import { settingsKeyForToolchain } from "./_settings-keys";

interface ChangeInterpreterInput {
  toolchainId: string;
  /** Absolute path to the new interpreter. Empty string clears the
   *  override so the toolchain falls back to auto-detection. */
  path: string;
  /** When "global", write to user-level defaults instead of the
   *  active project. Falls back to "project" for the common case. */
  scope?: "project" | "global";
}

/**
 * Override the toolchain's interpreter via settings.
 *
 * Writes to the canonical per-toolchain key (`python.pythonPath`,
 * `runner.nodePath`, or `commands.<id>.resolution`) so every consumer
 * — Runner, MCP, Claude CLI, terminal, CommandResolver — reads the
 * same storage.
 */
export function useChangeInterpreter() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: async ({
      toolchainId,
      path,
      scope = "project",
    }: ChangeInterpreterInput) => {
      const key = settingsKeyForToolchain(toolchainId);
      if (scope === "global") {
        return api.settings.updateGlobal({ [key]: path });
      }
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
