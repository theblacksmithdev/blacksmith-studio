import styled from "@emotion/styled";

/* ── List rows ───────────────────────────────────────────── */

export const RowShell = styled.button<{ $selected?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 10px 12px 10px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: ${(p) =>
    p.$selected ? "var(--studio-bg-surface)" : "transparent"};
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.12s ease,
    border-color 0.12s ease;

  ${(p) => (p.$selected ? "border-color: var(--studio-border);" : "")}

  &::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 14px;
    bottom: 14px;
    width: 2px;
    border-radius: 999px;
    background: ${(p) =>
      p.$selected ? "var(--studio-accent)" : "transparent"};
    transition: background 0.12s ease;
  }

  &:hover {
    background: ${(p) =>
      p.$selected ? "var(--studio-bg-surface)" : "var(--studio-bg-hover)"};
  }

  &:focus-visible {
    outline: none;
    border-color: var(--studio-border-hover);
  }
`;

export const ToolchainTile = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  flex-shrink: 0;
`;

export const RowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

export const RowTitle = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--studio-text-muted);
  line-height: 1.3;
`;

export const MetaDot = styled.span`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
`;

export const StatusBadge = styled.span<{
  $status:
    | "running"
    | "done"
    | "error"
    | "cancelled"
    | "timeout"
    | null
    | undefined;
}>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid
    ${(p) =>
      p.$status === "error" || p.$status === "timeout"
        ? "var(--studio-error, #c24242)"
        : "var(--studio-border)"};
  color: ${(p) =>
    p.$status === "error" || p.$status === "timeout"
      ? "var(--studio-error, #c24242)"
      : p.$status === "running"
        ? "var(--studio-text-primary)"
        : "var(--studio-text-secondary)"};
  background: ${(p) =>
    p.$status === "error" || p.$status === "timeout"
      ? "var(--studio-error-subtle, rgba(255,0,0,0.08))"
      : p.$status === "running"
        ? "var(--studio-bg-main)"
        : "var(--studio-bg-surface)"};
`;

/* ── Detail pane ─────────────────────────────────────────── */

export const DetailRoot = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  background: var(--studio-bg-main);
`;

export const DetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 28px 18px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`;

export const DetailHeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

export const DetailTile = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-primary);
  flex-shrink: 0;
`;

export const DetailTitleBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const DetailTitle = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 15px;
  font-weight: 500;
  color: var(--studio-text-primary);
  letter-spacing: -0.005em;
  line-height: 1.4;
  word-break: break-all;
`;

export const DetailMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--studio-text-muted);
`;

export const DetailActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const DetailIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    color: var(--studio-text-primary);
    background: var(--studio-bg-hover);
    border-color: var(--studio-border);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const DetailBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px 28px 40px;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px 18px;
  padding: 14px 16px;
  border: 1px solid var(--studio-border);
  border-radius: 10px;
  background: var(--studio-bg-surface);
  margin-bottom: 22px;
`;

export const FieldLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  padding-top: 2px;
`;

export const FieldValue = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  color: var(--studio-text-primary);
  word-break: break-all;
  line-height: 1.5;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
`;

export const Preformatted = styled.pre`
  margin: 0 0 18px;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--studio-text-primary);
`;

export const MutedEmpty = styled.div`
  margin: 0 0 18px;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--studio-bg-sidebar);
  border: 1px dashed var(--studio-border);
  color: var(--studio-text-muted);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  font-style: italic;
`;
