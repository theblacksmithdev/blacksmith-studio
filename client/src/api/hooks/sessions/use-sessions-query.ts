import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";
import type { SessionListInput } from "@/api/types";

/**
 * Fetches the paginated list of sessions for the active project.
 */
export function useSessionsQuery(input?: SessionListInput) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: [...keys.sessions, input] as const,
    queryFn: () => api.sessions.list({ projectId: projectId!, ...input }),
    enabled: !!projectId,
  });
}
