import { Flex, Box } from "@chakra-ui/react";
import { useRunnerStore } from "@/stores/runner-store";
import { spacing } from "@/components/shared/ui";
import { MONO_FONT } from "../runner-primitives";
import { LogLine, LogsToolbar, LogsEmpty } from "./components";
import { useFilteredLogs, useAutoScroll } from "./hooks";

interface RunnerLogsProps {
  externalFilter?: string | null;
  toolbarTrailing?: React.ReactNode;
}

export function RunnerLogs({
  externalFilter,
  toolbarTrailing,
}: RunnerLogsProps) {
  const clearLogs = useRunnerStore((s) => s.clearLogs);

  const {
    logs,
    filteredLogs,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    showTimestamps,
    toggleTimestamps,
    serviceNames,
  } = useFilteredLogs(externalFilter);

  const { bottomRef, containerRef, autoScroll, handleScroll, scrollToBottom } =
    useAutoScroll([filteredLogs]);

  return (
    <Flex direction="column" css={{ height: "100%" }}>
      <LogsToolbar
        filter={filter}
        onFilterChange={setFilter}
        serviceNames={serviceNames}
        count={filteredLogs.length}
        autoScroll={autoScroll}
        onScrollToBottom={scrollToBottom}
        onClear={clearLogs}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showTimestamps={showTimestamps}
        onToggleTimestamps={toggleTimestamps}
        trailing={toolbarTrailing}
      />

      <Box
        ref={containerRef}
        onScroll={handleScroll}
        css={{
          flex: 1,
          overflowY: "auto",
          padding: `${spacing.xs} 0`,
          fontFamily: MONO_FONT,
          fontSize: "13px",
          lineHeight: "18px",
          background: "var(--studio-bg-main)",
        }}
      >
        {filteredLogs.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            css={{ height: "100%", width: "100%" }}
          >
            <LogsEmpty hasLogs={logs.length > 0} searchTerm={searchTerm} />
          </Flex>
        ) : (
          filteredLogs.map((entry, i) => (
            <LogLine key={i} entry={entry} showTimestamp={showTimestamps} />
          ))
        )}
        <div ref={bottomRef} />
      </Box>
    </Flex>
  );
}
