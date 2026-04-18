import { useMemo, useState } from "react";
import { Cpu, Search, Terminal } from "lucide-react";
import {
  useCommandRunsQuery,
  useToolchainsQuery,
} from "@/api/hooks/commands";
import type { CommandRunRecord, CommandStatus } from "@/api/types";
import { Drawer } from "@/components/shared/drawer";
import { PanelEmptyState } from "@/components/shared/panel-empty-state";
import { Tooltip } from "@/components/shared/tooltip";
import { CommandRunRow } from "./command-run-row";
import { EnvInspector } from "./env-inspector";
import {
  CountLabel,
  Divider,
  FilterChip,
  FilterGroup,
  FilterLabel,
  FilterRow,
  Header,
  HeaderTop,
  IconButton,
  ListScroll,
  Root,
  SearchInput,
  SearchShell,
  TitleText,
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

interface CommandRunListProps {
  title?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * Left-panel command history — title + search + filter groups + list.
 * Selection is controlled; the caller (layout page) drives it from the
 * URL so rows deep-link.
 *
 * The env inspector ("which python? / which node?" debugging) is
 * tucked behind a Cpu icon in the header so the primary surface stays
 * clean — click the icon, a drawer slides in.
 */
export function CommandRunList({
  title = "Commands",
  selectedId = null,
  onSelect,
}: CommandRunListProps) {
  const { data: runs = [], isLoading } = useCommandRunsQuery({ limit: 200 });
  const { data: toolchains = [] } = useToolchainsQuery();

  const [search, setSearch] = useState("");
  const [toolchainFilter, setToolchainFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [envOpen, setEnvOpen] = useState(false);

  const filtered = useMemo<CommandRunRecord[]>(() => {
    const needle = search.trim().toLowerCase();
    return runs.filter((r) => {
      if (toolchainFilter && r.toolchainId !== toolchainFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        r.command.toLowerCase().includes(needle) ||
        (r.preset?.toLowerCase().includes(needle) ?? false) ||
        r.args.toLowerCase().includes(needle)
      );
    });
  }, [runs, toolchainFilter, statusFilter, search]);

  const filtersActive =
    search.trim().length > 0 ||
    toolchainFilter !== null ||
    statusFilter !== "all";
  const hasAny = runs.length > 0;

  return (
    <Root>
      <Header>
        <HeaderTop>
          <TitleText>{title}</TitleText>
          <CountLabel>{filtered.length}</CountLabel>
          <Tooltip content="Environment inspector">
            <IconButton
              onClick={() => setEnvOpen(true)}
              aria-label="Open environment inspector"
            >
              <Cpu size={13} />
            </IconButton>
          </Tooltip>
        </HeaderTop>
        <SearchShell>
          <Search size={13} />
          <SearchInput
            placeholder="Search commands…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchShell>
      </Header>

      {toolchains.length > 0 && (
        <FilterGroup>
          <FilterLabel>Toolchain</FilterLabel>
          <FilterRow>
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
          </FilterRow>
        </FilterGroup>
      )}

      <FilterGroup>
        <FilterLabel>Status</FilterLabel>
        <FilterRow>
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={`status:${f.value}`}
              $active={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </FilterChip>
          ))}
        </FilterRow>
      </FilterGroup>

      {hasAny && <Divider />}

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
            title={filtersActive ? "No matches" : "No commands yet"}
            description={
              filtersActive
                ? "No commands match the current filters. Clear them to see everything."
                : "Every process the app spawns — from the UI, agents, or internal tooling — appears here with full stdout/stderr and the resolved environment."
            }
          />
        ) : (
          filtered.map((run) => (
            <CommandRunRow
              key={run.id}
              run={run}
              selected={run.id === selectedId}
              onOpen={(id) => onSelect?.(id)}
            />
          ))
        )}
      </ListScroll>

      {envOpen && (
        <Drawer
          title="Environment inspector"
          onClose={() => setEnvOpen(false)}
          size="440px"
        >
          <div style={{ padding: "16px" }}>
            <EnvInspector />
          </div>
        </Drawer>
      )}
    </Root>
  );
}
