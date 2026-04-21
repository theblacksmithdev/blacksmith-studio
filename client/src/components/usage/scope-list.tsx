import styled from "@emotion/styled";
import type { ScopeAggregate } from "@/api/modules/usage";
import { ScopeRow } from "./scope-row";

interface ScopeListProps {
  title: string;
  aggregates: ScopeAggregate[];
  emptyLabel: string;
}

export function ScopeList({ title, aggregates, emptyLabel }: ScopeListProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        <SectionCount>{aggregates.length}</SectionCount>
      </SectionHeader>
      {aggregates.length === 0 ? (
        <Empty>{emptyLabel}</Empty>
      ) : (
        <Rows>
          {aggregates.map((a) => (
            <ScopeRow key={`${a.scope}:${a.scopeId}`} aggregate={a} />
          ))}
        </Rows>
      )}
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 0 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 24px 8px;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--studio-text-primary);
  margin: 0;
`;

const SectionCount = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
`;

const Empty = styled.div`
  padding: 16px 24px;
  font-size: 13px;
  color: var(--studio-text-muted);
`;
