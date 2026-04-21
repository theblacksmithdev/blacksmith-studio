import { useState } from "react";
import styled from "@emotion/styled";
import { ChevronRight } from "lucide-react";
import type { ScopeAggregate } from "@/api/modules/usage";
import { useUsageScopeDetail } from "@/api/hooks/usage";
import { formatTokens, formatRelative } from "./format";

interface ScopeRowProps {
  aggregate: ScopeAggregate;
}

/**
 * One expandable row in the history list. Clicking toggles the detail
 * drawer; detail is fetched lazily via the hook — no IPC call until the
 * user actually opens the row.
 */
export function ScopeRow({ aggregate }: ScopeRowProps) {
  const [open, setOpen] = useState(false);
  const { data: detail, isLoading } = useUsageScopeDetail(
    aggregate.scope,
    open ? aggregate.scopeId : null,
  );

  return (
    <Row>
      <Header onClick={() => setOpen((v) => !v)} data-open={open || undefined}>
        <Chevron data-open={open || undefined}>
          <ChevronRight size={14} />
        </Chevron>
        <Title>{aggregate.title}</Title>
        <Meta>
          <ModelPill>{aggregate.modelLabel}</ModelPill>
          <TurnCount>
            {aggregate.turnCount} turn{aggregate.turnCount === 1 ? "" : "s"}
          </TurnCount>
          <LastActivity>{formatRelative(aggregate.lastActivity)}</LastActivity>
        </Meta>
        <Total>{formatTokens(aggregate.total)}</Total>
      </Header>
      {open && (
        <Detail>
          {isLoading && !detail ? (
            <Muted>Loading turns…</Muted>
          ) : detail && detail.turns.length > 0 ? (
            <Turns>
              {detail.turns.map((t) => (
                <Turn key={t.id}>
                  <TurnTitle>{t.title ?? t.id}</TurnTitle>
                  <TurnMeta>
                    <span>i {formatTokens(t.breakdown.input)}</span>
                    <span>o {formatTokens(t.breakdown.output)}</span>
                    <span>cr {formatTokens(t.breakdown.cacheRead)}</span>
                    <span>cc {formatTokens(t.breakdown.cacheCreation)}</span>
                  </TurnMeta>
                  <TurnTotal>{formatTokens(t.total)}</TurnTotal>
                </Turn>
              ))}
            </Turns>
          ) : (
            <Muted>No turn data.</Muted>
          )}
        </Detail>
      )}
    </Row>
  );
}

const Row = styled.div`
  border-top: 1px solid var(--studio-border);

  &:last-child {
    border-bottom: 1px solid var(--studio-border);
  }
`;

const Header = styled.button`
  all: unset;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover,
  &[data-open] {
    background: var(--studio-bg-hover);
  }
`;

const Chevron = styled.span`
  display: inline-flex;
  color: var(--studio-text-muted);
  transition: transform 0.12s ease;

  &[data-open] {
    transform: rotate(90deg);
  }
`;

const Title = styled.span`
  font-size: 13px;
  color: var(--studio-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--studio-text-muted);
`;

const ModelPill = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--studio-bg-hover);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
`;

const TurnCount = styled.span`
  font-variant-numeric: tabular-nums;
`;

const LastActivity = styled.span`
  font-variant-numeric: tabular-nums;
`;

const Total = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
  min-width: 72px;
  text-align: right;
`;

const Detail = styled.div`
  padding: 0 16px 16px 42px;
`;

const Turns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Turn = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--studio-bg-surface);
  font-size: 12px;
`;

const TurnTitle = styled.span`
  color: var(--studio-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TurnMeta = styled.div`
  display: flex;
  gap: 10px;
  font-family: var(--studio-font-mono, monospace);
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`;

const TurnTotal = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--studio-text-primary);
  min-width: 56px;
  text-align: right;
`;

const Muted = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  padding: 4px 0;
`;
