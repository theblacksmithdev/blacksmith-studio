import styled from "@emotion/styled";

/**
 * Left-panel primitives for the artifact library.
 *
 * Design aim: calmer than a raw list — header gives room to breathe,
 * rows behave like individual cards (rounded, hover lift), selected
 * state uses an accent strip rather than a full fill so the view still
 * reads as a list rather than a tab strip.
 */

export const Root = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  background: var(--studio-bg-sidebar);
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 18px 12px;
  flex-shrink: 0;
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TitleText = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--studio-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CountLabel = styled.span`
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: var(--studio-text-muted);
  letter-spacing: 0.02em;
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
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

export const SearchShell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border-radius: 9px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  transition: border-color 0.12s ease;

  &:focus-within {
    border-color: var(--studio-border-hover);
  }

  svg {
    flex-shrink: 0;
    color: var(--studio-text-muted);
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--studio-text-primary);
  font-family: inherit;
  font-size: 13px;
  &::placeholder {
    color: var(--studio-text-muted);
  }
`;

/* ── Filters ─────────────────────────────────────────────── */

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 18px 4px;
`;

export const FilterLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const FilterChip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-family: inherit;
  font-weight: 500;
  border: 1px solid
    ${(p) => (p.$active ? "transparent" : "var(--studio-border)")};
  background: ${(p) =>
    p.$active ? "var(--studio-text-primary)" : "transparent"};
  color: ${(p) =>
    p.$active ? "var(--studio-bg-main)" : "var(--studio-text-secondary)"};
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: ${(p) =>
      p.$active ? "transparent" : "var(--studio-border-hover)"};
    color: ${(p) =>
      p.$active ? "var(--studio-bg-main)" : "var(--studio-text-primary)"};
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 6px 18px 12px;
  flex-shrink: 0;
`;

/* ── List + rows ─────────────────────────────────────────── */

export const ListScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RowShell = styled.button<{ $selected?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px 12px 12px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: ${(p) =>
    p.$selected ? "var(--studio-bg-surface)" : "transparent"};
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.12s ease,
    border-color 0.12s ease;

  ${(p) =>
    p.$selected ? "border-color: var(--studio-border);" : ""}

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

export const RoleTile = styled.div`
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
  gap: 4px;
  min-width: 0;
`;

export const RowTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
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

export const RoleLabel = styled.span`
  text-transform: capitalize;
`;

export const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  font-size: 10px;
  font-weight: 500;
`;

/* ── Detail pane ──────────────────────────────────────────── */

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
  gap: 14px;
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`;

export const DetailHeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

export const DetailRoleTile = styled.div`
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

export const DetailTitleInput = styled.input`
  font-family: inherit;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--studio-text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 2px 0;
  margin: 0;
  width: 100%;
  border-bottom: 1px solid transparent;
  transition: border-color 0.12s ease;

  &:hover {
    border-bottom-color: var(--studio-border);
  }
  &:focus {
    border-bottom-color: var(--studio-border-hover);
  }
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

export const DetailIconButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: ${(p) =>
    p.$danger ? "var(--studio-text-muted)" : "var(--studio-text-muted)"};
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    color: ${(p) =>
      p.$danger ? "var(--studio-error, #c24242)" : "var(--studio-text-primary)"};
    background: var(--studio-bg-hover);
    border-color: var(--studio-border);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const DetailPillButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &[data-variant="primary"] {
    background: var(--studio-text-primary);
    border-color: var(--studio-text-primary);
    color: var(--studio-bg-main);
    &:hover {
      opacity: 0.88;
    }
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const TagsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const TagInput = styled.input`
  flex: 1;
  min-width: 120px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px dashed var(--studio-border);
  background: transparent;
  color: var(--studio-text-secondary);
  font-family: inherit;
  font-size: 11px;
  outline: none;

  &::placeholder {
    color: var(--studio-text-muted);
  }
  &:focus {
    border-style: solid;
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

export const DetailBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

export const DetailBodyInner = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px 48px;

  > * {
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  color: var(--studio-text-primary);
  font-size: 14px;
  line-height: 1.7;
`;

export const PreviewTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  padding: 22px 32px;
  border: none;
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 13px;
  line-height: 1.65;
  resize: none;
  outline: none;
`;

/** Deprecated shell kept so ArtifactPreviewDrawer still renders
 *  ArtifactDetail inside the drawer without its own chrome. */
export const PreviewBody = styled.div`
  padding: 16px 20px 24px;
  overflow-y: auto;
  color: var(--studio-text-primary);
  font-size: 13px;
  line-height: 1.65;
`;

/** Kept for external consumers (agent pages) that import this. */
export const ToolbarButton = DetailPillButton;
