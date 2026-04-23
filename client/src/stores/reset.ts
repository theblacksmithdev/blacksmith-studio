import { useChatStore } from "./chat-store";
import { useFileStore } from "./file-store";
import { useRunnerStore } from "./runner-store";
import { useGitStore } from "./git-store";
import { useSessionStore } from "./session-store";
import { useAgentStore } from "./agent-store";

/**
 * Reset all project-scoped stores.
 * Call this when switching projects to clear stale state.
 *
 * Note: React Query caches are project-scoped via queryKeys.forProject(id),
 * so they don't need manual clearing — each project gets its own cache.
 */
export function resetProjectStores() {
  useChatStore.getState().clearPendingMessages();
  useSessionStore.getState().setActiveSession(null);
  useAgentStore.getState().clearAll();

  useFileStore.setState({
    tree: null,
    activeTab: null,
    openTabs: [],
    changedFiles: new Set(),
  });

  useRunnerStore.setState({ services: [], logs: [] });

  useGitStore.setState({
    initialized: false,
    branch: "",
    changedCount: 0,
    syncStatus: "unknown",
    ahead: 0,
    behind: 0,
  });
}
