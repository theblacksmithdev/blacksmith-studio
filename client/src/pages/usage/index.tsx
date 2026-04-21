import styled from "@emotion/styled";
import { useUsageHistory } from "@/api/hooks/usage";
import { UsageSummary, ScopeList } from "@/components/usage";

/**
 * Project-scoped token usage history. Top section is a cumulative
 * summary with per-model rollup; below are two expandable lists for
 * chat sessions and agent dispatches. Per-row detail drills into the
 * individual turns that produced each total.
 */
export default function UsagePage() {
  const { data, isLoading, error } = useUsageHistory();

  if (isLoading && !data) {
    return <Muted>Loading usage…</Muted>;
  }
  if (error || !data) {
    return <Muted>Could not load usage history.</Muted>;
  }

  return (
    <Scroll>
      <UsageSummary history={data} />
      <ScopeList
        title="Chat sessions"
        aggregates={data.chatSessions}
        emptyLabel="No chat sessions with recorded usage yet."
      />
      <ScopeList
        title="Agent dispatches"
        aggregates={data.agentDispatches}
        emptyLabel="No agent dispatches with recorded usage yet."
      />
      <BottomSpacer />
    </Scroll>
  );
}

const Scroll = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--studio-bg-main);
`;

const Muted = styled.div`
  padding: 32px;
  color: var(--studio-text-muted);
  font-size: 13px;
`;

const BottomSpacer = styled.div`
  height: 48px;
`;
