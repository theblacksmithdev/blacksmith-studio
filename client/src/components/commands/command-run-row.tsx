import { formatDistanceToNow } from "date-fns";
import type { CommandRunRecord } from "@/api/types";
import {
  RowMeta,
  RowShell,
  RowTitle,
  StatusBadge,
} from "./styles";

interface CommandRunRowProps {
  run: CommandRunRecord;
  onOpen: (runId: string) => void;
}

/**
 * Single command run row — toolchain chip, command invocation,
 * duration, status pill, relative time.
 */
export function CommandRunRow({ run, onOpen }: CommandRunRowProps) {
  const argv = safeJoinArgs(run.args);
  const age = safeDistance(run.startedAt);
  const durationLabel =
    run.durationMs != null ? `${formatDuration(run.durationMs)}` : "—";

  return (
    <RowShell onClick={() => onOpen(run.id)}>
      <div style={{ minWidth: 0 }}>
        <RowTitle>
          {run.preset ? `${run.preset} ` : ""}
          {basename(run.command)}
          {argv ? ` ${argv}` : ""}
        </RowTitle>
        <RowMeta>
          <span>{run.toolchainId}</span>
          <span>·</span>
          <span>{run.scope}</span>
          {run.resolvedEnvDisplay && (
            <>
              <span>·</span>
              <span>{run.resolvedEnvDisplay}</span>
            </>
          )}
          <span>·</span>
          <span>{durationLabel}</span>
          <span>·</span>
          <span>{age}</span>
        </RowMeta>
      </div>
      <StatusBadge $status={run.status}>{run.status}</StatusBadge>
    </RowShell>
  );
}

function basename(p: string): string {
  const parts = p.split("/");
  return parts[parts.length - 1] || p;
}

function safeJoinArgs(argsJson: string): string {
  try {
    const parsed = JSON.parse(argsJson);
    if (!Array.isArray(parsed)) return "";
    return parsed.map(String).join(" ");
  } catch {
    return "";
  }
}

function safeDistance(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const remaining = Math.round(s - m * 60);
  return `${m}m ${remaining}s`;
}
