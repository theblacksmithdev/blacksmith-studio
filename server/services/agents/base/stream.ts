import type { AiStreamHandle } from "../../ai/index.js";
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

/**
 * Mutable chunk-processing state shared between the onChunk callback
 * (consumed inside the Ai provider) and the finalizeStream call that
 * awaits completion. Callers build it via `createChunkHandler`.
 */
export interface ChunkState {
  fullResponse: string;
  toolCalls: ToolCallRecord[];
  firstMessageEmitted: boolean;
  settled: boolean;
}

export interface StreamExecutionOptions {
  handle: AiStreamHandle;
  state: ChunkState;
  execution: AgentExecution;
  emit: EmitFn;
  processResult: ProcessResultFn;
}

/**
 * Build a chunk handler + initial state for streaming an agent execution.
 * The handler is passed to `ai.stream({ onChunk })` so parsed NDJSON events
 * flow back into our agent-level emit/response-tracking logic.
 */
export function createChunkHandler(
  execution: AgentExecution,
  emit: EmitFn,
  evaluateHandoff: EvaluateHandoffFn,
): { onChunk: (chunk: any) => void; state: ChunkState } {
  const state: ChunkState = {
    fullResponse: "",
    toolCalls: [],
    firstMessageEmitted: false,
    settled: false,
  };

  const onChunk = (chunk: any) => {
    if (state.settled) return;
    handleChunk(chunk, execution, state, emit, evaluateHandoff);
  };

  return { onChunk, state };
}

/**
 * Await the Ai stream, finalize the execution record, and emit the terminal
 * event. Never throws — failures are captured on `execution.error`.
 */
export async function finalizeStream(
  opts: StreamExecutionOptions,
): Promise<AgentExecution> {
  const { handle, state, execution, emit, processResult } = opts;

  const finish = (status: AgentStatus, error?: string) => {
    if (state.settled) return;
    state.settled = true;
    execution.status = status;
    execution.error = error ?? null;
    execution.responseText = state.fullResponse;
    execution.completedAt = new Date().toISOString();
    execution.durationMs =
      Date.now() - new Date(execution.startedAt).getTime();
  };

  try {
    await handle.promise;
  } catch (err: any) {
    finish("error", err?.message ?? String(err));
    emit(
      { type: "error", error: execution.error!, recoverable: false },
      execution,
    );
    return execution;
  }

  if (state.settled) return execution;

  try {
    const summary = await processResult(
      execution,
      state.fullResponse,
      state.toolCalls,
    );
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

  return execution;
}

function handleChunk(
  chunk: any,
  execution: AgentExecution,
  state: ChunkState,
  emit: EmitFn,
  evaluateHandoff: EvaluateHandoffFn,
): void {
  if (chunk.type === "assistant") {
    const contentBlocks = chunk.message?.content || [];

    for (const block of contentBlocks) {
      if (block.type === "text") {
        state.fullResponse += block.text;
        emit(
          {
            type: "message",
            content: block.text,
            isPartial: !chunk.stop_reason,
          },
          execution,
        );

        if (!state.firstMessageEmitted) {
          const description = describeMessageStart(block.text);
          if (description) {
            state.firstMessageEmitted = true;
            emit({ type: "activity", description }, execution);
          }
        }
      } else if (block.type === "tool_use") {
        state.toolCalls.push({
          toolId: block.id,
          toolName: block.name,
          input: block.input,
        });
        emit(
          {
            type: "tool_use",
            toolId: block.id,
            toolName: block.name,
            input: block.input,
          },
          execution,
        );
        emit(
          { type: "activity", description: describeToolUse(block.name, block.input) },
          execution,
        );
      }
    }

    if (chunk.stop_reason) {
      const handoff = evaluateHandoff(state.fullResponse, state.toolCalls);
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
