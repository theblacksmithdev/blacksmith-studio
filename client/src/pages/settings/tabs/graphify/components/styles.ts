import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

export type GraphStatusLabel = "ok" | "stale" | "missing" | "building";

export const StatusBadge = styled.div<{ $status: GraphStatusLabel }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  ${(p) => {
    switch (p.$status) {
      case "ok":
        return `background: var(--studio-green-subtle); color: var(--studio-green); border: 1px solid var(--studio-green-border);`;
      case "stale":
        return `background: var(--studio-warning-subtle, rgba(234, 179, 8, 0.08)); color: var(--studio-warning, #eab308); border: 1px solid var(--studio-warning-border, rgba(234, 179, 8, 0.2));`;
      case "building":
        return `background: var(--studio-blue-subtle); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2);`;
      default:
        return `background: var(--studio-bg-surface); color: var(--studio-text-muted); border: 1px solid var(--studio-border);`;
    }
  }}
`;

export const ResultBanner = styled.div<{ $success: boolean }>`
  padding: 10px 14px;
  border-radius: 8px;
  background: ${(p) =>
    p.$success ? "var(--studio-green-subtle)" : "var(--studio-error-subtle)"};
  border: 1px solid
    ${(p) =>
      p.$success ? "var(--studio-green-border)" : "var(--studio-error)"};
  font-size: 12px;
  color: ${(p) =>
    p.$success ? "var(--studio-green)" : "var(--studio-error)"};
`;

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
