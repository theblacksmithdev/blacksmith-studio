import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useGitStore } from "@/stores/git-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { queryKeys } from "@/api/query-keys";

/**
 * Subscribes to real-time git status changes scoped to the active project.
 * On project switch: clears stale state, hydrates fresh status, then listens
 * for push events — rejecting any that don't belong to the current project.
 * Re-fetches on window focus to cover any missed events.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const projectId = useActiveProjectId();
  const qc = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    const keys = queryKeys.forProject(projectId);
    const store = useGitStore.getState();

    // Clear stale state from the previous project immediately
    store.setStatus({
      initialized: false,
      branch: "",
      changedCount: 0,
      syncStatus: "unknown",
      ahead: 0,
      behind: 0,
    });

    // Hydrate initial status for this project
    api.git
      .status(projectId)
      .then((status) => {
        if (cancelled) return;
        qc.setQueryData(keys.gitStatus, status);
        useGitStore.getState().setStatus(status);
      })
      .catch(() => {});

    // Live subscription — only accept events for this project
    const unsub = api.git.onStatusChange((data) => {
      if (cancelled || data.projectId !== projectId) return;
      const { projectId: _id, ...status } = data;
      qc.setQueryData(keys.gitStatus, status);
      useGitStore.getState().setStatus(status);
    });

    // Re-fetch on window focus to cover any missed events
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        api.git
          .status(projectId)
          .then((status) => {
            if (cancelled) return;
            qc.setQueryData(keys.gitStatus, status);
            useGitStore.getState().setStatus(status);
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      unsub();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [projectId]); // qc is stable — intentionally excluded
}
