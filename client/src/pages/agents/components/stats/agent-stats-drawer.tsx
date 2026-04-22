import styled from "@emotion/styled";
import { Flex } from "@chakra-ui/react";
import { Layers } from "lucide-react";
import { Drawer } from "@/components/shared/ui";
import { useConversationStats } from "@/api/hooks/usage";
import type { AgentRollup } from "@/api/modules/usage";
import { ROLE_ICONS } from "@/components/shared/agent-role-icons";
import type { AgentRole } from "@/api/types";

interface AgentStatsDrawerProps {
  conversationId: string;
  onClose: () => void;
}

/**
 * Collective stats for a multi-agent conversation. Summary at the top
 * (cost + tokens + dispatch/task counts), bucket breakdown below, and
 * a per-agent rollup at the bottom sorted by cost.
 */
export function AgentStatsDrawer({
  conversationId,
  onClose,
}: AgentStatsDrawerProps) {
  const { data } = useConversationStats(conversationId);

  const hasData = !!data && data.total > 0;

  return (
    <Drawer
      title="Conversation stats"
      subtitle={
        data
          ? `${data.dispatchCount} dispatch${data.dispatchCount === 1 ? "" : "es"} · ${data.taskCount} task${data.taskCount === 1 ? "" : "s"}`
          : undefined
      }
      onClose={onClose}
      placement="end"
      size="sm"
    >
      {!hasData ? (
        <EmptyState>
          Send a message to the agent team to start tracking stats for this
          conversation.
        </EmptyState>
      ) : (
        <Flex direction="column" gap="22px">
          <Section>
            <SectionHeader>
              <SectionTitle>Total</SectionTitle>
            </SectionHeader>
            <FigureRow>
              <BigFigure>{formatCost(data.costUsd)}</BigFigure>
              <FigureSub>{formatTokens(data.total)} tokens</FigureSub>
            </FigureRow>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Token mix</SectionTitle>
            </SectionHeader>
            <Buckets>
              <Bucket label="Input" value={data.breakdown.input} />
              <Bucket label="Output" value={data.breakdown.output} />
              <Bucket label="Cache read" value={data.breakdown.cacheRead} />
              <Bucket
                label="Cache create"
                value={data.breakdown.cacheCreation}
              />
            </Buckets>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>By agent</SectionTitle>
              <AgentCount>{data.byAgent.length}</AgentCount>
            </SectionHeader>
            <AgentList>
              {data.byAgent.map((a) => (
                <AgentRow key={a.role} agent={a} />
              ))}
            </AgentList>
          </Section>
        </Flex>
      )}
    </Drawer>
  );
}

function AgentRow({ agent }: { agent: AgentRollup }) {
  const Icon = ROLE_ICONS[agent.role as AgentRole] ?? Layers;
  return (
    <Row>
      <RowIcon>
        <Icon size={14} />
      </RowIcon>
      <RowMain>
        <RowTitle>{formatRole(agent.role)}</RowTitle>
        <RowMeta>
          <span>
            {agent.taskCount} task{agent.taskCount === 1 ? "" : "s"}
          </span>
          <Dot />
          <Mono>{agent.modelLabel}</Mono>
        </RowMeta>
      </RowMain>
      <RowTotals>
        <RowCost>{formatCost(agent.costUsd)}</RowCost>
        <RowTokens>{formatTokens(agent.total)}</RowTokens>
      </RowTotals>
    </Row>
  );
}

function Bucket({ label, value }: { label: string; value: number }) {
  return (
    <BucketCard>
      <BucketLabel>{label}</BucketLabel>
      <BucketValue>{formatTokens(value)}</BucketValue>
    </BucketCard>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}

function formatCost(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 10) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function formatRole(role: string): string {
  return role
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
`;

const SectionTitle = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const AgentCount = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`;

const FigureRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const BigFigure = styled.span`
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  line-height: 1;
`;

const FigureSub = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`;

const Buckets = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const BucketCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
`;

const BucketLabel = styled.span`
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const BucketValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--studio-text-primary);
`;

const AgentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--studio-border);

  &:last-of-type {
    border-bottom: none;
  }
`;

const RowIcon = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
`;

const RowMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const RowTitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
`;

const RowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--studio-text-muted);
`;

const Dot = styled.span`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--studio-text-muted);
  opacity: 0.5;
`;

const Mono = styled.span`
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

const RowTotals = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
`;

const RowCost = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
`;

const RowTokens = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
`;

const EmptyState = styled.div`
  font-size: 13px;
  color: var(--studio-text-muted);
  padding: 8px 0;
`;
