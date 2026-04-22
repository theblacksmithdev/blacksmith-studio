import styled from "@emotion/styled";
import { Tooltip } from "@/components/shared/ui";
import type { SessionMeter, UsageScope } from "@/api/modules/usage";
import { useSessionMeter } from "@/api/hooks/usage";

interface ContextMeterProps {
  scope: UsageScope;
  scopeId: string | null | undefined;
}

/**
 * Live token meter for a single conversation scope. Consumes the
 * `useSessionMeter` hook — never calls `api.usage.*` directly — so
 * React Query owns caching and the channel subscription.
 *
 * Displays used / window with a thin progress bar and a hover tooltip
 * that breaks the total into input / output / cache-read / cache-create.
 */
export function ContextMeter({ scope, scopeId }: ContextMeterProps) {
  const { data } = useSessionMeter(scope, scopeId);
  if (!data) return null;

  const pct = data.window > 0 ? Math.min(data.used / data.window, 1) : 0;

  const sev = severity(pct);

  return (
    <Tooltip content={<Breakdown meter={data} />}>
      <Pill data-severity={sev}>
        <Label>{data.label}</Label>
        <Dot />
        <Figure>
          {formatTokens(data.used)}
          <Muted> / {formatTokens(data.window)}</Muted>
        </Figure>
        <Bar>
          <BarFill
            data-severity={sev}
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </Bar>
        <Percent>{Math.round(pct * 100)}%</Percent>
      </Pill>
    </Tooltip>
  );
}

function Breakdown({ meter }: { meter: SessionMeter }) {
  const t = meter.tokens;
  return (
    <BreakdownWrap>
      <BreakdownTitle>Last-turn context</BreakdownTitle>
      <Row label="Input" value={t.input} />
      <Row label="Output" value={t.output} />
      <Row label="Cache read" value={t.cacheRead} />
      <Row label="Cache create" value={t.cacheCreation} />
      <RowDivider />
      <Row label="Total" value={meter.used} bold />
      <Row label="Window" value={meter.window} muted />
      {meter.model && <ModelLine>{meter.model}</ModelLine>}
    </BreakdownWrap>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: number;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <RowEl data-bold={bold || undefined} data-muted={muted || undefined}>
      <span>{label}</span>
      <span>{formatTokens(value)}</span>
    </RowEl>
  );
}

function severity(pct: number): "ok" | "warn" | "alert" {
  if (pct >= 0.9) return "alert";
  if (pct >= 0.6) return "warn";
  return "ok";
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-size: 11px;
  line-height: 1;
  color: var(--studio-text-secondary);
  transition: border-color 0.15s ease, color 0.15s ease;

  &[data-severity="warn"] {
    border-color: var(--studio-warning);
    color: var(--studio-text-primary);
  }
  &[data-severity="alert"] {
    border-color: var(--studio-error);
    color: var(--studio-text-primary);
  }
`;

const Label = styled.span`
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--studio-text-primary);
`;

const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--studio-text-muted);
`;

const Figure = styled.span`
  font-variant-numeric: tabular-nums;
`;

const Muted = styled.span`
  color: var(--studio-text-muted);
`;

const Bar = styled.span`
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: var(--studio-bg-hover);
  overflow: hidden;
`;

const BarFill = styled.span`
  display: block;
  height: 100%;
  background: var(--studio-brand);
  transition: width 0.25s ease, background 0.15s ease;

  &[data-severity="warn"] {
    background: var(--studio-warning);
  }
  &[data-severity="alert"] {
    background: var(--studio-error);
  }
`;

const Percent = styled.span`
  font-variant-numeric: tabular-nums;
  color: var(--studio-text-muted);
`;

const BreakdownWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
  padding: 4px 0;
`;

const BreakdownTitle = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 2px;
`;

const RowEl = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;

  &[data-bold] {
    font-weight: 600;
  }
  &[data-muted] {
    color: var(--studio-text-muted);
  }
`;

const RowDivider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 2px 0;
`;

const ModelLine = styled.div`
  font-size: 10px;
  color: var(--studio-text-muted);
  margin-top: 4px;
  font-family: var(--studio-font-mono, monospace);
`;
