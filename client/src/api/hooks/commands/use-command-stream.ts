import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type {
  CommandOutputChunk,
  CommandSpec,
  CommandStatus,
  CommandStatusChange,
} from "@/api/types";
import { useProjectKeys } from "../_shared";

export interface CommandStreamState {
  runId: string | null;
  status: CommandStatus | null;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number | null;
  error: string | null;
  start: (spec: CommandSpec) => Promise<void>;
  cancel: () => Promise<void>;
  reset: () => void;
}

/**
 * Start + observe a streamed command. Spawns via `commands:streamStart`,
 * collects stdout/stderr via `commands:onOutput`, and transitions
 * through `commands:onStatus`. Invalidates the runs list on terminal
 * status so the history refreshes.
 */
export function useCommandStream(): CommandStreamState {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<CommandStatus | null>(null);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef<string | null>(null);
  runIdRef.current = runId;

  useEffect(() => {
    const unsubOutput = api.commands.onOutput((chunk: CommandOutputChunk) => {
      if (chunk.runId !== runIdRef.current) return;
      if (chunk.stream === "stdout") {
        setStdout((s) => s + chunk.chunk);
      } else {
        setStderr((s) => s + chunk.chunk);
      }
    });
    const unsubStatus = api.commands.onStatus((s: CommandStatusChange) => {
      if (s.runId !== runIdRef.current) return;
      setStatus(s.status);
      setExitCode(s.exitCode);
      setDurationMs(s.durationMs);
      if (
        s.status === "done" ||
        s.status === "error" ||
        s.status === "cancelled" ||
        s.status === "timeout"
      ) {
        queryClient.invalidateQueries({ queryKey: keys.commandRuns() });
      }
    });
    return () => {
      unsubOutput();
      unsubStatus();
    };
  }, [queryClient, keys]);

  const reset = useCallback(() => {
    setRunId(null);
    setStatus(null);
    setStdout("");
    setStderr("");
    setExitCode(null);
    setDurationMs(null);
    setError(null);
  }, []);

  const start = useCallback(
    async (spec: CommandSpec): Promise<void> => {
      reset();
      const result = await api.commands.streamStart(spec);
      if ("error" in result) {
        setError(result.error.message);
        setStatus("error");
        return;
      }
      setRunId(result.runId);
      setStatus("running");
    },
    [reset],
  );

  const cancel = useCallback(async (): Promise<void> => {
    if (!runIdRef.current) return;
    await api.commands.cancel(runIdRef.current);
  }, []);

  return {
    runId,
    status,
    stdout,
    stderr,
    exitCode,
    durationMs,
    error,
    start,
    cancel,
    reset,
  };
}
