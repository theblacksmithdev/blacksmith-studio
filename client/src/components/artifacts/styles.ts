import styled from "@emotion/styled";

/**
 * Shared primitives for artifact library + conversation panel. Emotion
 * styled components on studio CSS vars so the design language stays
 * consistent with the rest of the app.
 */

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

export const ToolbarButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  color: var(--studio-text-primary);
  font-size: 12px;
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: var(--studio-border-hover);
  }
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
  padding: 12px 16px;
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
`;

export const RowMeta = styled.div`
  color: var(--studio-text-muted);
  font-size: 11px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const TagChip = styled.span`
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-size: 10px;
`;

export const PreviewBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  color: var(--studio-text-primary);
  font-size: 13px;
  line-height: 1.6;
`;

export const PreviewTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  line-height: 1.6;
  resize: none;
  outline: none;
`;
