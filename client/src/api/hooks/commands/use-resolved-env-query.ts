import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { CommandScope } from "@/api/types";
import { useActiveProjectId, useProjectKeys } from "../_shared";

/** "Which python?" / "which node?" inspector for settings UIs. */
export function useResolvedEnvQuery(
  toolchainId: string,
  scope: CommandScope,
) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();
  return useQuery({
    queryKey: keys.commandEnv(toolchainId, scope),
    queryFn: () =>
      api.commands.resolveEnv({
        projectId: projectId!,
        toolchainId,
        scope,
      }),
    enabled: !!projectId,
  });
}
