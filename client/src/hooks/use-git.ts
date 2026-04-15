import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useGitStore } from "@/stores/git-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { queryKeys } from "@/api/query-keys";

/**
 * Subscribes to real-time git status changes from the main process.
 * On each push event, updates both the React Query cache and the Zustand store.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const projectId = useActiveProjectId();
  const qc = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const keys = queryKeys.forProject(projectId);

    const unsub = api.git.onStatusChange((data) => {
      qc.setQueryData(keys.gitStatus, data);
      useGitStore.getState().setStatus(data as any);
    });

    return () => unsub();
  }, [projectId, qc]);
}
