import styled from "@emotion/styled";

/**
 * Shared primitives for the event-timeline row family. Kept narrow on
 * purpose — each event-type renderer composes these into its own shape
 * rather than pulling in a heavier layout system.
 */

export const TimelineRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  overflow-y: auto;
  font-size: 12px;
  color: var(--studio-text-secondary);
`;

export const RowShell = styled.div<{ tone?: "neutral" | "accent" | "error" }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${(p) =>
    p.tone === "accent"
      ? "var(--studio-bg-surface)"
      : p.tone === "error"
        ? "var(--studio-error-subtle, rgba(255,0,0,0.08))"
        : "transparent"};
  border: 1px solid
    ${(p) =>
      p.tone === "accent"
        ? "var(--studio-border)"
        : p.tone === "error"
          ? "var(--studio-error, #c24242)"
          : "transparent"};
`;

export const RowIcon = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--studio-text-muted);
  min-width: 80px;
  padding-top: 2px;
`;

export const RowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const RowTitle = styled.div`
  color: var(--studio-text-primary);
  font-weight: 500;
`;

export const RowMeta = styled.div`
  color: var(--studio-text-muted);
  font-size: 11px;
`;

export const Preformatted = styled.pre`
  margin: 0;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 180px;
  overflow: auto;
`;

export const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 12px;
`;
