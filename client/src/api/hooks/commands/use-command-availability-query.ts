import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { CommandScope } from "@/api/types";
import { useActiveProjectId, useProjectKeys } from "../_shared";

export function useCommandAvailabilityQuery(
  toolchainId: string,
  scope: CommandScope,
) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();
  return useQuery({
    queryKey: keys.commandAvailability(toolchainId, scope),
    queryFn: () =>
      api.commands.checkAvailable({
        projectId: projectId!,
        toolchainId,
        scope,
      }),
    enabled: !!projectId,
  });
}
