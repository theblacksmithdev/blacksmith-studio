import styled from "@emotion/styled";

/**
 * Commands console primitives — premium twin of the artifacts page.
 *
 * Left panel sits on `--studio-bg-sidebar`, detail pane on
 * `--studio-bg-main` so the selected run reads as the focal surface.
 */

/* ── Left panel shell ────────────────────────────────────── */

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

/* ── Filter groups ───────────────────────────────────────── */

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

/* ── List rows ───────────────────────────────────────────── */

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

/* ── Env inspector ───────────────────────────────────────── */

export const InspectorRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const InspectorHint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--studio-text-muted);
`;

export const ScopeCard = styled.div<{ $tone: "project" | "studio" }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--studio-border);
  border-radius: 12px;
  background: ${(p) =>
    p.$tone === "project"
      ? "var(--studio-bg-main)"
      : "var(--studio-bg-sidebar)"};
`;

export const ScopeCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ScopeIconTile = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  flex-shrink: 0;
`;

export const ScopeLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--studio-text-muted);
`;

export const ScopeDisplayName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--studio-text-primary);
  line-height: 1.3;
  letter-spacing: -0.005em;
`;

export const ScopeVersion = styled.span`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11px;
  color: var(--studio-text-muted);
  font-weight: 500;
`;

export const ScopeFields = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 6px 10px;
  padding-top: 10px;
  border-top: 1px solid var(--studio-border);
`;

export const ScopeFieldLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  padding-top: 2px;
`;

export const ScopeFieldValue = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11px;
  color: var(--studio-text-primary);
  word-break: break-all;
  line-height: 1.5;
`;

export const ScopeNotDetected = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  font-style: italic;
  padding: 4px 0;
`;

export const ToolchainChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const CardActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--studio-border);
`;

export const CardActionSpacer = styled.div`
  flex: 1;
`;

export const PillButton = styled.button`
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
  align-self: flex-start;

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
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* Backwards-compat aliases — legacy consumers imported these. */
export const InspectorCard = ScopeCard;
export const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
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
