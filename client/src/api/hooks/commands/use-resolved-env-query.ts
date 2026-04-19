import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { CommandScope } from "@/api/types";
import { useActiveProjectId, useProjectKeys } from "../_shared";

/**
 * "Which python?" / "which node?" inspector.
 *
 * For `scope: "project"` the active project is required; for
 * `scope: "studio"` the query runs against `~/.blacksmith-studio/`
 * without needing a project — so onboarding can probe whether the
 * Studio venv already exists before any project is registered.
 */
export function useResolvedEnvQuery(
  toolchainId: string,
  scope: CommandScope,
) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();
  const isStudio = scope === "studio";
  return useQuery({
    queryKey: keys.commandEnv(toolchainId, scope),
    queryFn: () =>
      api.commands.resolveEnv({
        projectId: isStudio ? undefined : projectId!,
        toolchainId,
        scope,
      }),
    enabled: isStudio || !!projectId,
  });
}
