import styled from "@emotion/styled";
import {
  Globe,
  Server,
  Terminal,
  Container,
  Box,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { RunnerStatus, statusColor } from "@/stores/runner-store";

/* ── Icon lookup for dynamic service icons ── */

const ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe,
  server: Server,
  terminal: Terminal,
  container: Container,
  box: Box,
  cpu: Cpu,
};

export function getServiceIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Server;
}

/* ── Status dot ── */

export const StatusDot = styled.span<{ status: RunnerStatus; size?: number }>`
  width: ${({ size }) => size ?? 6}px;
  height: ${({ size }) => size ?? 6}px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ status }) => statusColor(status)};
  ${({ status }) =>
    status === RunnerStatus.Starting
      ? "animation: pulse 1.5s ease-in-out infinite;"
      : ""}
`;

/* ── Port label ── */

export const PortLabel = styled.span`
  font-size: 12px;
  color: var(--studio-text-tertiary);
  font-family:
    "SF Mono", "Fira Code", "JetBrains Mono", Menlo, Consolas, monospace;
`;

/* ── Log line coloring ── */

export function getLineColor(line: string): string {
  if (/error|Error|ERROR|Traceback|Exception/i.test(line))
    return "var(--studio-error)";
  if (/warn|Warning|WARNING|WARN/i.test(line)) return "var(--studio-warning)";
  if (/\s(4\d{2}|5\d{2})\s/.test(line)) return "var(--studio-error)";
  if (/\s(2\d{2}|3\d{2})\s/.test(line)) return "var(--studio-text-primary)";
  if (line.startsWith("[studio]")) return "var(--studio-text-tertiary)";
  if (/https?:\/\//.test(line)) return "var(--studio-link)";
  return "var(--studio-text-primary)";
}

/* ── Monospace font stack ── */

export const MONO_FONT =
  "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace";
