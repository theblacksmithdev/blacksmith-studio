import { useToggleMcpServer, useTestMcpServer } from "@/api/hooks/mcp";
import type { McpServerEntry } from "@/api/modules/mcp";

/**
 * Per-server actions — test connection, toggle enabled, and test result state.
 * Used inside each McpServerRow so the page hook stays clean.
 */
export function useMcpServerItem(entry: McpServerEntry) {
  const toggleMutation = useToggleMcpServer();
  const testMutation = useTestMcpServer();

  const toggle = () =>
    toggleMutation.mutate({ name: entry.name, enabled: !entry.enabled });

  const test = () => testMutation.mutate(entry.name);

  const clearTestResult = () => testMutation.reset();

  return {
    isTesting: testMutation.isPending,
    testResult: testMutation.data,
    test,
    toggle,
    clearTestResult,
  };
}
