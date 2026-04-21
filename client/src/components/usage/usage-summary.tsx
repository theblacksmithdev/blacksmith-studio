import styled from "@emotion/styled";
import type { UsageHistory } from "@/api/modules/usage";
import { formatTokens } from "./format";

interface UsageSummaryProps {
  history: UsageHistory;
}

/**
 * Project-level header for the usage page: cumulative total + the four
 * token buckets + a chip per model that contributed.
 */
export function UsageSummary({ history }: UsageSummaryProps) {
  const b = history.breakdown;
  return (
    <Wrap>
      <TotalRow>
        <TotalNumber>{formatTokens(history.total)}</TotalNumber>
        <TotalLabel>tokens · all time</TotalLabel>
      </TotalRow>
      <Buckets>
        <Bucket>
          <BucketLabel>Input</BucketLabel>
          <BucketValue>{formatTokens(b.input)}</BucketValue>
        </Bucket>
        <Bucket>
          <BucketLabel>Output</BucketLabel>
          <BucketValue>{formatTokens(b.output)}</BucketValue>
        </Bucket>
        <Bucket>
          <BucketLabel>Cache read</BucketLabel>
          <BucketValue>{formatTokens(b.cacheRead)}</BucketValue>
        </Bucket>
        <Bucket>
          <BucketLabel>Cache create</BucketLabel>
          <BucketValue>{formatTokens(b.cacheCreation)}</BucketValue>
        </Bucket>
      </Buckets>
      {history.byModel.length > 0 && (
        <ModelStrip>
          {history.byModel.map((m) => (
            <ModelChip key={m.label}>
              <ChipLabel>{m.label}</ChipLabel>
              <ChipValue>{formatTokens(m.total)}</ChipValue>
            </ModelChip>
          ))}
        </ModelStrip>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TotalRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const TotalNumber = styled.span`
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
`;

const TotalLabel = styled.span`
  font-size: 13px;
  color: var(--studio-text-muted);
`;

const Buckets = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
`;

const Bucket = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--studio-border);
  border-radius: 10px;
  background: var(--studio-bg-surface);
`;

const BucketLabel = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const BucketValue = styled.span`
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--studio-text-primary);
`;

const ModelStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModelChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--studio-bg-hover);
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
`;
