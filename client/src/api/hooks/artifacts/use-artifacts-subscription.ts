import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { ArtifactChange } from "@/api/types";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Keeps the artifacts query cache in sync with push events. On any
 * upsert/delete that belongs to the active project, invalidates the
 * list queries so every filter bucket picks up the change. The single
 * artifact and content queries are invalidated by id.
 */
export function useArtifactsSubscription(): void {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = api.artifacts.onChanged((change: ArtifactChange) => {
      if (change.kind === "upsert" && change.artifact.projectId !== projectId) {
        return;
      }
      if (change.kind === "delete" && change.projectId !== projectId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
      const id =
        change.kind === "upsert" ? change.artifact.id : change.id;
      queryClient.invalidateQueries({ queryKey: keys.artifact(id) });
      queryClient.invalidateQueries({ queryKey: keys.artifactContent(id) });
    });
    return unsubscribe;
  }, [queryClient, keys, projectId]);
}
