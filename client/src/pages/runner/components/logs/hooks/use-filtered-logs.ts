import { useState, useMemo } from "react";
import { useRunnerStore } from "@/stores/runner-store";

export function useFilteredLogs(activeConfigId?: string | null) {
  const logs = useRunnerStore((s) => s.logs);
  const clearLogs = useRunnerStore((s) => s.clearLogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [showTimestamps, setShowTimestamps] = useState(false);

  // Filter by active service + search term at display level
  const filteredLogs = useMemo(() => {
    let result = logs;
    if (activeConfigId) {
      result = result.filter((l) => l.configId === activeConfigId);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((l) => l.line.toLowerCase().includes(term));
    }
    return result;
  }, [logs, activeConfigId, searchTerm]);

  return {
    logs,
    filteredLogs,
    searchTerm,
    setSearchTerm,
    showTimestamps,
    toggleTimestamps: () => setShowTimestamps((v) => !v),
    clearLogs,
  };
}
