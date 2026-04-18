import { Terminal, X } from "lucide-react";
import { useCommandRunQuery } from "@/api/hooks/commands";
import { PanelEmptyState } from "@/components/shared/panel-empty-state";
import { Tooltip } from "@/components/shared/tooltip";
import {
  DetailActions,
  DetailBody,
  DetailHeader,
  DetailHeaderTop,
  DetailIconButton,
  DetailMeta,
  DetailRoot,
  DetailTile,
  DetailTitle,
  DetailTitleBlock,
  FieldGrid,
  FieldLabel,
  FieldValue,
  MetaDot,
  MutedEmpty,
  Preformatted,
  SectionHeader,
  StatusBadge,
} from "./styles";

interface CommandRunDetailProps {
  runId: string | null;
  onClose?: () => void;
}

/**
 * Right-pane detail of a single command run.
 *
 * All content is DB-backed so reload reproduces the view exactly.
 * Empty state shows when no run is selected (matches the artifact
 * detail empty-state pattern).
 */
export function CommandRunDetail({ runId, onClose }: CommandRunDetailProps) {
  const { data: run, isLoading } = useCommandRunQuery(runId ?? undefined);

  if (!runId) {
    return (
      <DetailRoot>
        <PanelEmptyState
          icon={<Terminal size={22} />}
          title="Select a command"
          description="Pick one from the list to see its stdout, stderr, resolved environment, and timing."
        />
      </DetailRoot>
    );
  }

  if (isLoading && !run) {
    return (
      <DetailRoot>
        <PanelEmptyState
          icon={<Terminal size={22} />}
          title="Loading run"
          description="Fetching the audit row for this command."
        />
      </DetailRoot>
    );
  }

  if (!run) {
    return (
      <DetailRoot>
        <PanelEmptyState
          icon={<Terminal size={22} />}
          title="Run not found"
          description="It may have been pruned. Pick another from the list."
        />
      </DetailRoot>
    );
  }

  const argv = safeJoinArgs(run.args);
  const title = run.preset
    ? `${run.preset}${argv ? ` ${argv}` : ""}`
    : `${run.command}${argv ? ` ${argv}` : ""}`;

  return (
    <DetailRoot>
      <DetailHeader>
        <DetailHeaderTop>
          <DetailTile>
            <Terminal size={18} />
          </DetailTile>

          <DetailTitleBlock>
            <DetailTitle>{title}</DetailTitle>
            <DetailMeta>
              <StatusBadge $status={run.status}>{run.status}</StatusBadge>
              <span>{run.toolchainId}</span>
              <MetaDot />
              <span>{run.scope}</span>
              {run.durationMs != null && (
                <>
                  <MetaDot />
                  <span>{formatDuration(run.durationMs)}</span>
                </>
              )}
              {run.exitCode != null && (
                <>
                  <MetaDot />
                  <span>exit {run.exitCode}</span>
                </>
              )}
            </DetailMeta>
          </DetailTitleBlock>

          <DetailActions>
            {onClose && (
              <Tooltip content="Close">
                <DetailIconButton onClick={onClose} aria-label="Close run">
                  <X size={15} />
                </DetailIconButton>
              </Tooltip>
            )}
          </DetailActions>
        </DetailHeaderTop>
      </DetailHeader>

      <DetailBody>
        <FieldGrid>
          {run.preset && (
            <>
              <FieldLabel>Preset</FieldLabel>
              <FieldValue>{run.preset}</FieldValue>
            </>
          )}
          <FieldLabel>Command</FieldLabel>
          <FieldValue>{run.command}</FieldValue>
          <FieldLabel>Args</FieldLabel>
          <FieldValue>{argv || "—"}</FieldValue>
          <FieldLabel>CWD</FieldLabel>
          <FieldValue>{run.cwd}</FieldValue>
          {run.resolvedEnvDisplay && (
            <>
              <FieldLabel>Env</FieldLabel>
              <FieldValue>{run.resolvedEnvDisplay}</FieldValue>
            </>
          )}
          <FieldLabel>Started</FieldLabel>
          <FieldValue>{formatIso(run.startedAt)}</FieldValue>
          {run.finishedAt && (
            <>
              <FieldLabel>Finished</FieldLabel>
              <FieldValue>{formatIso(run.finishedAt)}</FieldValue>
            </>
          )}
          {run.agentRole && (
            <>
              <FieldLabel>Agent</FieldLabel>
              <FieldValue>{run.agentRole}</FieldValue>
            </>
          )}
          {run.conversationId && (
            <>
              <FieldLabel>Conversation</FieldLabel>
              <FieldValue>{run.conversationId}</FieldValue>
            </>
          )}
        </FieldGrid>

        <SectionHeader>stdout</SectionHeader>
        {run.stdout ? (
          <Preformatted>{run.stdout}</Preformatted>
        ) : (
          <MutedEmpty>(empty)</MutedEmpty>
        )}

        <SectionHeader>stderr</SectionHeader>
        {run.stderr ? (
          <Preformatted>{run.stderr}</Preformatted>
        ) : (
          <MutedEmpty>(empty)</MutedEmpty>
        )}
      </DetailBody>
    </DetailRoot>
  );
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

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const remaining = Math.round(s - m * 60);
  return `${m}m ${remaining}s`;
}

function formatIso(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
