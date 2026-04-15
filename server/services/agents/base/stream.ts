import type { ChildProcess } from "node:child_process";
import { createNdjsonParser } from "../../claude/ndjson-parser.js";
import { describeToolUse, describeMessageStart } from "../utils/activity.js";
import type { AgentStatus, AgentExecution, AgentEventData } from "../types.js";
import type { ToolCallRecord, HandoffDescriptor } from "./types.js";

type EmitFn = (data: AgentEventData, execution: AgentExecution) => void;
type ProcessResultFn = (
  execution: AgentExecution,
  fullResponse: string,
  toolCalls: ToolCallRecord[],
) => string | Promise<string>;
type EvaluateHandoffFn = (
  fullResponse: string,
  toolCalls: ToolCallRecord[],
) => HandoffDescriptor | null;

interface StreamOptions {
  proc: ChildProcess;
  execution: AgentExecution;
  emit: EmitFn;
  processResult: ProcessResultFn;
  evaluateHandoff: EvaluateHandoffFn;
  getSettled: () => boolean;
  setSettled: (v: boolean) => void;
}

/**
 * Streams the Claude CLI process, parses NDJSON, emits events, and
 * returns the final execution record. Never throws — errors are
 * captured in execution.error so callers don't need try/catch.
 */
export function streamExecution(opts: StreamOptions): Promise<AgentExecution> {
  const {
    proc,
    execution,
    emit,
    processResult,
    evaluateHandoff,
    getSettled,
    setSettled,
  } = opts;

  return new Promise((resolve) => {
    let fullResponse = "";
    const toolCalls: ToolCallRecord[] = [];
    let stderrBuffer = "";
    let firstMessageEmitted = false;

    const finish = (status: AgentStatus, error?: string) => {
      if (getSettled()) {
        resolve(execution);
        return;
      }
      setSettled(true);

      execution.status = status;
      execution.error = error ?? null;
      execution.responseText = fullResponse;
      execution.completedAt = new Date().toISOString();
      execution.durationMs =
        Date.now() - new Date(execution.startedAt).getTime();
    };

    const parser = createNdjsonParser((chunk: any) => {
      if (getSettled()) return;
      handleChunk(
        chunk,
        execution,
        fullResponse,
        toolCalls,
        emit,
        evaluateHandoff,
        firstMessageEmitted,
        (text) => {
          fullResponse += text;
        },
        () => {
          firstMessageEmitted = true;
        },
      );
    });

    proc.stdout!.on("data", (data: Buffer) => parser.write(data.toString()));
    proc.stderr!.on("data", (data: Buffer) => {
      stderrBuffer += data.toString();
    });

    proc.on("error", (err) => {
      finish("error", `Spawn failed: ${err.message}`);
      emit(
        { type: "error", error: execution.error!, recoverable: false },
        execution,
      );
      resolve(execution);
    });

    proc.on("close", async (code) => {
      parser.flush();

      if (getSettled()) {
        resolve(execution);
        return;
      }

      if (code !== 0 && code !== null) {
        const error = stderrBuffer.trim() || `Process exited with code ${code}`;
        finish("error", error);
        emit({ type: "error", error, recoverable: false }, execution);
        resolve(execution);
        return;
      }

      try {
        const summary = await processResult(execution, fullResponse, toolCalls);
        finish("done");
        emit(
          {
            type: "done",
            costUsd: execution.costUsd,
            durationMs: execution.durationMs,
            summary,
          },
          execution,
        );
      } catch (err: any) {
        finish("error", `Result processing failed: ${err.message}`);
        emit(
          { type: "error", error: execution.error!, recoverable: false },
          execution,
        );
      }

      resolve(execution);
    });
  });
}

function handleChunk(
  chunk: any,
  execution: AgentExecution,
  fullResponse: string,
  toolCalls: ToolCallRecord[],
  emit: EmitFn,
  evaluateHandoff: EvaluateHandoffFn,
  firstMessageEmitted: boolean,
  appendResponse: (text: string) => void,
  markFirstMessage: () => void,
): void {
  if (chunk.type === "assistant") {
    const contentBlocks = chunk.message?.content || [];

    for (const block of contentBlocks) {
      if (block.type === "text") {
        appendResponse(block.text);
        emit(
          {
            type: "message",
            content: block.text,
            isPartial: !chunk.stop_reason,
          },
          execution,
        );

        if (!firstMessageEmitted) {
          const description = describeMessageStart(block.text);
          if (description) {
            markFirstMessage();
            emit({ type: "activity", description }, execution);
          }
        }
      } else if (block.type === "tool_use") {
        const record: ToolCallRecord = {
          toolId: block.id,
          toolName: block.name,
          input: block.input,
        };
        toolCalls.push(record);
        emit(
          {
            type: "tool_use",
            toolId: block.id,
            toolName: block.name,
            input: block.input,
          },
          execution,
        );

        const description = describeToolUse(block.name, block.input);
        emit({ type: "activity", description }, execution);
      }
    }

    if (chunk.stop_reason) {
      const handoff = evaluateHandoff(fullResponse, toolCalls);
      if (handoff) {
        emit(
          {
            type: "handoff",
            targetRole: handoff.targetRole,
            reason: handoff.reason,
            context: handoff.context,
          },
          execution,
        );
      }
    }
  } else if (chunk.type === "result") {
    execution.costUsd = chunk.cost_usd ?? 0;
    execution.durationMs = chunk.duration_ms ?? 0;
  }
}
