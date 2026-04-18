import styled from "@emotion/styled";

export const Root = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  background: var(--studio-bg-main);
`;

export const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`;

export const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
`;

export const CountPill = styled.div`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--studio-bg-surface);
  color: var(--studio-text-muted);
  border: 1px solid var(--studio-border);
`;

export const FilterRail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`;

export const FilterChip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid
    ${(p) =>
      p.$active ? "var(--studio-accent)" : "var(--studio-border)"};
  background: ${(p) =>
    p.$active ? "var(--studio-accent)" : "transparent"};
  color: ${(p) =>
    p.$active ? "var(--studio-accent-fg)" : "var(--studio-text-secondary)"};
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: var(--studio-border-hover);
  }
`;

export const ListScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const RowShell = styled.button`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-bottom: 1px solid var(--studio-border);
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
  }
`;

export const RowTitle = styled.div`
  color: var(--studio-text-primary);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowMeta = styled.div`
  color: var(--studio-text-muted);
  font-size: 11px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const StatusBadge = styled.span<{
  $status: "running" | "done" | "error" | "cancelled" | "timeout" | null;
}>`
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid
    ${(p) =>
      p.$status === "error" || p.$status === "timeout"
        ? "var(--studio-error, #c24242)"
        : "var(--studio-border)"};
  color: ${(p) =>
    p.$status === "error" || p.$status === "timeout"
      ? "var(--studio-error, #c24242)"
      : "var(--studio-text-secondary)"};
  background: ${(p) =>
    p.$status === "error" || p.$status === "timeout"
      ? "var(--studio-error-subtle, rgba(255,0,0,0.08))"
      : "var(--studio-bg-surface)"};
`;

export const Preformatted = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 280px;
  overflow: auto;
  color: var(--studio-text-primary);
`;

export const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow-y: auto;
`;

export const InspectorCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--studio-border);
  border-radius: 10px;
  background: var(--studio-bg-sidebar);
`;

export const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

export const FieldLabel = styled.span`
  color: var(--studio-text-muted);
  min-width: 84px;
`;

export const FieldValue = styled.span`
  color: var(--studio-text-primary);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  word-break: break-all;
`;

export const Select = styled.select`
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;

  &:focus {
    border-color: var(--studio-border-hover);
  }
`;
