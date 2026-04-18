import { formatDistanceToNow } from "date-fns";
import { Terminal } from "lucide-react";
import type { CommandRunRecord } from "@/api/types";
import {
  MetaDot,
  RowBody,
  RowMeta,
  RowShell,
  RowTitle,
  StatusBadge,
  ToolchainTile,
} from "./styles";

interface CommandRunRowProps {
  run: CommandRunRecord;
  selected?: boolean;
  onOpen: (runId: string) => void;
}

/**
 * Single command run row — toolchain tile + command text + meta +
 * status badge. Selected row gets the accent strip + surface tint
 * (matches the artifact list aesthetic).
 */
export function CommandRunRow({ run, selected, onOpen }: CommandRunRowProps) {
  const argv = safeJoinArgs(run.args);
  const age = safeDistance(run.startedAt);
  const duration =
    run.durationMs != null ? formatDuration(run.durationMs) : null;

  const label = run.preset
    ? `${run.preset}${argv ? ` ${argv}` : ""}`
    : `${basename(run.command)}${argv ? ` ${argv}` : ""}`;

  return (
    <RowShell
      onClick={() => onOpen(run.id)}
      $selected={!!selected}
      aria-pressed={!!selected}
    >
      <ToolchainTile>
        <Terminal size={15} />
      </ToolchainTile>
      <RowBody>
        <RowTitle>{label}</RowTitle>
        <RowMeta>
          <span>{run.toolchainId}</span>
          <MetaDot />
          <span>{run.scope}</span>
          {duration && (
            <>
              <MetaDot />
              <span>{duration}</span>
            </>
          )}
          <MetaDot />
          <span>{age}</span>
        </RowMeta>
      </RowBody>
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
