import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGitStore } from "@/stores/git-store";
import {
  useActiveProjectId,
  useChannelEffect,
} from "@/api/hooks/_shared";
import { useGitStatusQuery } from "@/api/hooks/git";
import { queryKeys } from "@/api/query-keys";

/**
 * Subscribes to real-time git status changes scoped to the active project.
 * - Hydrates via useGitStatusQuery (React Query).
 * - Listens for push events via useChannelEffect, rejecting any that
 *   don't belong to the current project.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const projectId = useActiveProjectId();
  const qc = useQueryClient();
  const statusQuery = useGitStatusQuery();

  // Clear stale store state on project switch
  useEffect(() => {
    if (!projectId) return;
    useGitStore.getState().setStatus({
      initialized: false,
      branch: "",
      changedCount: 0,
      syncStatus: "unknown",
      ahead: 0,
      behind: 0,
    });
  }, [projectId]);

  // Mirror query data into the store
  useEffect(() => {
    if (statusQuery.data) {
      useGitStore.getState().setStatus(statusQuery.data);
    }
  }, [statusQuery.data]);

  // Listen for live events
  useChannelEffect("git:statusChange", (data) => {
    if (!projectId || data.projectId !== projectId) return;
    const { projectId: _id, ...status } = data;
    const keys = queryKeys.forProject(projectId);
    qc.setQueryData(keys.gitStatus, status);
    useGitStore.getState().setStatus(status);
  });

  // Refetch on visibility change to cover any missed events
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        statusQuery.refetch();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [statusQuery]);
}
