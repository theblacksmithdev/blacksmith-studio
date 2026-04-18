import { useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Terminal } from "lucide-react";
import {
  useCommandRunsQuery,
  useToolchainsQuery,
} from "@/api/hooks/commands";
import type { CommandRunRecord, CommandStatus } from "@/api/types";
import { PanelEmptyState } from "@/components/shared/panel-empty-state";
import { CommandRunRow } from "./command-run-row";
import { CommandRunDrawer } from "./command-run-drawer";
import { EnvInspector } from "./env-inspector";
import {
  CountPill,
  FilterChip,
  FilterRail,
  HeaderBar,
  ListScroll,
  Root,
  Title,
} from "./styles";

const STATUS_FILTERS: Array<{
  label: string;
  value: CommandStatus | "all";
}> = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Done", value: "done" },
  { label: "Error", value: "error" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Timeout", value: "timeout" },
];

/**
 * Project-wide commands console. Combines:
 *   · run history list (filters: toolchain + status),
 *   · selectable run drawer showing full stdout/stderr,
 *   · env inspector for "which python / node?" debugging.
 */
export function CommandsPage() {
  const { data: runs = [], isLoading } = useCommandRunsQuery({ limit: 200 });
  const { data: toolchains = [] } = useToolchainsQuery();

  const [toolchainFilter, setToolchainFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const filtered = useMemo<CommandRunRecord[]>(
    () =>
      runs.filter(
        (r) =>
          (!toolchainFilter || r.toolchainId === toolchainFilter) &&
          (statusFilter === "all" || r.status === statusFilter),
      ),
    [runs, toolchainFilter, statusFilter],
  );

  return (
    <Root>
      <HeaderBar>
        <Flex align="center" gap="10px">
          <Terminal
            size={14}
            style={{ color: "var(--studio-text-muted)" }}
          />
          <Title>Commands</Title>
          <CountPill>{filtered.length}</CountPill>
        </Flex>
      </HeaderBar>

      <FilterRail>
        {toolchains.map((tc) => (
          <FilterChip
            key={`tc:${tc.id}`}
            $active={toolchainFilter === tc.id}
            onClick={() =>
              setToolchainFilter(toolchainFilter === tc.id ? null : tc.id)
            }
          >
            {tc.displayName}
          </FilterChip>
        ))}
        <div style={{ width: "12px" }} />
        {STATUS_FILTERS.map((f) => (
          <FilterChip
            key={`status:${f.value}`}
            $active={statusFilter === f.value}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </FilterChip>
        ))}
      </FilterRail>

      <Flex css={{ padding: "16px" }}>
        <EnvInspector />
      </Flex>

      <ListScroll>
        {isLoading ? (
          <PanelEmptyState
            icon={<Terminal size={22} />}
            title="Loading commands"
            description="Reading the command audit trail for this project."
          />
        ) : filtered.length === 0 ? (
          <PanelEmptyState
            icon={<Terminal size={22} />}
            title="No commands yet"
            description={
              runs.length === 0
                ? "Every process the app spawns (from the UI, agents, or internal tooling) appears here with full stdout/stderr and the resolved environment."
                : "No commands match the current filters. Clear them to see everything."
            }
          />
        ) : (
          filtered.map((run) => (
            <CommandRunRow key={run.id} run={run} onOpen={setSelectedRunId} />
          ))
        )}
      </ListScroll>

      {selectedRunId && (
        <CommandRunDrawer
          runId={selectedRunId}
          onClose={() => setSelectedRunId(null)}
        />
      )}
    </Root>
  );
}
