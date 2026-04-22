import { useMemo } from "react";
import styled from "@emotion/styled";
import type {
  ScopeAggregate,
  TokenBreakdown,
  UsageHistory,
} from "@/api/modules/usage";
import { ScopeRow } from "./scope-row";
import { formatTokens } from "./format";

interface ModelDetailProps {
  history: UsageHistory;
  selectedModel: string | null;
}

/**
 * Right-pane detail view for the usage page. Renders either the
 * project-wide rollup (when "All" is selected) or a single model's
 * view (filtered sessions + dispatches). Same visual grammar either
 * way so switching between them feels like zooming, not jumping.
 */
export function ModelDetail({ history, selectedModel }: ModelDetailProps) {
  const filtered = useMemo(
    () => filterByModel(history, selectedModel),
    [history, selectedModel],
  );

  const headerLabel = selectedModel
    ? (history.byModel.find((m) => m.model === selectedModel)?.label ??
      selectedModel)
    : "All models";

  const headerSub = selectedModel
    ? `Usage across chat sessions and agent dispatches that used ${headerLabel}.`
    : "Cumulative usage across every model in this project.";

  if (filtered.total === 0) {
    return (
      <Root>
        <DetailHeader label={headerLabel} sub={headerSub} total={0} />
        <EmptyState>
          <EmptyTitle>No recorded usage</EmptyTitle>
          <EmptyBody>
            {selectedModel
              ? "This model hasn't recorded any turns in this project yet."
              : "Send a chat or dispatch an agent to start tracking token usage."}
          </EmptyBody>
        </EmptyState>
      </Root>
    );
  }

  return (
    <Root>
      <DetailHeader label={headerLabel} sub={headerSub} total={filtered.total} />
      <Scroll>
        <Content>
          <Section>
            <SectionLabel>Token mix</SectionLabel>
            <Buckets breakdown={filtered.breakdown} />
          </Section>

          {!selectedModel && history.byModel.length > 1 && (
            <Section>
              <SectionLabel>By model</SectionLabel>
              <ModelRollupStrip>
                {history.byModel.map((m) => (
                  <Chip key={m.label}>
                    <ChipLabel>{m.label}</ChipLabel>
                    <ChipValue>{formatTokens(m.total)}</ChipValue>
                  </Chip>
                ))}
              </ModelRollupStrip>
            </Section>
          )}

          <ListSection>
            <SectionLabel>
              Chat sessions{" "}
              <SectionCount>{filtered.chatSessions.length}</SectionCount>
            </SectionLabel>
            {filtered.chatSessions.length === 0 ? (
              <Muted>No chat activity for this selection.</Muted>
            ) : (
              <Rows>
                {filtered.chatSessions.map((a) => (
                  <ScopeRow key={`chat:${a.scopeId}`} aggregate={a} />
                ))}
              </Rows>
            )}
          </ListSection>

          <ListSection>
            <SectionLabel>
              Agent dispatches{" "}
              <SectionCount>{filtered.agentDispatches.length}</SectionCount>
            </SectionLabel>
            {filtered.agentDispatches.length === 0 ? (
              <Muted>No agent dispatches for this selection.</Muted>
            ) : (
              <Rows>
                {filtered.agentDispatches.map((a) => (
                  <ScopeRow key={`agent:${a.scopeId}`} aggregate={a} />
                ))}
              </Rows>
            )}
          </ListSection>

          <BottomSpacer />
        </Content>
      </Scroll>
    </Root>
  );
}

interface HeaderProps {
  label: string;
  sub: string;
  total: number;
}

function DetailHeader({ label, sub, total }: HeaderProps) {
  return (
    <Header>
      <HeaderInner>
        <HeaderTop>
          <HeaderTitle>{label}</HeaderTitle>
          <HeaderTotal>
            <TotalNumber>{formatTokens(total)}</TotalNumber>
            <TotalSuffix>tokens</TotalSuffix>
          </HeaderTotal>
        </HeaderTop>
        <HeaderSub>{sub}</HeaderSub>
      </HeaderInner>
    </Header>
  );
}

function Buckets({ breakdown }: { breakdown: TokenBreakdown }) {
  const rows: Array<{ key: keyof TokenBreakdown; label: string }> = [
    { key: "input", label: "Input" },
    { key: "output", label: "Output" },
    { key: "cacheRead", label: "Cache read" },
    { key: "cacheCreation", label: "Cache create" },
  ];
  const total =
    breakdown.input +
    breakdown.output +
    breakdown.cacheRead +
    breakdown.cacheCreation;

  return (
    <BucketGrid>
      {rows.map((r) => {
        const value = breakdown[r.key];
        const pct = total > 0 ? value / total : 0;
        return (
          <Bucket key={r.key}>
            <BucketLabel>{r.label}</BucketLabel>
            <BucketValue>{formatTokens(value)}</BucketValue>
            <BucketBar>
              <BucketFill style={{ width: `${Math.round(pct * 100)}%` }} />
            </BucketBar>
            <BucketPct>{Math.round(pct * 100)}%</BucketPct>
          </Bucket>
        );
      })}
    </BucketGrid>
  );
}

function filterByModel(
  history: UsageHistory,
  selectedModel: string | null,
): {
  total: number;
  breakdown: TokenBreakdown;
  chatSessions: ScopeAggregate[];
  agentDispatches: ScopeAggregate[];
} {
  if (!selectedModel) {
    return {
      total: history.total,
      breakdown: history.breakdown,
      chatSessions: history.chatSessions,
      agentDispatches: history.agentDispatches,
    };
  }
  const chatSessions = history.chatSessions.filter(
    (a) => a.model === selectedModel,
  );
  const agentDispatches = history.agentDispatches.filter(
    (a) => a.model === selectedModel,
  );
  const breakdown = sumBreakdown(
    [...chatSessions, ...agentDispatches].map((a) => a.breakdown),
  );
  const total =
    breakdown.input +
    breakdown.output +
    breakdown.cacheRead +
    breakdown.cacheCreation;
  return { total, breakdown, chatSessions, agentDispatches };
}

function sumBreakdown(bs: TokenBreakdown[]): TokenBreakdown {
  return bs.reduce(
    (acc, b) => ({
      input: acc.input + b.input,
      output: acc.output + b.output,
      cacheRead: acc.cacheRead + b.cacheRead,
      cacheCreation: acc.cacheCreation + b.cacheCreation,
    }),
    { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 },
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: var(--studio-bg-main);
`;

const CONTENT_MAX_WIDTH = 960;

const Header = styled.div`
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`;

const HeaderInner = styled.div`
  max-width: ${CONTENT_MAX_WIDTH}px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
`;

const HeaderTotal = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const TotalNumber = styled.span`
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
`;

const TotalSuffix = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
`;

const HeaderSub = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--studio-text-muted);
  max-width: 640px;
`;

const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const Content = styled.div`
  max-width: ${CONTENT_MAX_WIDTH}px;
  margin: 0 auto;
  padding: 0 28px;
`;

const Section = styled.section`
  padding: 20px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ListSection = styled.section`
  padding: 20px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const SectionCount = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: normal;
  text-transform: none;
  font-weight: 500;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
`;

const Muted = styled.div`
  padding: 12px 0;
  font-size: 12px;
  color: var(--studio-text-muted);
`;

const BucketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
`;

const Bucket = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto auto;
  gap: 4px 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
`;

const BucketLabel = styled.span`
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  grid-column: 1;
`;

const BucketValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--studio-text-primary);
  grid-column: 1 / -1;
`;

const BucketBar = styled.span`
  grid-column: 1;
  height: 2px;
  border-radius: 1px;
  background: var(--studio-bg-hover);
  overflow: hidden;
`;

const BucketFill = styled.span`
  display: block;
  height: 100%;
  background: var(--studio-brand);
  opacity: 0.75;
  transition: width 0.2s ease;
`;

const BucketPct = styled.span`
  grid-column: 2;
  grid-row: 3;
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  align-self: center;
`;

const ModelRollupStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-size: 11px;
`;

const ChipLabel = styled.span`
  font-weight: 600;
  color: var(--studio-text-primary);
`;

const ChipValue = styled.span`
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 48px;
`;

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
`;

const EmptyBody = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  text-align: center;
  max-width: 360px;
`;

const BottomSpacer = styled.div`
  height: 48px;
`;
