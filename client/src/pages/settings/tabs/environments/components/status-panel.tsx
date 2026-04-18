import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { AlertTriangle } from "lucide-react";

/**
 * Two-row status panel rendered at the top of each environment
 * section. Surfaces the actual binary path + venv path (so users can
 * copy them) alongside health / context tags — the information users
 * were previously hunting for inside action-row button labels.
 *
 * Lives inside a `SettingsSection` body, so colors match the rest of
 * the settings chrome: `bg-main` for the recessed panel, `bg-surface`
 * for the inner tiles.
 */

interface StatusPanelProps {
  children: ReactNode;
}

export function StatusPanel({ children }: StatusPanelProps) {
  return <PanelShell>{children}</PanelShell>;
}

interface StatusRowProps {
  icon: ReactNode;
  label: string;
  path: string;
  tag?: StatusTagDescriptor;
}

export interface StatusTagDescriptor {
  tone: "ok" | "error" | "muted";
  label: string;
  /** Optional leading icon/dot override. The `ok` tone defaults to a
   *  pulsing dot; `error` to a warning glyph. */
  icon?: ReactNode;
}

export function StatusRow({ icon, label, path, tag }: StatusRowProps) {
  return (
    <Row>
      <IconTile>{icon}</IconTile>
      <Main>
        <Label>{label}</Label>
        <Path>{path}</Path>
      </Main>
      {tag && <StatusTag tag={tag} />}
    </Row>
  );
}

function StatusTag({ tag }: { tag: StatusTagDescriptor }) {
  return (
    <Tag $tone={tag.tone}>
      {tag.icon ??
        (tag.tone === "ok" ? (
          <Dot />
        ) : tag.tone === "error" ? (
          <AlertTriangle size={10} />
        ) : null)}
      {tag.label}
    </Tag>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const PanelShell = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 12px 6px;
  border: 1px solid var(--studio-border);
  border-radius: 9px;
  background: var(--studio-bg-main);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--studio-border);
  }
`;

const IconTile = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.03);
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--studio-text-muted);
`;

const Path = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11.5px;
  color: var(--studio-text-primary);
  word-break: break-all;
  line-height: 1.4;
`;

const Tag = styled.span<{ $tone: "ok" | "error" | "muted" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  flex-shrink: 0;
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: ${(p) =>
    p.$tone === "error"
      ? "var(--studio-error, #c24242)"
      : p.$tone === "ok"
        ? "var(--studio-text-primary)"
        : "var(--studio-text-muted)"};
  background: ${(p) =>
    p.$tone === "error"
      ? "var(--studio-error-subtle, rgba(194, 66, 66, 0.08))"
      : "var(--studio-bg-surface)"};
  border: 1px solid
    ${(p) =>
      p.$tone === "error"
        ? "var(--studio-error, #c24242)"
        : "var(--studio-border)"};
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.03),
    0 1px 0 0 rgba(0, 0, 0, 0.03);
`;

const Dot = styled.span`
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--studio-accent, var(--studio-text-primary));
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);

  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0;
    animation: status-dot-pulse 2.4s ease-out infinite;
  }

  @keyframes status-dot-pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.35;
    }
    70% {
      transform: scale(2);
      opacity: 0;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
