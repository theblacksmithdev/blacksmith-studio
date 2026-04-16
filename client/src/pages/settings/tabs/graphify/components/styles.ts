import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";

/* ── Animations ── */

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.4; }`;
export const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

/* ── Shared Buttons ── */

export const ActionBtn = styled.button<{ $variant?: "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid
    ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-border)"};
  background: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error-subtle)"
      : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error)"
      : "var(--studio-text-secondary)"};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    border-color: ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-border-hover)"};
    color: ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-text-primary)"};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.12s ease;
  &:hover {
    opacity: 0.85;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CompactBtn = styled.button<{
  $primary?: boolean;
  $danger?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  border: 1px solid
    ${(p) =>
      p.$primary
        ? "var(--studio-accent)"
        : p.$danger
          ? "var(--studio-error)"
          : "var(--studio-border)"};
  background: ${(p) =>
    p.$primary
      ? "var(--studio-accent)"
      : p.$danger
        ? "transparent"
        : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$primary
      ? "var(--studio-accent-fg)"
      : p.$danger
        ? "var(--studio-error)"
        : "var(--studio-text-secondary)"};
  &:hover {
    opacity: ${(p) => (p.$primary ? 0.85 : 1)};
    border-color: ${(p) =>
      p.$danger ? "var(--studio-error)" : "var(--studio-border-hover)"};
    color: ${(p) =>
      p.$primary
        ? "var(--studio-accent-fg)"
        : p.$danger
          ? "var(--studio-error)"
          : "var(--studio-text-primary)"};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  svg {
    flex-shrink: 0;
  }
`;

/* ── Status Card ── */

export const StatusCard = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`;

export const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--studio-border);
`;

export const StatusDot = styled.div<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  ${(p) => {
    switch (p.$status) {
      case "ok":
        return `background: var(--studio-green); box-shadow: 0 0 6px var(--studio-green-border);`;
      case "stale":
        return `background: var(--studio-warning, #eab308); box-shadow: 0 0 6px rgba(234, 179, 8, 0.3);`;
      case "building":
        return css`
          background: #3b82f6;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.3);
          animation: ${pulse} 1.5s ease-in-out infinite;
        `;
      default:
        return `background: var(--studio-text-muted); opacity: 0.4;`;
    }
  }}
`;

export const StatusBody = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ContextBar = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--studio-border);
  background: ${(p) =>
    p.$active ? "var(--studio-green-subtle)" : "var(--studio-bg-inset)"};
  font-size: 12px;
  font-weight: 450;
  color: ${(p) =>
    p.$active ? "var(--studio-green)" : "var(--studio-text-muted)"};
  svg {
    flex-shrink: 0;
  }
`;

export const ResultBar = styled.div<{ $success: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid
    ${(p) =>
      p.$success ? "var(--studio-green-border)" : "var(--studio-error)"};
  background: ${(p) =>
    p.$success ? "var(--studio-green-subtle)" : "var(--studio-error-subtle)"};
  color: ${(p) =>
    p.$success ? "var(--studio-green)" : "var(--studio-error)"};
  font-size: 12px;
  font-weight: 450;
`;

export const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--studio-text-muted);
  svg {
    flex-shrink: 0;
  }
`;

/* ── Helpers ── */

export type GraphStatusLabel = "ok" | "stale" | "missing" | "building";

export function formatTimeAgo(isoDate: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getGraphStatus(
  graphStatus: { exists: boolean; stale: boolean } | undefined,
  isBuilding: boolean,
): { label: GraphStatusLabel; text: string } {
  if (isBuilding) return { label: "building", text: "Building graph..." };
  if (!graphStatus?.exists)
    return { label: "missing", text: "No graph built yet" };
  if (graphStatus.stale) return { label: "stale", text: "Graph is stale" };
  return { label: "ok", text: "Graph up to date" };
}
