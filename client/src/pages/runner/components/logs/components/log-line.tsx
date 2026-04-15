import styled from "@emotion/styled";
import { type LogEntry } from "@/stores/runner-store";
import { getLineColor, MONO_FONT } from "@/components/runner/runner-primitives";

const Line = styled.div`
  display: flex;
  gap: 8px;
  padding: 1px 14px;

  &:hover {
    background: var(--studio-bg-surface);
  }
`;

const Timestamp = styled.span`
  width: max-content;
  flex-shrink: 0;
  color: var(--studio-text-muted);
  font-size: 11px;
  padding-top: 3px;
  font-family: ${MONO_FONT};
`;

const Source = styled.span`
  width: max-content;
  flex-shrink: 0;
  color: var(--studio-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  padding-top: 3px;
  letter-spacing: 0.02em;
`;

const Text = styled.span`
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
`;

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface LogLineProps {
  entry: LogEntry;
  showTimestamp?: boolean;
}

export function LogLine({ entry, showTimestamp }: LogLineProps) {
  return (
    <Line>
      {showTimestamp && <Timestamp>{formatTime(entry.timestamp)}</Timestamp>}
      <Source>{entry.name}</Source>
      <Text style={{ color: getLineColor(entry.line) }}>{entry.line}</Text>
    </Line>
  );
}
