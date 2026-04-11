import styled from '@emotion/styled'
import { type RunnerStatus, statusColor } from '@/stores/runner-store'

/* ── Status dot ── */

export const StatusDot = styled.span<{ status: RunnerStatus; size?: number }>`
  width: ${({ size }) => size ?? 6}px;
  height: ${({ size }) => size ?? 6}px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ status }) => statusColor(status)};
  ${({ status }) =>
    status === 'starting' ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
`

/* ── Port label ── */

export const PortLabel = styled.span`
  font-size: 12px;
  color: var(--studio-text-tertiary);
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace;
`

/* ── Log line coloring ── */

export function getLineColor(line: string): string {
  if (/error|Error|ERROR|Traceback|Exception/i.test(line)) return 'var(--studio-error)'
  if (/warn|Warning|WARNING|WARN/i.test(line)) return 'var(--studio-warning)'
  if (/\s(4\d{2}|5\d{2})\s/.test(line)) return 'var(--studio-error)'
  if (/\s(2\d{2}|3\d{2})\s/.test(line)) return 'var(--studio-text-primary)'
  if (line.startsWith('[studio]')) return 'var(--studio-text-tertiary)'
  if (/https?:\/\//.test(line)) return 'var(--studio-link)'
  return 'var(--studio-text-primary)'
}

/* ── Monospace font stack ── */

export const MONO_FONT = "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace"
